import React, { useState, useEffect } from "react"; // Додано useEffect
import { Link } from "react-router-dom"; // Додано Link
import "./Header.css";
import { Menu, Search, Grid3X3, X } from "lucide-react";
import logo from "../assets/Google_Forms_logo_(2014-2020).svg.png";
import { auth, loginWithGoogle, logout, db } from "../firebase";

import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [forms, setForms] = useState([]);

  const [user, setUser] = useState(null);

  // Виводимо змінні користувача безпосередньо зі стану user
  const isAuthenticated = !!user;
  const avatarUrl = user?.photoURL;
  const displayName = user?.displayName;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchUserForms(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserForms = async (uid) => {
    try {
      const q = query(collection(db, "forms"), where("ownerId", "==", uid));
      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setForms(data);
    } catch (err) {
      console.log("Error loading forms:", err);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
    } else {
      const results = forms.filter(
        (form) =>
          form.title?.toLowerCase().includes(value.toLowerCase()) ||
          form.description?.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results.slice(0, 5));
    }
  };

  const handleSelectResult = (formId) => {
    window.location.href = `/editor/${formId}`;
    setSearchQuery("");
    setSearchResults([]);
  };

  // Додано функцію для логауту
  const handleLogout = async () => {
    try {
      await logout();
      setProfileOpen(false);
    } catch (err) {
      console.error("Помилка під час виходу:", err);
    }
  };

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

          <input
            type="text"
            placeholder="Пошук"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((form) => (
                <div
                  key={form.id}
                  className="search-result-item"
                  onClick={() => handleSelectResult(form.id)}
                >
                  <div>
                    <h4>{form.title}</h4>
                    <p>{form.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" />
                    ) : (
                      <div className="avatar avatar-placeholder">
                        {displayName?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <h4>{displayName || "Користувач"}</h4>
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

      <div
        className={`overlay ${open ? "active" : ""}`}
        onClick={() => setOpen(false)}
      />

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