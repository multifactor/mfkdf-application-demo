import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import "./index.scss";

import Register from "./Pages/Register";
import Setup from "./Pages/Setup";
import Entropy from "./Pages/Entropy";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Remember from "./Pages/Remember";
import RecoverPassword from "./Pages/RecoverPassword";
import RecoverTOTP from "./Pages/RecoverTOTP";
import ChangePassword from "./Pages/ChangePassword";
import ChangeTOTP from "./Pages/ChangeTOTP";
import Logout from "./Pages/Logout";

const root = ReactDOM.createRoot(document.getElementById("root"));

const user = {};

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/setup" element={<Setup user={user} />} />
        <Route path="/entropy" element={<Entropy user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/login" element={<Login user={user} />} />
        <Route path="/remember" element={<Remember user={user} />} />
        <Route
          path="/recoverpassword"
          element={<RecoverPassword user={user} />}
        />
        <Route path="/recovertotp" element={<RecoverTOTP user={user} />} />
        <Route
          path="/changepassword"
          element={<ChangePassword user={user} />}
        />
        <Route path="/changetotp" element={<ChangeTOTP user={user} />} />
        <Route path="/logout" element={<Logout user={user} />} />
        <Route path="/" element={<Home user={user} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
