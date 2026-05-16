import React from "react";
import { Link } from "react-router-dom";
import "./Settings.css";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="settings-page">
        <p>
          <Link to="/login">Увійдіть</Link>, щоб переглянути налаштування
        </p>
      </div>
    );
  }

  const avatarUrl = user?.photoUrl;
  const displayName = user?.displayName || "—";

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h1>Profile Settings</h1>

        <div className="profile-section">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="settings-avatar" />
          ) : (
            <div className="settings-avatar settings-avatar-placeholder">
              {displayName[0]?.toUpperCase()}
            </div>
          )}

          <div>
            <h2>{displayName}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="settings-info">
          <div className="info-box">
            <span>Name</span>
            <input type="text" value={displayName} readOnly />
          </div>
          <div className="info-box">
            <span>Email</span>
            <input type="text" value={user?.email || ""} readOnly />
          </div>
          <div className="info-box">
            <span>User ID</span>
            <input type="text" value={user?.id || ""} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}
