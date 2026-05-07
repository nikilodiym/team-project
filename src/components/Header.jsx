import React, { useState } from "react";
import "./Header.css";
import { Menu, Search, Grid3X3, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <Menu className="icon" onClick={() => setOpen(true)} />

          <div className="logo-block">
            <div className="logo"></div>

            <h1>Форми</h1>
          </div>
        </div>

        <div className="search-block">
          <Search className="search-icon" />

          <input type="text" placeholder="Пошук" />
        </div>

        <div className="header-right">
          <Grid3X3 className="icon" />

          <img src="https://i.pravatar.cc/100" alt="avatar" />
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`overlay ${open ? "active" : ""}`}
        onClick={() => setOpen(false)}
      ></div>

      {/* Sidebar */}
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
