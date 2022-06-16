import React from "react";
import axios from "axios";

function SHA256(string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest("SHA-256", utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  });
}

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = { deleted: false };
    this.delete = this.delete.bind(this);
  }

  async delete() {
    this.setState({ deleted: true });
    const authKey = (await this.props.user.key.ISO9798CCFKey()).toString("hex");
    const time = Date.now();
    const auth = await SHA256(authKey + time);
    await axios.post(
      "/api/passwords/delete?email=" +
        encodeURIComponent(this.props.user.email) +
        "&id=" +
        encodeURIComponent(this.props.data.id),
      {
        auth,
        time,
      }
    );
  }

  render() {
    if (this.state.deleted) return <></>;

    return (
      <div className="col-4 mb-4">
        <div className="card account">
          <div className="splash" style={{ backgroundColor: "#212529" }}>
            <div className="icon">
              <img
                src={
                  "https://logo.clearbit.com/" +
                  this.props.data.site +
                  "?size=50"
                }
                alt={this.props.data.site}
              />
            </div>
          </div>
          <div className="info">
            <h3 className="m-0 text-truncate">{this.props.data.name}</h3>
            <div className="input-group mt-2 pt-1">
              <span className="input-group-text">
                <i className="fa fa-user fa-fw" />
              </span>
              <input
                type="text"
                className="form-control"
                value={this.props.data.user}
                readOnly
              />
            </div>
            <div className="input-group mt-2">
              <span className="input-group-text">
                <i className="fa fa-key fa-fw" />
              </span>
              <input
                type="text"
                className="form-control"
                value={this.props.data.pass}
                readOnly
              />
            </div>
          </div>
          <button
            onClick={this.delete}
            type="button"
            className="btn-close"
          ></button>
        </div>
      </div>
    );
  }
}

export default Account;
