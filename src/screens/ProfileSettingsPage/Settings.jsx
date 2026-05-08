import React from "react";
import "./Settings.css";
import { auth } from "../../firebase";

export default function Settings() {
  const user = auth.currentUser;

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h1>Profile Settings</h1>

        <div className="profile-section">
          <img src={user?.photoURL} alt="avatar" className="settings-avatar" />

          <div>
            <h2>{user?.displayName}</h2>

            <p>{user?.email}</p>
          </div>
        </div>

        <div className="settings-info">
          <div className="info-box">
            <span>Name</span>

            <input type="text" value={user?.displayName || ""} readOnly />
          </div>

          <div className="info-box">
            <span>Email</span>

            <input type="text" value={user?.email || ""} readOnly />
          </div>

          <div className="info-box">
            <span>User ID</span>

            <input type="text" value={user?.uid || ""} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}
