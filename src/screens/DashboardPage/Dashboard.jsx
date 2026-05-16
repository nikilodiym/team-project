import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext";

// Додано пропущені імпорти для Firestore та бази даних
import { db } from "../../firebase"; 
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Dashboard() {
  // Використовуємо готові дані з вашого контексту
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Перетворили на правильний useCallback
  const fetchForms = useCallback(async (uid) => {
    if (!uid) return;
    
    try {
      setLoading(true);
      // Первинний запит: ownerId (нові документи)
      const q = query(collection(db, "forms"), where("ownerId", "==", uid));
      let snap = await getDocs(q);
      console.log("📋 Dashboard found by ownerId:", snap.docs.length);

      // Фолбек: якщо старих користувачів записано через userId
      if (snap.empty) {
        const q2 = query(collection(db, "forms"), where("userId", "==", uid));
        const snap2 = await getDocs(q2);
        console.log("📋 Dashboard found by userId:", snap2.docs.length);
        snap = snap2;
      }

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setForms(data);
    } catch (err) {
      console.error("Error loading forms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Один чистий useEffect для синхронізації стану авторизації та завантаження даних
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user?.uid) {
        fetchForms(user.uid);
      } else {
        setLoading(false); // Якщо не авторизований, вимикаємо loader
      }
    }
  }, [authLoading, isAuthenticated, user, fetchForms]);

  // Спільний стан завантаження
  if (authLoading || loading) return <div className="dashboard">Loading...</div>;

  // Перевірка на авторизацію
  if (!isAuthenticated) {
    return (
      <div className="dashboard">
        <h2>Увійдіть, щоб переглянути панель</h2>
        <Link to="/login">Увійти</Link>
      </div>
    );
  }

  // Виправлено photoUrl -> photoURL
  const avatarUrl = user?.photoURL;
  const displayName = user?.displayName || user?.email;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" />
        ) : (
          <div className="dashboard-avatar-placeholder">
            {displayName?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h2>{displayName}</h2>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="stats">
        <div className="card">
          <h3>Total Forms</h3>
          <p>{forms.length}</p>
        </div>
        <div className="card">
          <h3>Last Form</h3>
          <p>{forms[0]?.title || "No forms yet"}</p>
        </div>
      </div>

      <div className="forms-section">
        <h3>Your Forms</h3>

        {forms.length === 0 ? (
          <p>No forms created yet</p>
        ) : (
          forms.map((form) => (
            <div key={form.id} className="form-card">
              {form.thumbnailUrl && (
                <img src={form.thumbnailUrl} alt="" className="dashboard-form-thumb" />
              )}
              <h4>{form.title}</h4>
              <p>{form.description}</p>
              <Link to={`/editor/${form.id}`}>Open</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}