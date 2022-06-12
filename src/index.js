import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import './index.scss';

import Register from './Pages/Register';
import Setup from './Pages/Setup';
import Entropy from './Pages/Entropy';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';

const root = ReactDOM.createRoot(document.getElementById('root'));

const user = {}

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/setup" element={<Setup user={user} />} />
        <Route path="/entropy" element={<Entropy user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/login" element={<Login user={user} />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
