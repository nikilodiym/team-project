import React, { useState, useEffect } from "react";
import "./FormEditor.css";
import { uploadImageToFirebase, db, saveFormToFirestore } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function FormEditor({ onClose }) {
  const { id } = useParams();
  const navigate = useNavigate(); // Для перенаправлення після збереження

  const [formTitle, setFormTitle] = useState("Форма без назви");
  const [formBanner, setFormBanner] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchForm = async () => {
      if (id) {
        const docRef = doc(db, "forms", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormTitle(data.title || "Форма без назви");
          setFormBanner(data.banner || "");
          setQuestions(data.questions || []);
        }
      } else {
        // Дефолтне питання для нової форми
        setQuestions([
          { title: "", type: "radio", options: ["Варіант 1"], correctAnswers: [] }
        ]);
      }
      setLoading(false);
    };
    fetchForm();
  }, [id]);

  const validationSizeImage = async (file, path) =>{
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("Розмір зображення не повинен перевищувати 2MB.");
      return false;
    }
    return await uploadImageToFirebase(File, path);

  }

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await validationSizeImage(file, "banners");
      if (url) setFormBanner(url);
    }

    };

  const handleQuestionImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const url = await validationSizeImage(file, "questions");
      if (url) {
        const newQ = [...questions];
        newQ[index].image = url;
        setQuestions(newQ);
      }
    }
  };

  // Функція для збереження або оновлення
  const saveForm = async () => {
    try {
      if (id) {
        // ОНОВЛЕННЯ існуючої форми
        const docRef = doc(db, "forms", id);
        await updateDoc(docRef, {
          title: formTitle,
          banner: formBanner,
          questions: questions
        });
        alert("Зміни збережено!");
      } else {
        // СТВОРЕННЯ нової форми
        await saveFormToFirestore(formTitle, questions, formBanner);
        alert("Форму створено!");
      }
      navigate("/"); // Повертаємось на головну
    } catch (error) {
      console.error("Помилка при збереженні:", error);
    }
  };
  

  // const updateTitle = (value, index) => {
  //   const newQ = [...questions];
  //   newQ[index].title = value;
  //   setQuestions(newQ);
  // };

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

  // const deleteQuestion = (index) => {
  //   const newQ = questions.filter((_, i) => i !== index);
  //   setQuestions(newQ);
  // };

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

  
  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }
  return (
    <div className="editor">
      <div className="banner-upload-section">
        {formBanner && <img src={formBanner} alt="Banner" className="form-banner-preview" />}
        <label className="upload-label">
          {formBanner ? "🔄 Змінити банер" : "🖼️ Додати банер форми"}
          <input type="file" accept="image/*" onChange={handleBannerChange} style={{ display: "none" }} />
        </label>
        {formBanner && (
          <button className="delete-img-btn" onClick={() => setFormBanner("")}>Видалити банер</button>
        )}
      </div>
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
              {/* Кнопка додавання фото до питання */}
                <label className="icon-btn-upload">
                  📷
                  <input type="file" accept="image/*" onChange={(e) => handleQuestionImageChange(e, i)} style={{ display: "none" }} />
                </label>

              {/* Відображення завантаженого фото у питанні */}
              {q.image && (
                <div className="question-image-container">
                  <img src={q.image} alt="Question" className="question-img-preview" />
                  <button className="delete-img-btn" onClick={() => {
                    const newQ = [...questions];
                    newQ[i].image = ""; // Видаляємо лінк
                    setQuestions(newQ);
                  }}>Видалити фото</button>
                </div>
              )}
              

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
