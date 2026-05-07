import React, { useState } from "react";
import "./FAQ.css";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const faqData = [
    {
      question: "Чи можна створювати форми без реєстрації?",
      answer:
        "Так, ви можете створювати та переглядати форми без реєстрації, але для збереження потрібен акаунт.",
    },
    {
      question: "Чи підтримуються готові шаблони?",
      answer:
        "Так, сервіс має готові шаблони для опитувань, анкет, тестів та форм зворотного зв’язку.",
    },
    {
      question: "Чи можна ділитися формою через посилання?",
      answer:
        "Так, після створення форми ви отримаєте спеціальне посилання для відправки іншим користувачам.",
    },
    {
      question: "Чи доступний сервіс на телефоні?",
      answer: "Так, сайт адаптований для мобільних пристроїв та планшетів.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <h1>FAQ</h1>

      <div className="faq-container">
        {faqData.map((item, index) => (
          <div className="faq-item" key={index}>
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              <h3>{item.question}</h3>

              <ChevronDown
                className={`arrow ${activeIndex === index ? "rotate" : ""}`}
              />
            </div>

            <div
              className={`faq-answer ${activeIndex === index ? "show" : ""}`}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
