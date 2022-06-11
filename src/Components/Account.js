import React from 'react';

class Account extends React.Component {
  render() {
    return (
      <div className="col-4">
        <div className="card account">
          <div className="splash" style={{backgroundColor: '#212529'}}>
            <div className="icon">
              <img src={"https://logo.clearbit.com/" + this.props.data.site + "?size=50"} alt={this.props.data.site} />
            </div>
          </div>
          <div className="info">
            <h3 className="m-0">{this.props.data.name}</h3>
            <div className="input-group mt-2 pt-1">
              <span className="input-group-text"><i className="fa fa-user fa-fw" /></span>
              <input type="text" className="form-control" value={this.props.data.user} readOnly />
            </div>
            <div className="input-group mt-2">
              <span className="input-group-text"><i className="fa fa-key fa-fw" /></span>
              <input type="text" className="form-control" value={this.props.data.pass} readOnly />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Account;
