import React from "react";
import icon from "../Images/icon-w.png";
import Loading from "../Components/Loading";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import Cookies from "js-cookie";

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

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = { redirect: false, loading: false, strength: 0 };
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.password = React.createRef();
  }

  submit(e) {
    e.preventDefault();
    const password = this.password.current.value;
    this.setState({ loading: true });
    (async () => {
      const mfkdf = window.mfkdf;
      const outer = this.props.user.key;
      const inner = Object.values(outer.outputs)[0];
      await inner.recoverFactor(await mfkdf.setup.factors.password(password));
      outer.policy.factors[0].params = inner.policy;
      const authKey = (await outer.ISO9798CCFKey()).toString("hex");
      const time = Date.now();
      const auth = await SHA256(authKey + time);
      Cookies.remove(this.props.user.email);
      axios
        .post("/api/login?email=" + encodeURIComponent(this.props.user.email), {
          auth,
          time,
          policy: outer.policy,
        })
        .then((res) => {
          this.setState({ redirect: true });
        })
        .catch((err) => {
          const msg =
            err.response && err.response.data ? err.response.data : err.message;
          this.setState({ loading: false, error: msg });
        });
    })();
  }

  validate() {
    if (this.password.current.value.length === 0) {
      this.setState({ strength: 0 });
    } else {
      const res = zxcvbn(this.password.current.value);
      const str = Math.min(res.guesses_log10 / 10, 1) * 100;
      this.setState({ strength: str });
    }
  }

  render() {
    if (!this.props.user.key) {
      return <Navigate to="/login" />;
    }
    if (this.state.redirect) {
      return <Navigate to="/remember" />;
    }

    return (
      <div className="splash-bg">
        <div className="bg-image"></div>
        <div className="form text-center">
          <img className="logo" src={icon} alt="MFKDF" />
          <div className="card text-start">
            {this.state.loading ? (
              <Loading />
            ) : (
              <>
                <h2 className="text-center">Update your password</h2>
                <form action="" onSubmit={this.submit}>
                  <div className="mt-3">
                    <label htmlFor="email" className="form-label">
                      Current Password
                    </label>
                    <input
                      value="password"
                      className="form-control"
                      readOnly
                      disabled
                      type="password"
                    />
                  </div>
                  <div className="mt-3">
                    <label htmlFor="email" className="form-label">
                      New Password
                    </label>
                    <input
                      onChange={this.validate}
                      ref={this.password}
                      type="password"
                      className={
                        this.state.strength === 100
                          ? "form-control is-valid"
                          : "form-control"
                      }
                      placeholder="Choose a password"
                    />
                    {this.state.strength > 0 && (
                      <>
                        <div className="progress strength mt-2">
                          <div
                            className={
                              this.state.strength === 100
                                ? "progress-bar bg-success"
                                : this.state.strength >= 50
                                ? "progress-bar bg-warning"
                                : "progress-bar bg-danger"
                            }
                            style={{ width: this.state.strength + "%" }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <Link to="/dashboard">
                        <button
                          type="button"
                          className="mt-3 btn btn-light w-100 m-0"
                        >
                          Cancel &nbsp;<i className="fa fa-circle-xmark"></i>
                        </button>
                      </Link>
                    </div>
                    <div className="col-6">
                      <button
                        disabled={!(this.state.strength === 100)}
                        type="submit"
                        className="mt-3 btn btn-success w-100 m-0"
                      >
                        Update &nbsp;<i className="fa fa-check-circle"></i>
                      </button>
                    </div>
                  </div>
                </form>
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

export default ChangePassword;
