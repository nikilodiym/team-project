import React, { useState, useEffect, useRef } from "react";
import "./FormEditor.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getForm, createForm, updateForm, uploadThumbnail } from "../../api/forms";
import { apiFormToEditor, editorToApiPayload, defaultQuestion } from "../../utils/formMapper";

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  const [formTitle, setFormTitle] = useState("Форма без назви");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchForm = async () => {
      if (!id) {
        setQuestions([defaultQuestion()]);
        setLoading(false);
        return;
      }

      try {
        const form = await getForm(id);
        const editor = apiFormToEditor(form);
        setFormTitle(editor.title);
        setDescription(editor.description);
        setThumbnailUrl(editor.thumbnailUrl);
        setQuestions(editor.questions.length ? editor.questions : [defaultQuestion()]);
      } catch {
        alert("Форму не знайдено або доступ заборонено");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, isAuthenticated, navigate]);

  const saveForm = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSaving(true);
    const payload = editorToApiPayload(formTitle, description, questions);

    try {
      if (id) {
        await updateForm(id, payload);
        alert("Зміни збережено!");
      } else {
        const created = await createForm(payload);
        alert("Форму створено!");
        navigate(`/editor/${created.id}`, { replace: true });
        return;
      }
    } catch (err) {
      alert(err.message || "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    try {
      const result = await uploadThumbnail(id, file);
      setThumbnailUrl(result.thumbnailUrl);
    } catch (err) {
      alert(err.message || "Не вдалося завантажити зображення");
    } finally {
      setUploading(false);
      e.target.value = "";
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

  if (!isAuthenticated) {
    return (
      <div className="editor editor-guest">
        <p>Увійдіть, щоб створювати та редагувати форми.</p>
        <Link to="/login">Увійти</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="editor">Завантаження...</div>;
  }

  return (
    <div className="editor">
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
                {uploading ? "Завантаження..." : thumbnailUrl ? "Змінити зображення" : "Додати зображення (Azure)"}
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
