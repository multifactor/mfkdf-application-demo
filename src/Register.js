import React from 'react';
import icon from './icon-w.png';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.email = React.createRef();
    this.submit = this.submit.bind(this);
  }

  submit(e) {
    e.preventDefault();
    console.log(this.email.current.value)
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
              <label htmlFor="email" className="form-label">Email address</label>
              <input ref={this.email} type="email" className="form-control" id="email" placeholder="Enter your email address" required />
            </div>
            <button className="btn btn-success mt-3 mb-0 w-100" type="submit">Continue &nbsp;<i className="fa fa-arrow-right" /></button>
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
