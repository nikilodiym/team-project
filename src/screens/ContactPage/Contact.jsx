import React, { useState } from "react";
import "./Contact.css";
import { Mail, Phone } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form sent:", form);
    alert("Повідомлення надіслано!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Звʼязатися з нами</h1>
        <p>
          Маєш питання або пропозицію? Напиши нам — ми відповімо якнайшвидше.
        </p>
      </div>

      <div className="contact-container">
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Ваше ім’я"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Ваше повідомлення..."
            value={form.message}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Надіслати
          </button>
        </form>

        <div className="contact-info">
          <div className="info-card">
            <Mail className="icon" />
            <h3>Email</h3>
            <p>test@formsapp.com</p>
          </div>

          <div className="info-card">
            <Phone className="icon" />
            <h3>Телефон</h3>
            <p>+380 00 000 000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
