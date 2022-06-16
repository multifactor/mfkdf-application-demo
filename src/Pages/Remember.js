import React from "react";
import icon from "../Images/icon-w.png";
import { Navigate, Link } from "react-router-dom";
import Loading from "../Components/Loading";
import Cookies from "js-cookie";

class Remember extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, redirect: false };
    this.remember = this.remember.bind(this);
  }

  remember() {
    this.setState({ loading: true });
    (async () => {
      const factor = Object.values(this.props.user.key.outputs)[0]
        .persistFactor("totp")
        .toString("hex");
      Cookies.set(this.props.user.email, factor);
      this.setState({ redirect: true });
    })();
  }

  render() {
    if (!this.props.user.key) {
      return <Navigate to="/login" />;
    }
    if (this.state.redirect || Cookies.get(this.props.user.email)) {
      return <Navigate to="/dashboard" />;
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
                <h2 className="text-center">Remember this device?</h2>
                <p className="mt-3">
                  If you choose to remember this device, you won't have to use
                  two-factor authentication (TOTP) when you sign in from now on.
                  You'll still need your username and password every time you
                  sign in.
                </p>
                <div className="row mt-3">
                  <div className="col-6">
                    <Link to="/dashboard">
                      <button className="btn btn-danger w-100 m-0">
                        Don't Remember &nbsp;
                        <i className="fa fa-circle-xmark"></i>
                      </button>
                    </Link>
                  </div>
                  <div className="col-6">
                    <button
                      className="btn btn-success w-100 m-0"
                      onClick={this.remember}
                    >
                      Remember &nbsp;<i className="fa fa-check-circle"></i>
                    </button>
                  </div>
                </div>
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

export default Remember;
