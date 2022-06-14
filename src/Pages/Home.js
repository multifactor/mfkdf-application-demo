import React from 'react';
import { Link, Navigate } from "react-router-dom";
import icon from '../Images/icon-w.png';

class Home extends React.Component {
  render() {
    if (this.props.user.key) {
      return <Navigate to="/dashboard" />
    }

    return <div className="splash-bg">
      <div className="bg-image"></div>
      <div className="form text-center">
        <img className="logo" src={icon} alt="MFKDF" />
        <div className="card text-start">
          <h2 className="text-center">MFKDF Application Demo</h2>
          <p className="mt-3 mb-3">This application provides strong centralized password management functionality powered by multi-factor key derivation with advanced key derivation policies, factor persistence, self-service key recovery, MFKDF-based authentication, and end-to-end encryption.</p>
          <a href="https://github.com/multifactor/mfkdf" target="_blank" rel="noreferrer">GitHub repository for MFKDF <i className="fa-solid fa-arrow-up-right-from-square"></i></a>
          <a href="https://github.com/multifactor/mfkdf-application-demo" className="mb-3" target="_blank"  rel="noreferrer">GitHub repository for this demo <i className="fa-solid fa-arrow-up-right-from-square"></i></a>
          <Link to="/register" className="btn btn-success m-0 mt-2"><i className="fa fa-user-plus" />&nbsp; Sign Up</Link>
          <Link to="/login" className="btn btn-light m-0 mt-2"><i className="fa fa-right-to-bracket" />&nbsp; Log In</Link>
        </div>
      </div>
      <div className="warning">
        <i className="fa fa-triangle-exclamation"></i>&nbsp; This application is for demo purposes only.
      </div>
    </div>;
  }
}

export default Home;
