import React, { useState } from "react";
import "./FormEditor.css";
import { saveFormToFirestore } from "../../firebase";

export default function FormEditor({ onClose }) {
  const [questions, setQuestions] = useState([
    {
      title: "",
      type: "radio",
      options: ["Варіант 1"],
      correctAnswers: [],
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: "",
        type: "radio",
        options: ["Варіант 1"],
        correctAnswers: [],
      },
    ]);
  };

  const updateTitle = (value, index) => {
    const newQ = [...questions];
    newQ[index].title = value;
    setQuestions(newQ);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].options[optIndex] = value;
    setQuestions(newQ);
  };

  const addOption = (qIndex) => {
    const newQ = [...questions];
    newQ[qIndex].options.push("");
    setQuestions(newQ);
  };

  const deleteQuestion = (index) => {
    const newQ = questions.filter((_, i) => i !== index);
    setQuestions(newQ);
  };

  const toggleCorrectAnswer = (qIndex, optIndex) => {
    const newQ = [...questions];
    const question = newQ[qIndex];

    if (question.type === "radio") {
      question.correctAnswers = [optIndex];
    }

    if (question.type === "checkbox") {
      if (question.correctAnswers.includes(optIndex)) {
        question.correctAnswers = question.correctAnswers.filter(
          (i) => i !== optIndex,
        );
      } else {
        question.correctAnswers.push(optIndex);
      }
    }

    setQuestions(newQ);
  };

  const saveForm = async () => {
    await saveFormToFirestore("Форма без назви", questions);
  };

  return (
    <div className="editor">
      {/* HEADER */}
      <div className="editor-header">
        <div>
          <h1>Форма без назви</h1>

          <p>Опис форми</p>
        </div>

        <a href="/">
          <button className="close-btn" onClick={onClose}>
            Закрити
          </button>
        </a>
      </div>

      {/* QUESTIONS */}
      <div className="questions">
        {questions.map((q, i) => (
          <div className="question-card" key={i}>
            {/* LEFT */}
            <div className="question-main">
              <input
                className="question-input"
                placeholder="Запитання без назви"
                value={q.title}
                onChange={(e) => updateTitle(e.target.value, i)}
              />

              {q.type !== "text" && (
                <div className="options">
                  {q.options.map((opt, idx) => (
                    <div className="option" key={idx}>
                      <div
                        onClick={() => toggleCorrectAnswer(i, idx)}
                        className={
                          q.type === "checkbox"
                            ? q.correctAnswers.includes(idx)
                              ? "option-checkbox active"
                              : "option-checkbox"
                            : q.correctAnswers.includes(idx)
                              ? "option-circle active"
                              : "option-circle"
                        }
                      ></div>

                      <input
                        placeholder={`Варіант ${idx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(i, idx, e.target.value)}
                      />
                    </div>
                  ))}

                  <button
                    className="add-option-btn"
                    onClick={() => addOption(i)}
                  >
                    + Додати варіант
                  </button>
                </div>
              )}

              {q.type === "text" && (
                <div className="text-answer">Текстова відповідь</div>
              )}

              {/* FOOTER */}
              <div className="question-footer">
                <button className="icon-btn" onClick={() => deleteQuestion(i)}>
                  🗑️
                </button>

                <button className="icon-btn">📄</button>

                <button className="save-btn" onClick={saveForm}>
                  Save Form
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="question-tools">
              <select
                className="question-type"
                value={q.type}
                onChange={(e) => {
                  const newQ = [...questions];

                  newQ[i].type = e.target.value;

                  newQ[i].correctAnswers = [];

                  setQuestions(newQ);
                }}
              >
                <option value="radio">Один варіант</option>

                <option value="checkbox">Кілька варіантів</option>

                <option value="text">Текст</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* FLOAT BUTTON */}
      <button className="add-question" onClick={addQuestion}>
        +
      </button>
    </div>
  );
}
