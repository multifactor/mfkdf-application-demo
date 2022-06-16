import React from "react";
import icon from "../Images/icon-w.png";
import pbkdf from "../Images/entropy-pbkdf.png";
import mfkdf from "../Images/entropy-mfkdf.png";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { Link } from "react-router-dom";
TimeAgo.addDefaultLocale(en);

class Entropy extends React.Component {
  render() {
    const inner = Object.values(this.props.user.key.outputs)[0];
    const pbkdf2EntropyBits = Math.log2(
      inner.outputs.password.strength.guesses
    );
    const mfkdfEntropyBits = this.props.user.key.entropyBits.real;
    const totpEntropyBits = Math.log2(10 ** 6);
    const recovery = Object.values(inner.outputs).filter((a) => a.key)[0];
    const resetEntropyBits = recovery.entropyBits.real;

    const timeAgo = new TimeAgo("en-US");

    return (
      <div className="splash-bg">
        <div className="bg-image"></div>
        <div className="form text-center wide">
          <img className="logo" src={icon} alt="MFKDF" />
          <div className="card text-start">
            <div className="position-relative">
              <div className="arrow-circle">
                <i className="fa fa-arrow-right"></i>
              </div>
              <div className="row text-center align-items-center mb-4 ">
                <div className="col-2 text-end">
                  <p class="m-0">{Math.round(pbkdf2EntropyBits)} bits</p>
                </div>
                <div className="col-2">
                  <img src={pbkdf} width="100%" alt="PBKDF" />
                </div>
                <div className="col-2 text-start">
                  <p class="m-0">{Math.round(pbkdf2EntropyBits)} bits</p>
                </div>
                <div className="col-2 text-end">
                  <p class="m-0">{Math.round(pbkdf2EntropyBits)} bits</p>
                  <p class="midsp">{Math.round(totpEntropyBits)} bits</p>
                  <p class="m-0">{Math.round(resetEntropyBits)} bits</p>
                </div>
                <div className="col-2">
                  <img src={mfkdf} width="100%" alt="MBKDF" />
                </div>
                <div className="col-2 text-start">
                  <p class="m-0">{Math.round(mfkdfEntropyBits)} bits</p>
                </div>
              </div>
              <div className="row text-center">
                <div className="col-6">
                  <p>
                    <b>
                      Password Derived Key: {Math.round(pbkdf2EntropyBits)} bits
                    </b>
                  </p>
                  <p>
                    <i>
                      That would take an attacker about{" "}
                      {timeAgo
                        .format(Date.now() + 2 ** pbkdf2EntropyBits)
                        .replace("in", "")}{" "}
                      to crack at 1,000 attempts per second.
                    </i>
                  </p>
                </div>
                <div className="col-6">
                  <p>
                    <b>
                      Multi-Factor Derived Key: {Math.round(mfkdfEntropyBits)}{" "}
                      bits
                    </b>
                  </p>
                  <p>
                    <i>
                      That would take an attacker about{" "}
                      {timeAgo
                        .format(Date.now() + 2 ** mfkdfEntropyBits)
                        .replace("in", "")}{" "}
                      to crack at 1,000 attempts per second.
                    </i>
                  </p>
                </div>
              </div>
            </div>
            <Link to="/dashboard">
              <button className="mt-3 btn btn-success w-100 m-0">
                Finish Setup &nbsp;<i className="fa fa-check-circle"></i>
              </button>
            </Link>
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

export default Entropy;
