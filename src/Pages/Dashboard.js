import React from 'react';
import Loading from '../Components/Loading';
import Account from '../Components/Account';
import axios from 'axios';
import logo from '../Images/icon-w.png';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: false,
      modal: false,
      autocomplete: false,
      site: false,
      valid: false
    }
    this.state.data = [
      {
        id: 'abc',
        name: 'Facebook',
        site: 'facebook.com',
        user: 'user@email.com',
        pass: '12345'
      },
      {
        id: 'xyz',
        name: 'Google',
        site: 'google.com',
        user: 'user@email.com',
        pass: '12345'
      }
    ]
    this.searchBar = React.createRef();
    this.user = React.createRef();
    this.pass = React.createRef();
    this.search = this.search.bind(this);
    this.choose = this.choose.bind(this);
    this.validate = this.validate.bind(this);
    this.create = this.create.bind(this);
  }

  search() {
    const query = this.searchBar.current.value;
    if (query.length === 0) {
      this.setState({autocomplete: false})
    } else {
      axios.get('https://autocomplete.clearbit.com/v1/companies/suggest?query=' + query).then((res) => {
        this.setState({autocomplete: res.data})
      })
    }
  }

  choose(site) {
    return () => {
      const valid = (this.pass.current.value.length > 0 && this.user.current.value.length > 0);
      this.setState({autocomplete: false, site: site, valid: valid})
    }
  }

  validate() {
    const valid = (this.pass.current.value.length > 0 && this.user.current.value.length > 0 && this.state.site);
    this.setState({valid: valid})
  }

  create(e) {
    e.preventDefault();
    this.setState({loading: true});
    (async () => {
      const account = {
        name: this.state.site.name,
        site: this.state.site.domain,
        user: this.user.current.value,
        pass: this.pass.current.value
      };
      const plaintext = JSON.stringify(account);
      const ciphertext = await this.props.user.key.encrypt(plaintext, 'aes256');
      const auth = await this.props.user.key.ISO97981PassUnilateralAuthCCF(ciphertext);
      console.log(ciphertext);
      console.log(auth);
    })();
  }

  render() {
    return <>
      <nav className="navbar navbar-expand-lg fixed-top navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/"><img src={logo} alt="MFKDF" height="30" />&nbsp; MFKDF Demo</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
            <form className="d-flex"><button type="button" className="btn btn-light my-2 my-sm-0" onClick={() => {this.setState({modal: true})}}><i className="fa fa-plus"></i>&nbsp; Add Password</button></form>
          </div>
        </div>
      </nav>
      <div className="dashboard">
        <div className="container mt-5">
          {this.state.data ?
            <div className="row">
              {this.state.data.map(account => <Account data={account} key={account.id} />)}
            </div>
          : <Loading />}
        </div>
      </div>
      <div className={this.state.modal ? "modal fade show d-block" : "modal fade"}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Password</h5>
              <button onClick={() => {this.setState({modal: false})}} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="" onSubmit={this.create}>
              <div className="modal-body">
                {this.state.site ? <>
                  <div className="site-chosen">
                    <div className="input-group m-0">
                      <span className="input-group-text"><i className="fa fa-search fa-fw invisible" />
                      <img src={this.state.site.logo + "?size=24"} alt={this.state.site.domain} /></span>
                      <input value={this.state.site.name + " (" + this.state.site.domain + ")"} readOnly type="text" className="form-control" placeholder="Enter the site name" />
                      <button className="btn btn-outline-secondary" type="button" onClick={() => {this.setState({site: false, valid: false})}}><i className="fa fa-times" /></button>
                    </div>
                  </div>
                </> : <>
                  <div className="input-group m-0">
                    <span className="input-group-text"><i className="fa fa-search fa-fw" /></span>
                    <input ref={this.searchBar} onChange={this.search} type="text" className="form-control" placeholder="Enter the site name" />
                  </div>
                  {this.state.autocomplete && <div className="list-group">
                    {this.state.autocomplete.map(site => <button key={site.domain} type="button" onClick={this.choose(site)} className="list-group-item list-group-item-action">
                      <div className="row align-items-center">
                        <div className="col-1">
                          <img src={site.logo + "?size=24"} alt={site.domain} />
                        </div>
                        <div className="col-6 text-start text-truncate">
                          {site.name}
                        </div>
                        <div className="col-5 text-end text-muted text-truncate">
                          {site.domain}
                        </div>
                      </div>
                    </button>)}
                  </div>}
                </>}
                <div className="input-group mt-2">
                  <span className="input-group-text"><i className="fa fa-user fa-fw" /></span>
                  <input ref={this.user} onChange={this.validate} type="text" className="form-control" placeholder="Enter your username" />
                </div>
                <div className="input-group mt-2">
                  <span className="input-group-text"><i className="fa fa-key fa-fw" /></span>
                  <input ref={this.pass} onChange={this.validate} type="text" className="form-control" placeholder="Enter your password" />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => {this.setState({modal: false})}} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" disabled={!this.state.valid} className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div onClick={() => {this.setState({modal: false})}} className={this.state.modal ? "modal-backdrop fade show" : "modal-backdrop fade d-none"}></div>
    </>;
  }
}

export default Dashboard;
