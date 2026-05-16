import React, { useState, useEffect, useRef } from "react";
import "./FormEditor.css";
import { uploadImageToFirebase, db, saveFormToFirestore } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext"; // Додано імпорт контексту

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Отримуємо статус авторизації

  // Відновлені стейти, які зникли під час мержу
  const [formTitle, setFormTitle] = useState("Форма без назви");
  const [description, setDescription] = useState(""); 
  const [formBanner, setFormBanner] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(""); 
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 
  const [uploading, setUploading] = useState(false); 

  const fileInputRef = useRef(null); // Відновлено реф для прев'ю

  // Хелпер для створення дефолтного питання
  const defaultQuestion = () => ({
    title: "",
    type: "radio",
    options: ["Варіант 1"],
    correctAnswers: []
  });

  useEffect(() => {
    const fetchForm = async () => {
      if (id) {
        const docRef = doc(db, "forms", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormTitle(data.title || "Форма без назви");
          setDescription(data.description || "");
          setFormBanner(data.banner || "");
          setThumbnailUrl(data.thumbnailUrl || "");
          setQuestions(data.questions || []);
        }
      } else {
        // Дефолтне питання для нової форми
        setQuestions([defaultQuestion()]);
      }
      setLoading(false);
    };

    fetchForm();
  }, [id]);

  // Виправлено помилку з File -> file
  const validationSizeImage = async (file, path) => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("Розмір зображення не повинен перевищувати 2MB.");
      return false;
    }
    return await uploadImageToFirebase(file, path);
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await validationSizeImage(file, "banners");
      if (url) setFormBanner(url);
    }
  };

  // Додано пропущену функцію для зміни мініатюри (thumbnail)
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const url = await validationSizeImage(file, "thumbnails");
      if (url) setThumbnailUrl(url);
      setUploading(false);
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

  const saveForm = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSaving(true);

    try {
      if (id) {
        // ОНОВЛЕННЯ існуючої форми
        const docRef = doc(db, "forms", id);
        await updateDoc(docRef, {
          title: formTitle,
          description: description,
          banner: formBanner,
          thumbnailUrl: thumbnailUrl,
          questions: questions
        });
        alert("Зміни збережено!");
      } else {
        // СТВОРЕННЯ нової форми (додано запис у змінну created для отримання id)
        const created = await saveFormToFirestore(formTitle, questions, formBanner, description, thumbnailUrl);
        alert("Форму створено!");
        if (created?.id) {
          navigate(`/editor/${created.id}`, { replace: true });
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      alert(err.message || "Помилка збереження");
    } finally {
      setSaving(false);
    }
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

  const toggleCorrectAnswer = (qIndex, optIndex) => {
    const newQ = [...questions];
    const question = newQ[qIndex];

    if (question.type === "radio") {
      question.correctAnswers = [optIndex];
    } else if (question.type === "checkbox") {
      if (question.correctAnswers.includes(optIndex)) {
        question.correctAnswers = question.correctAnswers.filter((i) => i !== optIndex);
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
          <input
            type="text"
            className="form-desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опис форми"
          />
          {id && (
            <div className="thumbnail-section">
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="Превʼю" className="form-thumbnail-preview" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleThumbnailChange}
              />
              <button
                type="button"
                className="thumbnail-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Завантаження..." : thumbnailUrl ? "Змінити зображення" : "Додати зображення"}
              </button>
            </div>
          )}
        </div>

        <button type="button" className="close-btn" onClick={() => navigate("/")}>
          Закрити
        </button>
      </div>

      <div className="questions">
        {questions.map((q, i) => (
          <div className="question-card" key={i}>
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
              <label className="icon-btn-upload">
                📷 Додати фото
                <input type="file" accept="image/*" onChange={(e) => handleQuestionImageChange(e, i)} style={{ display: "none" }} />
              </label>

              {q.image && (
                <div className="question-image-container">
                  <img src={q.image} alt="Question" className="question-img-preview" />
                  <button className="delete-img-btn" onClick={() => {
                    const newQ = [...questions];
                    newQ[i].image = "";
                    setQuestions(newQ);
                  }}>Видалити фото</button>
                </div>
              )}

              {q.type !== "text" && (
                <div className="options">
                  {q.options.map((opt, idx) => (
                    <div className="option" key={idx}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleCorrectAnswer(i, idx)}
                        onKeyDown={(e) => e.key === "Enter" && toggleCorrectAnswer(i, idx)}
                        className={
                          q.type === "checkbox"
                            ? q.correctAnswers.includes(idx)
                              ? "option-checkbox active"
                              : "option-checkbox"
                            : q.correctAnswers.includes(idx)
                              ? "option-circle active"
                              : "option-circle"
                        }
                      />
                      <input
                        placeholder={`Варіант ${idx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(i, idx, e.target.value)}
                      />
                    </div>
                  ))}
                  <button type="button" className="add-option-btn" onClick={() => addOption(i)}>
                    + Додати варіант
                  </button>
                </div>
              )}

              {q.type === "text" && <div className="text-answer">Текстова відповідь</div>}

              <div className="question-footer">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                >
                  🗑️
                </button>
                <button type="button" className="save-btn" onClick={saveForm} disabled={saving}>
                  {saving ? "Збереження..." : "Зберегти все"}
                </button>
              </div>
            </div>

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

      <button
        type="button"
        className="add-question"
        onClick={() => setQuestions([...questions, defaultQuestion()])}
      >
        +
      </button>
    </div>
  );
}