import React from 'react';
import icon from '../Images/icon-w.png';
import Loading from '../Components/Loading';
import axios from 'axios';
import { Link, Navigate } from "react-router-dom";
import Cookies from 'js-cookie';
import QRCode from "react-qr-code";

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

class ChangeTOTP extends React.Component {
  constructor(props) {
    super(props);
    this.state = { redirect: false, loading: true, strength: 0, totpStatus: 0 };
    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.totp = React.createRef();
  }

  async componentDidMount() {
    const mfkdf = window.mfkdf;
    const outer = this.props.user.key;
    const inner = Object.values(outer.outputs)[0];
    await inner.recoverFactor(
      await mfkdf.setup.factors.totp({
        issuer: 'MFKDF Demo',
        label: this.props.user.email
      })
    );
    outer.policy.factors[0].params = inner.policy;
    this.setState({loading: false, totp: inner.outputs.totp});
  }

  submit(e) {
    e.preventDefault();
    this.setState({loading: true});
    (async () => {
      const outer = this.props.user.key;
      const authKey = (await outer.ISO9798CCFKey()).toString('hex');
      const time = Date.now();
      const auth = await SHA256(authKey + time);
      Cookies.remove(this.props.user.email);
      axios.post('/api/login?email=' + encodeURIComponent(this.props.user.email), {
        auth, time, policy: outer.policy
      }).then((res) => {
        this.setState({redirect: true});
      }).catch((err) => {
        const msg = (err.response && err.response.data) ? err.response.data : err.message;
        this.setState({loading: false, error: msg});
      })
    })();
  }

  validate(e) {
    if (this.totp.current.value.length >= 6) {
      const code = window.otplib.totp.generate(this.state.totp.secret);
      if (code === this.totp.current.value) {
        this.setState({totpStatus: 1})
      } else {
        this.setState({totpStatus: -1})
      }
      if (this.totp.current.value.length > 6) {
        e.preventDefault()
        this.totp.current.value = this.totp.current.value.substr(0,6)
      }
    } else {
      this.setState({totpStatus: 0})
    }
  }

  render() {
    if (!this.props.user.key) {
      return <Navigate to="/login" />
    }
    if (this.state.redirect) {
      return <Navigate to="/remember" />
    }

    return <div className="splash-bg">
      <div className="bg-image"></div>
      <div className="form text-center">
        <img className="logo" src={icon} alt="MFKDF" />
        <div className="card text-start">
          {this.state.loading ? <Loading /> : <>
            <h2 className="text-center">Update your TOTP 2FA</h2>
            <p className="mb-0 mt-3">Use an app like Google Authenticator to scan this QR code, then enter the 6-digit code below to confirm.</p>
            {this.state.totp && <QRCode value={this.state.totp.uri} className="qr mt-4 mb-4" size={192} />}
            <form action="" onSubmit={this.submit} autoComplete="off">
              <input name="totp" maxLength="6" id="totp" onChange={this.validate} ref={this.totp} type="number" className={this.state.totpStatus === 0 ? "form-control mt-2" : (this.state.totpStatus === 1 ? "form-control mt-2 is-valid" : "form-control mt-2 is-invalid")} placeholder="Type your 6-digit OTP" data-lpignore="true" />
              <div className="row">
                <div className="col-6">
                  <Link to="/dashboard"><button type="button" className="mt-3 btn btn-light w-100 m-0">Cancel &nbsp;<i className="fa fa-circle-xmark"></i></button></Link>
                </div>
                <div className="col-6">
                  <button disabled={this.state.totpStatus !== 1} type="submit" className="mt-3 btn btn-success w-100 m-0">Update &nbsp;<i className="fa fa-check-circle"></i></button>
                </div>
              </div>
            </form>
          </>}
        </div>
      </div>
      <div className="warning">
        <i className="fa fa-triangle-exclamation"></i>&nbsp; This application is for demo purposes only.
      </div>
    </div>;
  }
}

export default ChangeTOTP;
