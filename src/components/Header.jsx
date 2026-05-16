import React, { useState } from "react";
import "./Header.css";
import { Menu, Search, Grid3X3, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Google_Forms_logo_(2014-2020).svg.png";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate("/");
  };

  const avatarUrl = user?.photoUrl;
  const displayName = user?.displayName || user?.email;

  return (
    <>
      <header className="header">
        <div className="header-left">
          <Menu className="icon" onClick={() => setOpen(true)} />

          <div className="logo-block">
            <div>
              <img src={logo} alt="logo" className="logo" />
            </div>
            <h1>Форми</h1>
          </div>
        </div>

        <div className="search-block">
          <Search className="search-icon" />
          <input type="text" placeholder="Пошук" />
        </div>

        <div className="header-right">
          <Grid3X3 className="icon" />

          {!isAuthenticated ? (
            <Link to="/login" className="login-btn">
              Увійти
            </Link>
          ) : (
            <div className="profile-wrapper">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="avatar"
                  onClick={() => setProfileOpen(!profileOpen)}
                />
              ) : (
                <button
                  type="button"
                  className="avatar avatar-placeholder"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  {displayName?.[0]?.toUpperCase() || "U"}
                </button>
              )}

              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-info">
                    {avatarUrl ? <img src={avatarUrl} alt="" /> : <div className="avatar avatar-placeholder">{displayName?.[0]}</div>}
                    <div>
                      <h4>{displayName}</h4>
                      <p>{user?.email}</p>
                    </div>
                  </div>

                  <Link to="/dashboard" onClick={() => setProfileOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/editor" onClick={() => setProfileOpen(false)}>
                    Create Form
                  </Link>
                  <Link to="/results" onClick={() => setProfileOpen(false)}>
                    Results / Analytics
                  </Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}>
                    Settings
                  </Link>

                  <button type="button" onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className={`overlay ${open ? "active" : ""}`} onClick={() => setOpen(false)} />

      <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-top">
          <h2>Меню</h2>
          <X className="close-icon" onClick={() => setOpen(false)} />
        </div>

        <nav className="sidebar-links">
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link to="/features" onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link to="/FAQ" onClick={() => setOpen(false)}>
            FAQ
          </Link>
          <Link to="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
          <Link to="/templates" onClick={() => setOpen(false)}>
            Templates
          </Link>
        </nav>
      </div>
    </>
  );
}
