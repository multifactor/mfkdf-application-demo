import React from "react";
import icon from "../Images/icon-w.png";
import Loading from "../Components/Loading";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const validateUUID = (uuid) => {
  return uuid.match(
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  );
};

function SHA256(string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest("SHA-256", utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  });
}

class RecoverPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailValid: validateEmail(
        new URLSearchParams(window.location.search).get("e")
      ),
      totpValid: false,
      emailCode: false,
      loading: false,
      success: false,
      error: false,
      register: false,
      dashboard: false,
      sq1: false,
      sq2: false,
      sq3: false,
      rc: false,
      toggle: "uuid",
    };
    this.email = React.createRef();
    this.password = React.createRef();
    this.code = React.createRef();
    this.switchuuid = React.createRef();
    this.switchsq = React.createRef();
    this.sq1 = React.createRef();
    this.sq2 = React.createRef();
    this.sq3 = React.createRef();
    this.rc = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.unremember = this.unremember.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    if (new URLSearchParams(window.location.search).get("e")) {
      this.submit();
    }
  }

  submit(e) {
    if (e) e.preventDefault();
    if (this.state.success) {
      if (
        this.state.emailCode &&
        this.state.passwordValid &&
        (this.state.rc || (this.state.sq1 && this.state.sq2 && this.state.sq3))
      ) {
        const mfkdf = window.mfkdf;
        const password = mfkdf.derive.factors.password(
          this.password.current.value
        );
        const email = mfkdf.derive.factors.ooba(this.code.current.value);

        const factors = { password, email };

        if (this.state.toggle === "uuid") {
          factors["recovery-code"] = mfkdf.derive.factors.uuid(
            this.rc.current.value
          );
        } else {
          factors.sq1 = mfkdf.derive.factors.question(this.sq1.current.value);
          factors.sq2 = mfkdf.derive.factors.question(this.sq2.current.value);
          factors.sq3 = mfkdf.derive.factors.question(this.sq3.current.value);
        }

        this.setState({ loading: true });
        (async () => {
          const derived = await mfkdf.policy.derive(this.policy, factors);
          const authKey = (await derived.ISO9798CCFKey()).toString("hex");
          const time = Date.now();
          const auth = await SHA256(authKey + time);

          axios
            .post("/api/login?email=" + encodeURIComponent(this.state.email), {
              auth,
              time,
              policy: derived.policy,
            })
            .then((res) => {
              this.props.user.email = this.state.email;
              this.props.user.key = derived;
              this.setState({ dashboard: true });
            })
            .catch((err) => {
              const msg =
                err.response && err.response.data
                  ? err.response.data
                  : err.message;
              this.setState({
                loading: false,
                error: msg,
                passwordValid: false,
                totpValid: false,
              });
            });
        })();
      }
    } else {
      if (this.state.emailValid) {
        this.setState({ loading: true });
        const email = this.email.current.value;
        axios
          .post("/api/policy?email=" + encodeURIComponent(email))
          .then((res) => {
            this.policy = res.data;
            const rec = this.policy.factors[0].params.factors[2];
            const next = rec.params.factors[0].params.next;
            const sqs = rec.params.factors[1].params.factors[1].params.factors;
            axios
              .post("https://api.mfkdf.com/email?request=" + next)
              .then((res) => {
                const totp = Cookies.get(email);
                this.setState({
                  loading: false,
                  success: true,
                  email: email,
                  totp: totp,
                  sqs: sqs,
                });
              })
              .catch((err) => {
                const totp = Cookies.get(email);
                this.setState({
                  loading: false,
                  success: true,
                  email: email,
                  totp: totp,
                  sqs: sqs,
                });
              });
          })
          .catch((err) => {
            const msg =
              err.response && err.response.data
                ? err.response.data
                : err.message;
            if (msg === "User not found") {
              this.setState({ register: email });
            } else {
              this.setState({ loading: false, error: msg, emailValid: false });
            }
          });
      }
    }
  }

  validate(e) {
    if (this.code.current && this.code.current.value.length > 6) {
      e.preventDefault();
      this.code.current.value = this.code.current.value.substr(0, 6);
    }
    this.setState({
      emailValid: this.email.current && validateEmail(this.email.current.value),
      passwordValid:
        this.password.current && this.password.current.value.length > 0,
      emailCode: this.code.current && this.code.current.value.length === 6,
      sq1: this.sq1.current && this.sq1.current.value.length > 0,
      sq2: this.sq2.current && this.sq2.current.value.length > 0,
      sq3: this.sq3.current && this.sq3.current.value.length > 0,
      rc: this.rc.current && validateUUID(this.rc.current.value),
    });
  }

  unremember() {
    Cookies.remove(this.state.email);
    this.setState({ totp: undefined });
  }

  toggle() {
    if (this.switchuuid.current.checked) {
      this.setState({ toggle: "uuid" });
    } else if (this.switchsq.current.checked) {
      this.setState({ toggle: "sq" });
    }
  }

  render() {
    if (this.state.register) {
      return (
        <Navigate
          to={"/register?e=" + encodeURIComponent(this.state.register)}
        />
      );
    }
    if (this.state.dashboard) {
      return <Navigate to="/changetotp" />;
    }
    return (
      <div className="splash-bg">
        <div className="bg-image"></div>
        <div className="form text-center wide">
          <img className="logo" src={icon} alt="MFKDF" />
          <div className="card text-start">
            {this.state.loading ? (
              <Loading />
            ) : (
              <>
                <h2 className="text-center">Recover your account</h2>
                {this.state.success ? (
                  <>
                    <form action="" onSubmit={this.submit}>
                      <div className="row">
                        <div className="col-6">
                          <div className="mt-3">
                            <label htmlFor="email" className="form-label">
                              Email address
                            </label>
                            <input
                              type="email"
                              className="form-control is-valid"
                              value={this.state.email}
                              readOnly
                            />
                          </div>
                          <div className="mt-3">
                            <label htmlFor="email" className="form-label">
                              Email confirmation code
                            </label>
                            <input
                              onChange={this.validate}
                              ref={this.code}
                              type="text"
                              className={
                                this.state.emailCode
                                  ? "form-control is-valid"
                                  : "form-control"
                              }
                              placeholder="Enter your one-time code"
                            />
                            <div className="form-text mt-1">
                              Enter the 6-letter code we just sent to your email
                              inbox.
                            </div>
                          </div>
                          <div className="mt-3">
                            <label htmlFor="email" className="form-label">
                              Password
                            </label>
                            <input
                              onChange={this.validate}
                              ref={this.password}
                              type="password"
                              className={
                                this.state.passwordValid
                                  ? "form-control is-valid"
                                  : "form-control"
                              }
                              placeholder="Enter your password"
                            />
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="mt-3">
                            <label htmlFor="email" className="form-label">
                              Recovery method
                            </label>
                            <div
                              className="btn-group w-100"
                              role="group"
                              aria-label="Basic radio toggle button group"
                            >
                              <input
                                ref={this.switchuuid}
                                onChange={this.toggle}
                                type="radio"
                                className="btn-check"
                                name="btnradio"
                                id="btnradio1"
                                autoComplete="off"
                                defaultChecked
                              />
                              <label
                                className="btn btn-outline-primary w-50"
                                htmlFor="btnradio1"
                              >
                                Recovery Code
                              </label>
                              <input
                                ref={this.switchsq}
                                onChange={this.toggle}
                                type="radio"
                                className="btn-check"
                                name="btnradio"
                                id="btnradio2"
                                autoComplete="off"
                              />
                              <label
                                className="btn btn-outline-primary w-50"
                                htmlFor="btnradio2"
                              >
                                Security Questions
                              </label>
                            </div>
                          </div>
                          {this.state.toggle === "uuid" ? (
                            <>
                              <div className="mt-3">
                                <label htmlFor="email" className="form-label">
                                  Recovery code
                                </label>
                                <input
                                  onChange={this.validate}
                                  ref={this.rc}
                                  type="text"
                                  className={
                                    this.state.rc
                                      ? "form-control is-valid"
                                      : "form-control"
                                  }
                                  placeholder="Enter your recovery code"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="mt-3">
                                <label htmlFor="email" className="form-label">
                                  {this.state.sqs[0].params.question}
                                </label>
                                <input
                                  onChange={this.validate}
                                  ref={this.sq1}
                                  type="text"
                                  className={
                                    this.state.sq1
                                      ? "form-control is-valid"
                                      : "form-control"
                                  }
                                  placeholder="Enter your answer"
                                />
                              </div>
                              <div className="mt-3">
                                <label htmlFor="email" className="form-label">
                                  {this.state.sqs[1].params.question}
                                </label>
                                <input
                                  onChange={this.validate}
                                  ref={this.sq2}
                                  type="text"
                                  className={
                                    this.state.sq2
                                      ? "form-control is-valid"
                                      : "form-control"
                                  }
                                  placeholder="Enter your answer"
                                />
                              </div>
                              <div className="mt-3">
                                <label htmlFor="email" className="form-label">
                                  {this.state.sqs[2].params.question}
                                </label>
                                <input
                                  onChange={this.validate}
                                  ref={this.sq3}
                                  type="text"
                                  className={
                                    this.state.sq3
                                      ? "form-control is-valid"
                                      : "form-control"
                                  }
                                  placeholder="Enter your answer"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        disabled={
                          !(
                            this.state.emailCode &&
                            this.state.passwordValid &&
                            (this.state.rc ||
                              (this.state.sq1 &&
                                this.state.sq2 &&
                                this.state.sq3))
                          )
                        }
                        className="btn btn-success mt-3 mb-0 w-100"
                        type="submit"
                      >
                        Continue &nbsp;
                        <i className="fa fa-arrow-right" />
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <form action="" onSubmit={this.submit}>
                      <div className="mt-3">
                        <label htmlFor="email" className="form-label">
                          Email address
                        </label>
                        <input
                          onChange={this.validate}
                          ref={this.email}
                          type="email"
                          className={
                            this.state.emailValid
                              ? "form-control is-valid"
                              : "form-control"
                          }
                          id="email"
                          placeholder="Enter your email address"
                          required
                          defaultValue={new URLSearchParams(
                            window.location.search
                          ).get("e")}
                        />
                      </div>
                      <button
                        disabled={!this.state.emailValid}
                        className="btn btn-success mt-3 mb-0 w-100"
                        type="submit"
                      >
                        Continue &nbsp;
                        <i className="fa fa-arrow-right" />
                      </button>
                    </form>
                  </>
                )}
                {this.state.error && (
                  <div className="alert alert-danger mt-3 mb-0" role="alert">
                    {this.state.error === "Invalid auth token" ? (
                      <>
                        <i className="fa fa-triangle-exclamation"></i>&nbsp;{" "}
                        <b>Error: </b>Your confirmation code, TOTP code,
                        recovery code, and/or security questions were incorrect.
                      </>
                    ) : (
                      <>
                        <i className="fa fa-triangle-exclamation"></i>&nbsp;{" "}
                        <b>Error: </b>
                        {this.state.error}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="warning">
          <i className="fa fa-triangle-exclamation"></i>&nbsp; This application
          is for demo purposes only.
        </div>
      </div>
    );
  }
}

export default RecoverPassword;
