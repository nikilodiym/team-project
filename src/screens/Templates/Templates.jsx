import React, { useEffect, useState } from "react";
import "./Templates.css";
import { FileText, Mail, UserCheck, Clipboard, Newspaper } from "lucide-react";

const formTemplates = [
  {
    id: 1,
    title: "Форма контакту",
    description: "Простий спосіб зв'язатися з вами",
    icon: Mail,
    fields: ["Ім'я", "Email", "Тема", "Повідомлення"]
  },
  {
    id: 2,
    title: "Реєстрація",
    description: "Реєстрація нового користувача",
    icon: UserCheck,
    fields: ["Ім'я", "Email", "Пароль", "Підтвердження пароля"]
  },
  {
    id: 3,
    title: "Форма зворотного зв'язку",
    description: "Отримуйте відгуки від користувачів",
    icon: Clipboard,
    fields: ["Оцінка", "Коментар", "Email (опційно)"]
  },
  {
    id: 4,
    title: "Опитування",
    description: "Збирайте дані опитування",
    icon: FileText,
    fields: ["Питання 1", "Питання 2", "Питання 3", "Коментарі"]
  },
  {
    id: 5,
    title: "Підписка на розсилку",
    description: "Збирайте адреси електронної пошти",
    icon: Newspaper,
    fields: ["Email", "Тип розсилки"]
  }
];

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedTemplate(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleCreateForm = () => {
    if (!selectedTemplate) {
      return;
    }

    console.log("Створення форми на основі шаблону:", selectedTemplate);
    setSelectedTemplate(null);
  };

  return (
    <>
      <section className="templates">
        <h2>Готові шаблони форм</h2>

        <div className="templates-grid">
          {formTemplates.map((template) => {
            const IconComponent = template.icon;

            return (
              <div
                key={template.id}
                className="template-card"
                onClick={() => handleSelectTemplate(template)}
                role="button"
                tabIndex={0}
              >
                <div className="template-icon">
                  <IconComponent size={40} />
                </div>

                <div className="template-content">
                  <h3>{template.title}</h3>
                  <p className="template-description">{template.description}</p>

                  <div className="template-fields">
                    <p className="fields-label">Поля:</p>
                    <ul>
                      {template.fields.map((field, index) => (
                        <li key={index}>{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  className="template-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelectTemplate(template);
                  }}
                >
                  Використати
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {selectedTemplate && (
        <div
          className="template-modal-overlay"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="template-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="template-modal-header">
              <div>
                <p className="template-modal-label">Створення форми</p>
                <h3>{selectedTemplate.title}</h3>
              </div>

              <button
                type="button"
                className="template-modal-close"
                onClick={() => setSelectedTemplate(null)}
              >
                ×
              </button>
            </div>

            <p className="template-modal-description">
              {selectedTemplate.description}
            </p>

            <div className="template-modal-fields">
              {selectedTemplate.fields.map((field) => (
                <label key={field} className="template-modal-field">
                  <span>{field}</span>
                  <input type="text" placeholder={`Введіть ${field.toLowerCase()}`} />
                </label>
              ))}
            </div>

            <div className="template-modal-actions">
              <button
                type="button"
                className="template-modal-secondary"
                onClick={() => setSelectedTemplate(null)}
              >
                Скасувати
              </button>

              <button
                type="button"
                className="template-modal-primary"
                onClick={handleCreateForm}
              >
                Створити форму
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
