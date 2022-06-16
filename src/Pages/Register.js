import React from "react";
import icon from "../Images/icon-w.png";
import Loading from "../Components/Loading";
import axios from "axios";

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailValid: false,
      nameValid: false,
      loading: false,
      success: false,
      error: false,
    };
    this.email = React.createRef();
    this.name = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
  }

  submit(e) {
    e.preventDefault();
    this.setState({ loading: true });
    axios
      .post(
        "/api/verify?email=" +
          encodeURIComponent(this.email.current.value) +
          "&name=" +
          encodeURIComponent(this.name.current.value)
      )
      .then((res) => {
        this.setState({ loading: false, success: true });
      })
      .catch((err) => {
        const msg =
          err.response && err.response.data ? err.response.data : err.message;
        this.setState({
          loading: false,
          error: msg,
          emailValid: false,
          nameValid: false,
        });
      });
  }

  validate(e) {
    this.setState({ emailValid: validateEmail(this.email.current.value) });
    this.setState({ nameValid: this.name.current.value.length > 0 });
  }

  render() {
    var defaultEmail = null;
    const urlParams = new URLSearchParams(window.location.search);
    if (typeof urlParams.get("e") === "string") {
      defaultEmail = urlParams.get("e");
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
                {this.state.success ? (
                  <>
                    <h2 className="text-center text-success">
                      <i className="fa-solid fa-envelope-circle-check"></i>
                      &nbsp;&thinsp;Check your inbox!
                    </h2>
                    <p className="mb-0 mt-3">
                      We have sent you a link where you can complete the signup
                      process. If you don't receive an email within a few
                      minutes, check your spam folder or&thinsp;{" "}
                      <a href="/register">
                        <i className="fa-solid fa-arrows-rotate"></i>
                        &nbsp;try&nbsp;again
                      </a>
                      .
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-center">Create your account</h2>
                    <form action="" onSubmit={this.submit}>
                      <div className="mt-3">
                        <label htmlFor="name" className="form-label">
                          Full name
                        </label>
                        <input
                          onChange={this.validate}
                          ref={this.name}
                          type="text"
                          className={
                            this.state.nameValid
                              ? "form-control is-valid"
                              : "form-control"
                          }
                          id="name"
                          placeholder="Enter your name"
                          required
                        />
                      </div>
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
                          defaultValue={defaultEmail}
                        />
                      </div>
                      <button
                        disabled={
                          !(this.state.emailValid && this.state.nameValid)
                        }
                        className="btn btn-success mt-3 mb-0 w-100"
                        type="submit"
                      >
                        Continue &nbsp;
                        <i className="fa fa-arrow-right" />
                      </button>
                    </form>
                    {this.state.error && (
                      <div
                        className="alert alert-danger mt-3 mb-0"
                        role="alert"
                      >
                        <i className="fa fa-triangle-exclamation"></i>&nbsp;{" "}
                        <b>Error: </b>
                        {this.state.error}
                      </div>
                    )}
                  </>
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

export default Register;
