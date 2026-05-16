import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Results.css";
import { useAuth } from "../../context/AuthContext";
import { getResponses } from "../../api/responses";

export default function Results() {
  const { isAuthenticated } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await getResponses();
        setResults(data);
      } catch (err) {
        setError(err.message || "Не вдалося завантажити відповіді");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="results-page">
        <p>
          <Link to="/login">Увійдіть</Link>, щоб переглянути результати
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="results-page">Завантаження...</div>;
  }

  return (
    <div className="results-page">
      <div className="results-header">
        <h1>Results Dashboard</h1>
        <p>Overview of all form submissions</p>
      </div>

      {error && <p className="results-error">{error}</p>}

      {results.length === 0 ? (
        <div className="empty">
          <h3>No responses yet</h3>
          <p>Submitted data will appear here</p>
        </div>
      ) : (
        <div className="results-grid">
          {results.map((item) => (
            <div key={item.id} className="result-card">
              <div className="card-top">
                <div>
                  <h2>{item.formTitle}</h2>
                  <span className="date">
                    {new Date(item.submittedAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <span className="badge">Response</span>
              </div>

              <div className="answers">
                {item.answers.map((answer) => (
                  <div key={answer.questionId} className="answer-row">
                    <div className="question">{answer.questionTitle}</div>
                    <div className="answer">
                      {answer.answerText ||
                        (answer.selectedOptions?.length
                          ? answer.selectedOptions.join(", ")
                          : "—")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
