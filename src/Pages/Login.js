import React from 'react';
import icon from '../Images/icon-w.png';
import Loading from '../Components/Loading';
import axios from 'axios';

const validateEmail = (email) => {
  return email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailValid: false,
      loading: false,
      success: false,
      error: false
    };
    this.email = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
  }

  submit(e) {
    e.preventDefault();
    if (this.state.emailValid) {
      this.setState({loading: true});
      axios.post('/api/policy?email=' + encodeURIComponent(this.email.current.value)).then((res) => {
        this.policy = res.data;
        this.setState({loading: false, success: true});
      }).catch((err) => {
        const msg = (err.response && err.response.data) ? err.response.data : err.message;
        this.setState({loading: false, error: msg, emailValid: false});
      })
    }
  }

  validate(e) {
    this.setState({emailValid: validateEmail(this.email.current.value)});
  }

  render() {
    return <div className="splash-bg">
      <div className="bg-image"></div>
      <div className="form text-center">
        <img className="logo" src={icon} alt="MFKDF" />
        <div className="card text-start">
          {this.state.loading ? <Loading /> : <>
            {this.state.success ? <>
              <h2 className="text-center text-success"><i className="fa-solid fa-envelope-circle-check"></i>&nbsp;&thinsp;Check your inbox!</h2>
              <p className="mb-0 mt-3">We have sent you a link where you can complete the signup process. If you don't receive an email within a few minutes, check your spam folder or&thinsp; <a href="/register"><i className="fa-solid fa-arrows-rotate"></i>&nbsp;try&nbsp;again</a>.</p>
            </> : <>
              <h2 className="text-center">Log in to your account</h2>
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
