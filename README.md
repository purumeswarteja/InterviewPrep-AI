<div align="center">

# 🚀 InterviewPro AI

### 🎯 AI-Powered Interview Preparation Platform

Practice mock interviews, analyse your resume, track your performance, and prepare with confidence for your dream job.

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Authentication-orange" />
  <img src="https://img.shields.io/badge/Status-Active-success" />
</p>

</div>

---

## 📖 About the Project

**InterviewPro AI** is a full-stack AI-powered interview preparation platform designed to help students and job seekers improve their interview skills through mock interviews, resume analysis, voice-based interaction, and performance analytics.

The platform provides a realistic interview experience with AI-generated questions, personalised feedback, and progress tracking to help users prepare effectively for technical and HR interviews.

---

# ✨ Features

<table>
<tr>
<td width="50%">

## 🤖 AI Mock Interviews

* Technical interview practice
* HR interview sessions
* AI-generated questions
* Instant feedback and analysis
* Interview session history

</td>

<td width="50%">

## 📄 Resume Analyzer

* Upload resume PDF
* ATS compatibility score
* Grammar analysis
* Keyword matching
* Improvement suggestions

</td>
</tr>

<tr>
<td width="50%">

## 🎤 Voice Interviews

* Speech-to-Text answer recording
* Text-to-Speech questions
* Interactive voice interview experience

</td>

<td width="50%">

## 📊 Analytics Dashboard

* Performance tracking
* Average scores
* Practice streaks
* Interactive charts
* Progress insights

</td>
</tr>

<tr>
<td width="50%">

## 🔖 Bookmarks

* Save important questions
* Quick revision before interviews

</td>

<td width="50%">

## 🏆 Achievements

* Earn badges
* Track milestones
* Maintain practice streaks

</td>
</tr>

<tr>
<td width="50%">

## 👤 Profile Management

* Profile customization
* Photo upload
* Skills and target role
* Career goals

</td>

<td width="50%">

## 🔐 Authentication

* JWT-based authentication
* Secure signup/login
* bcrypt password hashing
* Protected API routes

</td>
</tr>
</table>

---

# 🛠️ Tech Stack

## 🎨 Frontend

| Technology      | Purpose            |
| --------------- | ------------------ |
| React 18        | User Interface     |
| TypeScript      | Type Safety        |
| Vite            | Build Tool         |
| Tailwind CSS    | Styling            |
| React Router v7 | Routing            |
| Framer Motion   | Animations         |
| Recharts        | Data Visualization |
| Lucide React    | Icons              |
| React Hot Toast | Notifications      |
| PDF.js          | Resume PDF Parsing |

---

## ⚙️ Backend

| Technology                | Purpose              |
| ------------------------- | -------------------- |
| Node.js                   | Runtime Environment  |
| Express.js                | REST API Server      |
| JSON Database (`db.json`) | Data Storage         |
| JWT                       | Authentication       |
| bcryptjs                  | Password Hashing     |
| uuid                      | Unique ID Generation |
| CORS                      | Cross-Origin Support |

---

# 📂 Project Structure

```text
InterviewPro-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Application Pages
│   │   ├── context/        # Global State Management
│   │   ├── hooks/
│   │   └── ...
│   │
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── server.js           # Express Server & API Routes
│   ├── db.json             # Local Database
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js v18+
* npm

---

## 📥 Clone Repository

```bash
git clone https://github.com/purumeswarteja/InterviewPro-AI.git

cd InterviewPro-AI
```

---

## ⚙️ Backend Setup

```bash
cd backend

npm install

npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

---

## 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🔌 API Endpoints

| Method | Endpoint                   | Description              | Authentication |
| ------ | -------------------------- | ------------------------ | -------------- |
| POST   | `/api/auth/signup`         | Register a new user      | ❌ Public       |
| POST   | `/api/auth/login`          | Login user               | ❌ Public       |
| GET    | `/api/auth/me`             | Get current user details | ✅ Required     |
| PUT    | `/api/profile`             | Update user profile      | ✅ Required     |
| GET    | `/api/sessions`            | Get interview sessions   | ✅ Required     |
| POST   | `/api/sessions`            | Save interview session   | ✅ Required     |
| DELETE | `/api/sessions/:id`        | Delete interview session | ✅ Required     |
| POST   | `/api/resume-analyses`     | Save resume analysis     | ✅ Required     |
| GET    | `/api/analytics`           | Get analytics data       | ✅ Required     |
| DELETE | `/api/auth/delete-account` | Delete account and data  | ✅ Required     |

---



---

<div align="center">

## 👨‍💻 Developed by **Eswar Teja Purum**

<p>
<a href="https://github.com/purumeswarteja">
<img src="https://img.shields.io/badge/GitHub-purumeswarteja-181717?logo=github&logoColor=white" />
</a>
</p>

</div>
