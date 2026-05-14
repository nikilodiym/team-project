import React, { useState, useEffect } from "react";
import "./FormEditor.css";
import { db, saveFormToFirestore } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom"; // Додай цей імпорт
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function FormEditor({ onClose }) {
  const { id } = useParams();
  const navigate = useNavigate(); // Для перенаправлення після збереження
  const [formTitle, setFormTitle] = useState("Форма без назви");
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    const fetchForm = async () => {
      if (id) {
        const docRef = doc(db, "forms", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormTitle(data.title || "Форма без назви");
          setQuestions(data.questions || []);
        }
      } else {
        // Дефолтне питання для нової форми
        setQuestions([
          { title: "", type: "radio", options: ["Варіант 1"], correctAnswers: [] }
        ]);
      }
    };
    fetchForm();
  }, [id]);

  // Функція для збереження або оновлення
  const saveForm = async () => {
    try {
      if (id) {
        // ОНОВЛЕННЯ існуючої форми
        const docRef = doc(db, "forms", id);
        await updateDoc(docRef, {
          title: formTitle,
          questions: questions
        });
        alert("Зміни збережено!");
      } else {
        // СТВОРЕННЯ нової форми
        await saveFormToFirestore(formTitle, questions);
        alert("Форму створено!");
      }
      navigate("/"); // Повертаємось на головну
    } catch (error) {
      console.error("Помилка при збереженні:", error);
    }
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

  

  return (
    <div className="editor">
      {/* HEADER */}
      <div className="editor-header">
        <div className="title-section">
          <input 
            type="text" 
            className="form-title-input" 
            value={formTitle} 
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Назва форми"
          />
          <p>Опис форми</p>
        </div>

        <button className="close-btn" onClick={() => navigate("/")}>
          Закрити
        </button>
          
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
                onChange={(e) => {
                  const newQ = [...questions];
                  newQ[i].title = e.target.value;
                  setQuestions(newQ);
                }}
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
                <button className="icon-btn" onClick={() => {
                   const newQ = questions.filter((_, idx) => idx !== i);
                   setQuestions(newQ);
                }}>
                  🗑️
                </button>
                <button className="save-btn" onClick={saveForm}>
                  Зберегти все
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
      <button className="add-question" onClick={() => setQuestions([...questions, { title: "", type: "radio", options: ["Варіант 1"], correctAnswers: [] }])}>
        +
      </button>
    </div>
  );
}
