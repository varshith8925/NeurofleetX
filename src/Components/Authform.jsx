import React, { useState } from "react";
import "./Authform.css";

function Authform() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("");

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="title">NeuroFleetX</h2>
        <p className="subtitle">AI-Driven Urban Mobility</p>

        <div className="form-toggle">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>

        {isLogin ? (
          <div className="form">
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />

            <select onChange={(e) => setRole(e.target.value)}>
              <option value="">Select Role</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
              <option value="fleet">Fleet Manager</option>
            </select>

            <a href="#">Forgot password?</a>
            <button className="main-btn">Login</button>
          </div>
        ) : (
          <div className="form">
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
            <input type="tel" placeholder="Phone number" />

            <select onChange={(e) => setRole(e.target.value)}>
              <option value="">Select Role</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
              <option value="fleet">Fleet Manager</option>
            </select>

            {/* Dynamic Fields */}
            {role === "driver" && (
              <input type="text" placeholder="Driver License Number" />
            )}

            {role === "fleet" && (
              <input type="text" placeholder="Company Name" />
            )}

            <button className="main-btn">Sign Up</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Authform;