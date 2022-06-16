import React from "react";
import { Navigate } from "react-router-dom";

class Logout extends React.Component {
  render() {
    this.props.user.key = null;
    this.props.user.email = null;

    return <Navigate to="/" />;
  }
}

export default Logout;
