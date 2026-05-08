import React from "react";
import "./Results.css";

const mockResults = [
  {
    id: "1",
    formTitle: "User Feedback Form",
    submittedAt: "2026-05-08",
    answers: {
      "How do you rate the product?": "8/10",
      "What should we improve?": "Faster loading",
    },
  },
  {
    id: "2",
    formTitle: "Registration Form",
    submittedAt: "2026-05-07",
    answers: {
      Name: "John Doe",
      Email: "john@gmail.com",
    },
  },
];

export default function Results() {
  const results = mockResults;

  return (
    <div className="results-page">
      <div className="results-header">
        <h1>Results Dashboard</h1>
        <p>Overview of all form submissions</p>
      </div>

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
                  <span className="date">{item.submittedAt}</span>
                </div>

                <span className="badge">Response</span>
              </div>

              <div className="answers">
                {Object.entries(item.answers).map(([question, answer]) => (
                  <div key={question} className="answer-row">
                    <div className="question">{question}</div>
                    <div className="answer">{answer}</div>
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