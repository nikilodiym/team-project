import "./RecentForms.css";
import { LayoutGrid, ArrowUpDown, Folder } from "lucide-react";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

function RecentForms() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    // Створюємо запит до колекції "forms" із сортуванням за часом створення
    const q = query(collection(db, "forms"), orderBy("createdAt", "desc"));
    
    // Підписуємось на оновлення в реальному часі
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const formsData = [];
      querySnapshot.forEach((doc) => {
        formsData.push({ ...doc.data(), id: doc.id });
      });
      setForms(formsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="recent-forms">
      <div className="recent-top">
        <h2>Останні форми</h2>

        <div className="recent-actions">
          <p>Належать будь-кому ▼</p>
          <LayoutGrid className="recent-icon" />
          <ArrowUpDown className="recent-icon" />
          <Folder className="recent-icon" />
        </div>
      </div>

      <div className="forms-list">
        {forms.length > 0 ? (
          <div className="recent-forms-grid">
            {forms.map((form) => (
              <a href={`/editor/${form.id}`} key={form.id} className="recent-form-card">
                <div className="card-preview">
                  <div className="form-icon-placeholder">📄</div>
                </div>
                <div className="card-info">
                  <h4>{form.title || "Форма без назви"}</h4>
                  <div className="card-footer">
                    <span className="last-opened">
                      {/* Перевірка на існування дати, щоб уникнути помилок при рендері */}
                      Відкрито {form.createdAt?.toDate ? form.createdAt.toDate().toLocaleDateString() : "щойно"}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-block">
            <h3>Форм ще немає</h3>
            <p>Щоб почати, виберіть пусту форму або інший шаблон вище</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default RecentForms;