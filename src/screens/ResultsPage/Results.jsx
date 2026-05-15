import React, { useState, useEffect } from "react";
import "./Results.css";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Results() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      console.log("👤 Auth state changed:", currentUser?.uid);
      setUser(currentUser);

      if (currentUser) {
        console.log("🔄 Fetching analytics for:", currentUser.uid);
        await fetchFormsWithStats(currentUser.uid);
      } else {
        console.log("❌ No user logged in");
        setResults([]);
        setError("Not logged in");
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const fetchFormsWithStats = async (uid) => {
    try {
      console.log("📊 Fetching forms for user:", uid);
      console.log("📊 Database:", db);
      console.log("📊 Auth:", auth);
      
      // Загружаємо форми користувача (спочатку за ownerId)
      const formsQuery = query(collection(db, "forms"), where("ownerId", "==", uid));
      let formsSnap = await getDocs(formsQuery);
      console.log("📋 Found forms by ownerId:", formsSnap.docs.length);

      // Якщо нічого не знайдено (старі документи могли зберігати userId), пробуємо fallback
      if (formsSnap.empty) {
        console.log("🔁 No forms for ownerId, trying userId fallback");
        const fallbackQ = query(collection(db, "forms"), where("userId", "==", uid));
        formsSnap = await getDocs(fallbackQ);
        console.log("📋 Found forms by userId:", formsSnap.docs.length);
      }

      const formsData = [];

      // Для кожної форми загружаємо responses та розраховуємо статистику
      for (const formDoc of formsSnap.docs) {
        const formId = formDoc.id;
        const formData = formDoc.data();
        console.log("📄 Processing form:", formId, formData);

        // Загружаємо responses для цієї форми
        const responsesQuery = query(
          collection(db, "responses"),
          where("formId", "==", formId)
        );
        const responsesSnap = await getDocs(responsesQuery);
        console.log(`📝 Found ${responsesSnap.docs.length} responses for form ${formId}`);

        const responses = responsesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Розраховуємо статистику
        const respondents = responses.length;
        const completionRate =
          respondents > 0
            ? Math.round((responses.filter((r) => r.completed).length / respondents) * 100)
            : 0;

        // Розраховуємо середній час заповнення (у секундах -> хвилини)
        const totalTime = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
        const avgTimeSeconds = respondents > 0 ? Math.round(totalTime / respondents) : 0;
        const minutes = Math.floor(avgTimeSeconds / 60);
        const seconds = avgTimeSeconds % 60;
        const averageTime =
          avgTimeSeconds > 0 ? `${minutes}m ${seconds}s` : "0m 0s";

        // Отримуємо перший response як приклад
        const sampleResponse = responses[0] || {};

        // Безпечна обробка дати
        let submittedAt = new Date().toLocaleDateString("uk-UA");
        if (formData.createdAt) {
          try {
            submittedAt = typeof formData.createdAt.toDate === 'function' 
              ? new Date(formData.createdAt.toDate()).toLocaleDateString("uk-UA")
              : new Date(formData.createdAt).toLocaleDateString("uk-UA");
          } catch (dateErr) {
            console.warn("⚠️ Error parsing date:", dateErr);
          }
        }

        formsData.push({
          id: formId,
          formTitle: formData.title || "Unnamed Form",
          description: formData.description || "",
          submittedAt,
          respondents,
          completionRate,
          averageTime,
          answers: sampleResponse.answers || {},
        });
      }

      console.log("✅ Final results:", formsData);
      setResults(formsData);
      setError(null);
    } catch (err) {
      console.error("❌ Error loading results:", err);
      setError(err.message || "Failed to load analytics");
      setResults([]);
    }
  };

  if (loading) return <div className="results-page">Loading...</div>;

  if (!user) {
    return (
      <div className="results-page">
        <h2>You are not logged in</h2>
      </div>
    );
  }

  const totalResponses = results.reduce((sum, r) => sum + r.respondents, 0);
  const averageCompletion =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.completionRate, 0) / results.length)
      : 0;

  return (
    <div className="results-page">
      <div className="results-header">
        <div>
          <h1>Results & Analytics</h1>
          <p>Overview of all form submissions and statistics</p>
        </div>
      </div>

      {error && (
        <div style={{
          background: "#fee",
          border: "1px solid #f88",
          color: "#c33",
          padding: "12px 16px",
          borderRadius: "6px",
          margin: "16px 20px",
          fontSize: "14px"
        }}>
          ❌ {error}
        </div>
      )}

      <div className="results-stats">
        <div className="stat-card">
          <div className="stat-value">{totalResponses}</div>
          <div className="stat-label">Total Responses</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{results.length}</div>
          <div className="stat-label">Active Forms</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{averageCompletion}%</div>
          <div className="stat-label">Avg Completion</div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty">
          <h3>No responses yet</h3>
          <p>Submitted data will appear here</p>
        </div>
      ) : (
        <div className="results-container">
          <div className="results-grid">
            {results.map((item) => (
              <div
                key={item.id}
                className={`result-card ${selectedForm?.id === item.id ? "active" : ""}`}
                onClick={() => setSelectedForm(item)}
              >
                <div className="card-top">
                  <div>
                    <h2>{item.formTitle}</h2>
                    <span className="date">{item.submittedAt}</span>
                  </div>

                  <span className="badge">{item.respondents} responses</span>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <span className="label">Completion</span>
                    <span className="value">{item.completionRate}%</span>
                  </div>

                  <div className="stat">
                    <span className="label">Avg Time</span>
                    <span className="value">{item.averageTime}</span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${item.completionRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {selectedForm && (
            <div className="results-detail">
              <div className="detail-header">
                <h2>{selectedForm.formTitle}</h2>
                <button
                  className="close-btn"
                  onClick={() => setSelectedForm(null)}
                >
                  ✕
                </button>
              </div>

              <div className="detail-stats">
                <div className="detail-stat">
                  <span className="stat-title">Total Respondents</span>
                  <span className="stat-number">{selectedForm.respondents}</span>
                </div>

                <div className="detail-stat">
                  <span className="stat-title">Completion Rate</span>
                  <span className="stat-number">{selectedForm.completionRate}%</span>
                </div>

                <div className="detail-stat">
                  <span className="stat-title">Avg Response Time</span>
                  <span className="stat-number">{selectedForm.averageTime}</span>
                </div>
              </div>

              <div className="answers">
                <h3>Sample Answers</h3>
                {Object.entries(selectedForm.answers).map(([question, answer]) => (
                  <div key={question} className="answer-row">
                    <div className="question">{question}</div>
                    <div className="answer">{answer}</div>
                  </div>
                ))}
              </div>

              <a href={`/editor/${selectedForm.id}`} className="view-details-btn">
                View Full Analytics
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}