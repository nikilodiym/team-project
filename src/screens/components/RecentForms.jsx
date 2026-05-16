import "./RecentForms.css";
import { LayoutGrid, ArrowUpDown, Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getForms } from "../../api/forms";

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Новіші спочатку", sortBy: "createdAt", sortDir: "desc" },
  { value: "createdAt-asc", label: "Старіші спочатку", sortBy: "createdAt", sortDir: "asc" },
  { value: "title-asc", label: "Назва А–Я", sortBy: "title", sortDir: "asc" },
  { value: "title-desc", label: "Назва Я–А", sortBy: "title", sortDir: "desc" },
  { value: "updatedAt-desc", label: "Оновлені", sortBy: "updatedAt", sortDir: "desc" },
];

function RecentForms() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("createdAt-desc");
  const [showSort, setShowSort] = useState(false);

  const loadForms = useCallback(async () => {
    if (!isAuthenticated) {
      setForms([]);
      return;
    }

    const sort = SORT_OPTIONS.find((o) => o.value === sortValue) || SORT_OPTIONS[0];
    setLoading(true);
    setError("");

    try {
      const data = await getForms({
        search: search.trim(),
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
      });
      setForms(data);
    } catch (err) {
      setError(err.message || "Не вдалося завантажити форми");
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, search, sortValue]);

  useEffect(() => {
    const timer = setTimeout(loadForms, 300);
    return () => clearTimeout(timer);
  }, [loadForms]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "щойно";
    return new Date(dateStr).toLocaleDateString("uk-UA");
  };

  if (authLoading) {
    return (
      <section className="recent-forms">
        <div className="empty-block">
          <p>Завантаження...</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="recent-forms">
        <div className="recent-top">
          <h2>Останні форми</h2>
        </div>
        <div className="empty-block">
          <h3>Увійдіть, щоб бачити свої форми</h3>
          <p>
            <Link to="/login">Увійти</Link> або зареєструватись
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="recent-forms">
      <div className="recent-top">
        <h2>Мої форми</h2>

        <div className="recent-actions">
          <div className="recent-search">
            <Search className="recent-icon" size={18} />
            <input
              type="text"
              placeholder="Пошук форм..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-wrapper">
            <button
              type="button"
              className="sort-trigger"
              onClick={() => setShowSort(!showSort)}
            >
              <ArrowUpDown className="recent-icon" size={18} />
              {SORT_OPTIONS.find((o) => o.value === sortValue)?.label}
            </button>
            {showSort && (
              <div className="sort-menu">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortValue(opt.value);
                      setShowSort(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <LayoutGrid className="recent-icon" />
        </div>
      </div>

      <div className="forms-list">
        {loading && <p className="forms-status">Завантаження...</p>}
        {error && <p className="forms-error">{error}</p>}

        {!loading && !error && forms.length > 0 ? (
          <div className="recent-forms-grid">
            {forms.map((form) => (
              <Link to={`/editor/${form.id}`} key={form.id} className="recent-form-card">
                <div className="card-preview">
                  {form.thumbnailUrl ? (
                    <img src={form.thumbnailUrl} alt="" className="card-thumbnail" />
                  ) : (
                    <div className="form-icon-placeholder">📄</div>
                  )}
                </div>
                <div className="card-info">
                  <h4>{form.title || "Форма без назви"}</h4>
                  <div className="card-footer">
                    <span className="last-opened">
                      {form.status} · {formatDate(form.updatedAt || form.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="empty-block">
            <h3>Форм ще немає</h3>
            <p>Створіть нову форму або використайте шаблон</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default RecentForms;
