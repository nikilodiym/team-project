import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchForms(currentUser.uid);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const fetchForms = async (uid) => {
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

  if (loading) return <div className="dashboard">Loading...</div>;

  if (!user) {
    return (
      <div className="dashboard">
        <h2>You are not logged in</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <img src={user.photoURL} alt="avatar" />
        <div>
          <h2>{user.displayName}</h2>
          <p>{user.email}</p>
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
              <h4>{form.title}</h4>
              <p>{form.description}</p>

              <a href={`/editor/${form.id}`}>Open</a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
