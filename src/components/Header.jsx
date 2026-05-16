import React, { useEffect, useState } from "react";
import "./Header.css";
import { Menu, Search, Grid3X3, X } from "lucide-react";
import logo from "../assets/Google_Forms_logo_(2014-2020).svg.png"
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
          <a href="/features">Features</a>
          <a href="/FAQ">FAQ</a>
          <a href="/contact">Contact</a>
          <a href="/templates">Templates</a>
        </nav>
      </div>
    </>
  );
}
