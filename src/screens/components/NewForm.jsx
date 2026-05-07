import React from "react";
import "./NewForm.css";

export default function NewForm({ onOpen }) {
  return (
    <section className="new-form">
      <h2>Нова форма</h2>
      <a href="/editor">
        <div className="form-card" onClick={onOpen}>
          <div className="plus">
            <div className="vertical"></div>
            <div className="horizontal"></div>
          </div>
        </div>
      </a>
    </section>
  );
}
