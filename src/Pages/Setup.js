import React from 'react';
import icon from '../Images/icon-w.png';
import Loading from '../Components/Loading';
import axios from 'axios';
import { Navigate } from "react-router-dom";
import zxcvbn from 'zxcvbn';
import QRCode from "react-qr-code";

class Setup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: false,
      error: false,
      strength: 0,
      page: 0,
      totpStatus: 0,
      redirect: false
    };

    this.password = React.createRef();
    this.q1 = React.createRef();
    this.a1 = React.createRef();
    this.q2 = React.createRef();
    this.a2 = React.createRef();
    this.q3 = React.createRef();
    this.a3 = React.createRef();
    this.totp = React.createRef();

    this.submit = this.submit.bind(this);
    this.validate = this.validate.bind(this);
    this.back = this.back.bind(this);
  }

  back(e) {
    e.preventDefault();
    this.setState({page: this.state.page - 1});
  }

  submit(e) {
    e.preventDefault();
    const mfkdf = window.mfkdf;
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const name = params.get('name');
    const code = params.get('code');

    if (this.state.page === 0) {
      if (this.state.strength === 100) {
        this.setState({page: 1});
      }
    } else if (this.state.page === 1) {
      if (this.state.a1 && this.state.a2 && this.state.a3) {
        this.setState({loading: true});
        (async () => {
          const pk = {"kty":"RSA","key_ops":["encrypt"],"alg":"RSA-OAEP-256","ext":true,"n":"zdtC3NLO0dTORGHzBtgsNG4TWxOL0vfiaubc78afvNCHeq8jSUzLfsfsxuQDCrvKOHk6r8s1xRlLs1nsmaOJFrWAR8pneoPdY3bYsIDfDdxMZ3nDdnsnOqQp_74ipCQYl6qmJSFaMJUzRMHjBafCr6dxZcKf4I9EKdkbDzmGANXh1MP7dZhv2MH10ZMEykyXDF-H2CrNte8gTcfVA0cq3wswfRd-Qfk7eeW2mUG1_D_ixLAZq_JrDrcBNCfsuYWX5DLgzsa_EyEE_6AvIFGI2AuZRINX0luB3NrvQiWNebXjgO3EpGOq-iwZWVw5SxnkqOwFWvaF8TcuZ8niRkQphw","e":"AQAB"};
          const publicKey = await crypto.subtle.importKey('jwk', pk, {name: 'RSA-OAEP', modulusLength: 2048, hash: 'SHA-256', publicExponent: new Uint8Array([0x01, 0x00, 0x01])}, true, ['encrypt']);
          const policy = await mfkdf.policy.setup(
            await mfkdf.policy.atLeast(2, [
              await mfkdf.setup.factors.password(this.password.current.value),
              await mfkdf.setup.factors.totp({
                issuer: 'MFKDF Demo',
                label: email
              }),
              await mfkdf.policy.and(
                await mfkdf.setup.factors.ooba({
                  id: 'email',
                  key: publicKey,
                  params: {
                    email: email,
                    name: name
                  }
                }),
                await mfkdf.policy.or(
                  await mfkdf.setup.factors.uuid({ id: 'recovery-code' }),
                  await mfkdf.policy.all([
                    await mfkdf.setup.factors.question(this.a1.current.value, {id: 'sq1', question: this.q1.current.value}),
                    await mfkdf.setup.factors.question(this.a2.current.value, {id: 'sq2', question: this.q2.current.value}),
                    await mfkdf.setup.factors.question(this.a3.current.value, {id: 'sq3', question: this.q3.current.value})
                  ])
                )
              )
            ])
          );
          this.policy = policy;
          const inner = Object.values(policy.outputs)[0];
          const totp = inner.outputs.totp;
          const recovery = Object.values(inner.outputs).filter(a => a.key)[0];
          const recoveryFactor = Object.values(recovery.outputs).filter(a => a.key)[0];
          const recoveryCode = recoveryFactor.outputs['recovery-code'].uuid;
          this.setState({loading: false, page: 2, totp: totp, rc: recoveryCode});
        })();
      }
    } else if (this.state.page === 2) {
      if (this.state.totpStatus === 1) {
        this.setState({page: 3});
      }
    } else if (this.state.page === 3) {
      this.setState({loading: true});
      axios.post('https://demo.mfkdf.com/api/register?email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(name) + '&code=' + encodeURIComponent(code), {
        authKey: this.policy.ISO9798CCFKey().toString('hex'),
        policy: this.policy.policy
      }).then((res) => {
        this.props.user.key = this.policy;
        this.setState({redirect: true});
      }).catch((err) => {
        const msg = (err.response && err.response.data) ? err.response.data : err.message;
        this.setState({loading: false, error: msg, page: 0});
      })
    }
  }

  validate(e) {
    if (this.password.current.value.length === 0) {
      this.setState({strength: 0})
    } else {
      const res = zxcvbn(this.password.current.value);
      const str = (Math.min(res.guesses_log10 / 10, 1)*100);
      this.setState({strength: str});
    }
    this.setState({
      a1: this.a1.current.value.length > 0,
      a2: this.a2.current.value.length > 0,
      a3: this.a3.current.value.length > 0
    })
    if (this.state.page === 2) {
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
  }

  render() {
    const params = new URLSearchParams(window.location.search);
    if (this.state.redirect) {
      return <Navigate to="/entropy" />;
    }

    if (!(params.has('email') && params.has('name') && params.has('code'))) {
      return <Navigate to="/register" />;
    }

    const email = params.get('email');
    const name = params.get('name');

    return <div className="splash-bg">
      <div className="bg-image"></div>
      <div className="form text-center">
        <img className="logo" src={icon} alt="MFKDF" />
        <div className="card text-start">
          <div className={this.state.loading ? "visible" : "invisible d-none"}>
            <Loading />
          </div>
          <div className={this.state.loading ? "invisible d-none" : "visible"}>
            {this.state.success ? <>
              <h2 className="text-center text-success"><i className="fa-solid fa-envelope-circle-check"></i>&nbsp;&thinsp;Check your inbox!</h2>
              <p className="mb-0 mt-3">We have sent you a link where you can complete the signup process. If you don't receive an email within a few minutes, check your spam folder or&thinsp; <a href="/register"><i className="fa-solid fa-arrows-rotate"></i>&nbsp;try&nbsp;again</a>.</p>
            </> : <>
              <div className={this.state.page === 0 ? "visible" : "invisible d-none"}>
                <h2 className="text-center">Create your account</h2>
                <form action="" onSubmit={this.submit}>
                  <div className="mt-3">
                    <label htmlFor="name" className="form-label">Full name</label>
                    <input type="text" className="form-control is-valid" id="name" placeholder="Enter your name" value={name} disabled readOnly />
                  </div>
                  <div className="mt-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control is-valid" id="email" placeholder="Enter your email address" value={email} disabled readOnly />
                  </div>
                  <div className="mt-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input ref={this.password} onChange={this.validate} type="password" className={this.state.strength === 100 ? "form-control is-valid" : "form-control"} id="password" placeholder="Create a password" />
                    {(this.state.strength > 0) && <>
                      <div className="progress strength mt-2">
                        <div className={this.state.strength === 100 ? "progress-bar bg-success" : (this.state.strength >= 50 ? "progress-bar bg-warning" : "progress-bar bg-danger")} style={{width: this.state.strength + '%'}}></div>
                      </div>
                    </>}
                  </div>
                  <button disabled={!(this.state.strength === 100)} className="btn btn-success mt-3 mb-0 w-100" type="submit">Continue &nbsp;<i className="fa fa-arrow-right" /></button>
                </form>
                <div className="row mt-3">
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '0%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '0%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '0%'}}></div></div></div>
                </div>
              </div>
              <div className={this.state.page === 1 ? "visible" : "invisible d-none"}>
                <h2 className="text-center">Setup Security Questions</h2>
                <p className="mb-0 mt-3">These questions will be used to recover your account if you forget your password or lose your 2FA device.</p>
                <form action="" onSubmit={this.submit} autoComplete="off">
                  <div className="mt-3">
                    <label className="form-label">Question 1</label>
                    <select className="form-select" ref={this.q1}>
                      <option>What is the name of your first pet?</option>
                      <option>What high school did you attend?</option>
                      <option>What is the name of your first school?</option>
                      <option>What was the make of your first car?</option>
                      <option>What was your favorite food as a child?</option>
                      <option>Where did you meet your significant other?</option>
                      <option>What is your maternal grandmother's maiden name?</option>
                    </select>
                    <input name="sq1" id="sq1" onChange={this.validate} ref={this.a1} type="text" className={this.state.a1 ? "form-control mt-2 is-valid" : "form-control mt-2"} placeholder="Type your answer" data-lpignore="true" />
                  </div>
                  <div className="mt-3">
                    <label className="form-label">Question 2</label>
                    <select className="form-select" ref={this.q2}>
                      <option>In what city were you born?</option>
                      <option>What was your childhood nickname?</option>
                      <option>What is the name of your best childhood friend?</option>
                      <option>What street did you live on in third grade?</option>
                      <option>In what city or town did your parents meet?</option>
                      <option>What is your oldest sibling's middle name?</option>
                      <option>In what city or town was your first job?</option>
                    </select>
                    <input name="sq2" id="sq2" onChange={this.validate} ref={this.a2} type="text" className={this.state.a2 ? "form-control mt-2 is-valid" : "form-control mt-2"} placeholder="Type your answer" data-lpignore="true" />
                  </div>
                  <div className="mt-3">
                    <label className="form-label">Question 3</label>
                    <select className="form-select" ref={this.q3}>
                      <option>What is your favorite college you didn't attend?</option>
                      <option>What is the first school you remember attending?</option>
                      <option>Where was your most memorable school field trip?</option>
                      <option>What was your favorite school teacher's surname?</option>
                      <option>What was the name of your first stuffed toy?</option>
                      <option>What was your driving instructor's first name?</option>
                      <option>What is your favourite sports team?</option>
                    </select>
                    <input name="sq3" id="sq3" onChange={this.validate} ref={this.a3} type="text" className={this.state.a3 ? "form-control mt-2 is-valid" : "form-control mt-2"} placeholder="Type your answer" data-lpignore="true" />
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <button onClick={this.back} className="btn btn-light mt-3 mb-0 w-100" type="button"><i className="fa fa-arrow-left" />&nbsp; Back</button>
                    </div>
                    <div className="col-6">
                      <button disabled={!(this.state.a1 && this.state.a2 && this.state.a3)} className="btn btn-success mt-3 mb-0 w-100" type="submit">Continue &nbsp;<i className="fa fa-arrow-right" /></button>
                    </div>
                  </div>
                </form>
                <div className="row mt-3">
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '0%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '0%'}}></div></div></div>
                </div>
              </div>
              <div className={this.state.page === 2 ? "visible" : "invisible d-none"}>
                <h2 className="text-center">Setup TOTP MFA</h2>
                <p className="mb-0 mt-3">Use an app like Google Authenticator to scan this QR code, then enter the 6-digit code below to confirm.</p>
                {this.state.totp && <QRCode value={this.state.totp.uri} className="qr mt-4 mb-4" size={192} />}
                <form action="" onSubmit={this.submit} autoComplete="off">
                  <input name="totp" maxLength="6" id="totp" onChange={this.validate} ref={this.totp} type="number" className={this.state.totpStatus === 0 ? "form-control mt-2" : (this.state.totpStatus === 1 ? "form-control mt-2 is-valid" : "form-control mt-2 is-invalid")} placeholder="Type your 6-digit OTP" data-lpignore="true" />
                  <div className="row">
                    <div className="col-6">
                      <button type="button" onClick={this.back} className="btn btn-light mt-3 mb-0 w-100"><i className="fa fa-arrow-left" />&nbsp; Back</button>
                    </div>
                    <div className="col-6">
                      <button disabled={this.state.totpStatus !== 1} className="btn btn-success mt-3 mb-0 w-100" type="submit">Continue &nbsp;<i className="fa fa-arrow-right" /></button>
                    </div>
                  </div>
                </form>
                <div className="row mt-3">
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '0%'}}></div></div></div>
                </div>
              </div>
              <div className={this.state.page === 3 ? "visible" : "invisible d-none"}>
                <h2 className="text-center">Save Recovery Code</h2>
                <p className="mb-0 mt-3">Store this recovery code in a secure location. It can be used to recover your account if you forget your password or lose your 2FA device.</p>
                {this.state.rc && <input type="text" className="form-control mt-3" value={this.state.rc} disabled readOnly /> }
                <form action="" onSubmit={this.submit} autoComplete="off">
                  <div className="row">
                    <div className="col-6">
                      <button type="button" onClick={this.back} className="btn btn-light mt-3 mb-0 w-100"><i className="fa fa-arrow-left" />&nbsp; Back</button>
                    </div>
                    <div className="col-6">
                      <button className="btn btn-success mt-3 mb-0 w-100" type="submit">Continue &nbsp;<i className="fa fa-arrow-right" /></button>
                    </div>
                  </div>
                </form>
                <div className="row mt-3">
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                  <div className="col-3"><div className="progress strength"><div className="progress-bar" style={{width: '100%'}}></div></div></div>
                </div>
              </div>
              {this.state.error && <div className="alert alert-danger mt-3 mb-0" role="alert">
                <i className="fa fa-triangle-exclamation"></i>&nbsp; <b>Error: </b>{this.state.error}
              </div>}
            </>}
          </div>
        </div>
      </div>
      <div className="warning">
        <i className="fa fa-triangle-exclamation"></i>&nbsp; This application is for demo purposes only.
      </div>
    </div>;
  }
}

export default Setup;
