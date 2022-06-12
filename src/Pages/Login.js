import React from 'react';
import icon from '../Images/icon-w.png';
import Loading from '../Components/Loading';
import axios from 'axios';
import { Navigate, Link } from "react-router-dom";

const validateEmail = (email) => {
  return email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

function SHA256(string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailValid: false,
      passwordValid: false,
      totpValid: false,
      loading: false,
      success: false,
      error: false,
      register: false,
      dashboard: false
    };
    this.email = React.createRef();
    this.password = React.createRef();
    this.totp = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
  }

  submit(e) {
    e.preventDefault();
    if (this.state.success) {
      if (this.state.passwordValid && this.state.totpValid) {
        const password = this.password.current.value;
        const totp = this.totp.current.value;
        this.setState({loading: true});
        (async () => {
          const mfkdf = window.mfkdf;
          const derived = await mfkdf.policy.derive(this.policy, {
            password: mfkdf.derive.factors.password(password),
            totp: mfkdf.derive.factors.totp(parseInt(totp))
          });
          const authKey = (await derived.ISO9798CCFKey()).toString('hex');
          const time = Date.now();
          const auth = await SHA256(authKey + time);

          axios.post('/api/login?email=' + encodeURIComponent(this.state.email), {
            auth, time
          }).then((res) => {
            this.props.user.email = this.state.email;
            this.props.user.key = derived;
            this.setState({dashboard: true});
          }).catch((err) => {
            const msg = (err.response && err.response.data) ? err.response.data : err.message;
            this.setState({loading: false, error: msg, passwordValid: false, totpValid: false});
          })
        })();
      }
    } else {
      if (this.state.emailValid) {
        this.setState({loading: true});
        const email = this.email.current.value;
        axios.post('/api/policy?email=' + encodeURIComponent(email)).then((res) => {
          this.policy = res.data;
          this.setState({loading: false, success: true, email: email});
        }).catch((err) => {
          const msg = (err.response && err.response.data) ? err.response.data : err.message;
          if (msg === "User not found") {
            this.setState({register: email});
          } else {
            this.setState({loading: false, error: msg, emailValid: false});
          }
        })
      }
    }
  }

  validate(e) {
    if (this.totp.current && this.totp.current.value.length > 6) {
      e.preventDefault()
      this.totp.current.value = this.totp.current.value.substr(0,6)
    }
    this.setState({
      emailValid: this.email.current && validateEmail(this.email.current.value),
      passwordValid: (this.password.current && this.password.current.value.length > 0),
      totpValid: (this.totp.current && this.totp.current.value.length === 6)
    });
  }

  render() {
    if (this.state.register) {
      return <Navigate to={"/register?e=" + encodeURIComponent(this.state.register)} />
    }
    return <div className="splash-bg">
      <div className="bg-image"></div>
      <div className="form text-center">
        <img className="logo" src={icon} alt="MFKDF" />
        <div className="card text-start">
          {this.state.loading ? <Loading /> : <>
            <h2 className="text-center">Log in to your account</h2>
            {this.state.success ? <>
              <form action="" onSubmit={this.submit}>
                <div className="mt-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input type="email" className="form-control is-valid" value={this.state.email} readOnly />
                </div>
                <div className="mt-3">
                  <label htmlFor="email" className="form-label">Password</label>
                  <input onChange={this.validate} ref={this.password} type="password" className={this.state.passwordValid ? "form-control is-valid" : "form-control"} placeholder="Enter your password" />
                  <div className="form-text mt-1"><Link to={"/recover?e=" + encodeURIComponent(this.state.email)}>Forgot password?</Link></div>
                </div>
                <div className="mt-3">
                  <label htmlFor="email" className="form-label">TOTP code</label>
                  <input onChange={this.validate} ref={this.totp} type="number" className={this.state.totpValid ? "form-control is-valid" : "form-control"} placeholder="Enter your one-time code" />
                  <div className="form-text mt-1"><Link to={"/recover?e=" + encodeURIComponent(this.state.email)}>Lost TOTP device?</Link></div>
                </div>
                <button disabled={!(this.state.passwordValid && this.state.totpValid)} className="btn btn-success mt-3 mb-0 w-100" type="submit">Continue &nbsp;<i className="fa fa-arrow-right" /></button>
              </form>
              {this.state.error && <div className="alert alert-danger mt-3 mb-0" role="alert">
                <i className="fa fa-triangle-exclamation"></i>&nbsp; <b>Error: </b>{this.state.error}
              </div>}
            </> : <>
              <form action="" onSubmit={this.submit}>
                <div className="mt-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input onChange={this.validate} ref={this.email} type="email" className={this.state.emailValid ? "form-control is-valid" : "form-control"} id="email" placeholder="Enter your email address" required />
                </div>
                <button disabled={!(this.state.emailValid)} className="btn btn-success mt-3 mb-0 w-100" type="submit">Continue &nbsp;<i className="fa fa-arrow-right" /></button>
              </form>
              {this.state.error && <div className="alert alert-danger mt-3 mb-0" role="alert">
                <i className="fa fa-triangle-exclamation"></i>&nbsp; <b>Error: </b>{this.state.error}
              </div>}
            </>}
          </>}
        </div>
      </div>
      <div className="warning">
        <i className="fa fa-triangle-exclamation"></i>&nbsp; This application is for demo purposes only.
      </div>
    </div>;
  }
}

export default Login;
