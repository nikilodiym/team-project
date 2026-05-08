import React, { useEffect, useState } from "react";
import "./Header.css";
import { Menu, Search, Grid3X3, X } from "lucide-react";
import logo from "../assets/Google_Forms_logo_(2014-2020).svg.png"
import { auth, loginWithGoogle, logout } from "../firebase";

import { onAuthStateChanged } from "firebase/auth";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <Menu className="icon" onClick={() => setOpen(true)} />

          <div className="logo-block">
            <div><img src={logo} alt="logo" className="logo" /></div>

            <h1>Форми</h1>
          </div>
        </div>

        <div className="search-block">
          <Search className="search-icon" />

          <input type="text" placeholder="Пошук" />
        </div>

        <div className="header-right">
          <Grid3X3 className="icon" />

          {!user ? (
            <button className="login-btn" onClick={loginWithGoogle}>
              Login with Google
            </button>
          ) : (
            <div className="profile-wrapper">
              <img
                src={user.photoURL}
                alt="avatar"
                className="avatar"
                onClick={() => setProfileOpen(!profileOpen)}
              />

              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-info">
                    <img src={user.photoURL} alt="" />

                    <div>
                      <h4>{user.displayName}</h4>

                      <p>{user.email}</p>
                    </div>
                  </div>

                  <a href="/dashboard">Dashboard</a>

                  <a href="/editor">Create Form</a>

                  <a href="/results">Results / Analytics</a>

                  <a href="/settings">Settings</a>

                  <button onClick={logout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div
        className={`overlay ${open ? "active" : ""}`}
        onClick={() => setOpen(false)}
      ></div>

      <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-top">
          <h2>Меню</h2>

          <X className="close-icon" onClick={() => setOpen(false)} />
        </div>

        <nav className="sidebar-links">
          <a href="/">Home</a>
          <a href="#">Features</a>
          <a href="/FAQ">FAQ</a>
          <a href="#">Contact</a>
          <a href="/templates">Templates</a>
        </nav>
      </div>
    </>
  );
}
