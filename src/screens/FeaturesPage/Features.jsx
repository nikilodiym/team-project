import React from "react";
import "./Features.css";
import { CheckCircle, Layers, Shield, Zap, Users, Palette } from "lucide-react";

export default function Features() {
  return (
    <div className="features-page">
      <div className="features-hero">
        <h1>Можливості</h1>
        <p>
          Створюй форми швидко, зручно та керуй результатами в одному місці.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <Zap className="icon" />
          <h3>Швидке створення</h3>
          <p>Створюй форми за кілька хвилин завдяки простому редактору.</p>
        </div>

        <div className="feature-card">
          <Layers className="icon" />
          <h3>Готові шаблони</h3>
          <p>Використовуй шаблони для опитувань, тестів і анкет.</p>
        </div>

        <div className="feature-card">
          <Shield className="icon" />
          <h3>Безпека даних</h3>
          <p>Усі відповіді надійно зберігаються у Firebase.</p>
        </div>

        <div className="feature-card">
          <Users className="icon" />
          <h3>Командна робота</h3>
          <p>Працюй над формами разом із командою в реальному часі.</p>
        </div>

        <div className="feature-card">
          <Palette className="icon" />
          <h3>Гнучкий дизайн</h3>
          <p>Налаштовуй вигляд форм під свій стиль і бренд.</p>
        </div>

        <div className="feature-card">
          <CheckCircle className="icon" />
          <h3>Аналітика</h3>
          <p>Переглядай результати та відповіді в зручному форматі.</p>
        </div>
      </div>
    </div>
  );
}
