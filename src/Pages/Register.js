import React from 'react';
import icon from './icon-w.png';
import axios from 'axios';

const validateEmail = (email) => {
  return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailValid: false,
      nameValid: false,
      loading: false
    };
    this.email = React.createRef();
    this.name = React.createRef();
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
  }

  submit(e) {
    e.preventDefault();
    this.setState({loading: true})
    axios.post('https://demo.mfkdf.com/api/verify?email=' + encodeURIComponent(this.email.current.value) + '&name=' + encodeURIComponent(this.name.current.value)).then((res) => {
      console.log(res)
    })
  }

  validate(e) {
    this.setState({emailValid: validateEmail(this.email.current.value)});
    this.setState({nameValid: (this.name.current.value.length > 0)});
  }

  render() {
    return <div className="splash-bg">
      <div className="bg-image"></div>
      <div className="form text-center">
        <img className="logo" src={icon} alt="MFKDF" />
        <div className="card text-start">
          <h2>Create your account</h2>
          <form action="" onSubmit={this.submit}>
            <div className="mt-3">
              <label htmlFor="name" className="form-label">Full name</label>
              <input onChange={this.validate} ref={this.name} type="text" className={this.state.nameValid ? "form-control is-valid" : "form-control"} id="name" placeholder="Enter your name" required />
            </div>
            <div className="mt-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input onChange={this.validate} ref={this.email} type="email" className={this.state.emailValid ? "form-control is-valid" : "form-control"} id="email" placeholder="Enter your email address" required />
            </div>
            <button disabled={!(this.state.emailValid && this.state.nameValid)} className="btn btn-success mt-3 mb-0 w-100" type="submit">Continue &nbsp;<i className="fa fa-arrow-right" /></button>
          </form>
        </div>
      </div>
      <div className="warning">
        <i className="fa fa-triangle-exclamation"></i>&nbsp; This application is for demo purposes only.
      </div>
    </div>;
  }
}

export default Register;
