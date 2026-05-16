import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext";
import { getForms } from "../../api/forms";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getForms({ sortBy: "createdAt", sortDir: "desc" });
      setForms(data);
    } catch (err) {
      console.error("Error loading forms:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchForms();
    }
  }, [authLoading, fetchForms]);

  if (authLoading || loading) return <div className="dashboard">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="dashboard">
        <h2>Увійдіть, щоб переглянути панель</h2>
        <Link to="/login">Увійти</Link>
      </div>
    );
  }

  const avatarUrl = user?.photoUrl;
  const displayName = user?.displayName || user?.email;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" />
        ) : (
          <div className="dashboard-avatar-placeholder">{displayName?.[0]?.toUpperCase()}</div>
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
