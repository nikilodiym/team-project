# 📋 Google Forms
> Веб-застосунок для створення, редагування та розповсюдження інтернет-форм (опитування, реєстраційні форми, збір відповідей)

---

## 🚀 1. Опис проєкту

**Назва:** Team Forms  
**Ідея:** веб-застосунок для створення форм, збору відповідей та перегляду результатів  
**Мета:** дати простий інструмент для швидкого створення форм і аналізу даних  
**Аудиторія:** викладачі, HR, організатори подій, малі команди

---

## 🎯 2. Проблема та мета

### ❗ Проблема
Бракує простих інструментів для створення форм без складних налаштувань або платних сервісів.

### 📌 Актуальність
Швидкий збір даних (реєстрації, опитування, фідбек) стає критично важливим.

### ✅ Результат
Готовий веб-застосунок для:
- створення форм
- збору відповідей
- перегляду аналітики

---

## ⚙️ 3. Вимоги до системи

### 🧩 Функціональні вимоги
- Реєстрація / авторизація (email, OAuth)
- Створення / редагування / видалення форм
- Типи полів:
  - текст
  - paragraph
  - radio
  - checkbox
  - дата / рейтинг
- Чернетки + публікація
- Унікальні URL форм
- Збір відповідей
- Dashboard зі статистикою
- Експорт CSV / JSON
- Права доступу (public / private / team)

---

### 🛡️ Нефункціональні вимоги
- ⏱ швидкість відповіді: ≤ 500 мс
- 🔐 безпека (bcrypt, XSS, CSRF protection)
- 📦 масштабованість
- 💾 резервне копіювання
- 📱 responsive UI

---

### 🧱 Технології

| Рівень | Технології |
|--------|------------|
| Frontend | React |
| Backend | Node.js / Firebase |
| DB | Firestore / PostgreSQL |
| Hosting | Vercel / AWS / Azure |

---

## 🧠 4. Функціональні можливості

- Drag & drop конструктор форм
- Шаблони форм
- Публікація через link / embed
- Збір відповідей
- Аналітика (графіки, таблиці)
- Експорт даних

---

## 👤 5. User Stories

### 📌 Приклад сценарію

1. Логін / реєстрація
2. Створення нової форми
3. Додавання полів
4. Публікація форми
5. Розсилка посилання
6. Перегляд результатів

---

## 🏗️ 6. Архітектура

Client (React)
↓
API (REST / Firebase)
↓
Database (Firestore / PostgreSQL)

---

### 📁 Структура проєкту

src/ → frontend
public/ → static files
docs/ → documentation

<img width="1408" height="768" alt="image" src="https://github.com/user-attachments/assets/8edc8154-2d9e-4999-9784-60131b410c6f" />


---

## 🗄️ 7. База даних

### 🔥 Firestore
- users
- forms
- responses

### 🐘 PostgreSQL
- users
- forms
- fields
- responses
- answers

---

## 🔌 8. API

| Method | Endpoint |
|--------|---------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/forms |
| POST | /api/forms |
| GET | /api/forms/:id |
| PUT | /api/forms/:id |
| DELETE | /api/forms/:id |
| POST | /api/forms/:id/responses |
| GET | /api/forms/:id/responses |

---

## 🧪 9. Тестування

- Unit tests
- Integration tests
- E2E tests (Cypress)

### Сценарії:
- реєстрація користувача
- створення форми
- відправка відповіді

---

## 👥 10. Команда

| Роль | Ім’я |
|------|-----|
| Team Lead / Frontend | Нікіта |
| Backend | Максим |
| Hosting | Артем |
| Docs / Testing | Дарина |
| Frontend | Валерія |

---

## 🧭 11. Git workflow

### 🌿 Branches
- master
- feature/*
- fix/*

### 💬 Commit style

feat(frontend): add form builder
fix(api): resolve auth bug


---

## 📊 12. Sprint plan

- Sprint 1 → auth + forms editor
- Sprint 2 → responses + dashboard
- Sprint 3 → analytics + bugfix

⏱ 1 sprint = 1 week

---

## 🚀 13. Deployment

- Frontend → Vercel / Netlify
- Backend → Firebase / AWS / Azure
- DB → Firestore / PostgreSQL

---

## 📦 14. Setup

```bash
git clone <repo-url>
cd team-project
npm install
npm start
