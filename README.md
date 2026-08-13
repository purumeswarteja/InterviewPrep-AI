<div align="center">

# 🎯 InterviewPro AI

### 🚀 Your AI-Powered Interview Preparation Companion

Practice mock interviews, analyze your resume, track your progress, and land your dream job with confidence.

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Authentication-orange" />
  <img src="https://img.shields.io/badge/Status-Active-success" />
</p>

</div>

---

## 📖 About the Project

**InterviewPro AI** is a full-stack AI-powered interview preparation platform designed to help students and job seekers strengthen their interview skills through AI mock interviews, resume analysis, 2-way voice-based interactions, and detailed performance analytics.

The platform provides realistic interview experiences with AI-generated questions, instant feedback, resume evaluation, progress tracking, and personalized insights to help users prepare confidently for technical and HR interviews.

---

# ✨ Features

<table>
<tr>
<td width="50%">

## 🤖 AI Mock Interviews

- Technical interview practice
- HR interview simulations
- AI-generated interview questions
- Instant feedback and scoring
- Session history tracking

</td>

<td width="50%">

## 📄 Resume Analyzer

- Upload resume PDFs
- ATS score analysis
- Grammar checking
- Keyword analysis & matching
- Actionable improvement suggestions

</td>
</tr>

<tr>
<td width="50%">

## 🎤 Voice Interviews

- Built-in Speech-to-Text
- Text-to-Speech interview questions
- Interactive 2-way voice experience

</td>

<td width="50%">

## 📊 Analytics Dashboard

- Session history tracking
- Average interview scores
- Performance trends & charts
- Practice streak & goals tracking

</td>
</tr>

<tr>
<td width="50%">

## 🔖 Bookmarks

- Save important interview questions
- Quick revision before interviews

</td>

<td width="50%">

## 🏆 Achievements

- Unlock achievement badges
- Track milestones
- Maintain practice streaks

</td>
</tr>

<tr>
<td width="50%">

## 👤 Profile Management

- Profile photo upload
- Skills & target role management
- Career goals tracking
- Optional experience level

</td>

<td width="50%">

## 🔐 Secure Authentication & Management

- JWT-based authentication
- Live password requirement validation
- Password visibility toggle
- One-click account deletion with full data cleanup

</td>
</tr>
</table>

---

# 🛠️ Tech Stack

## 🎨 Frontend

| Technology | Purpose |
|------------|---------|
| React 18 + JavaScript / JSX | UI Framework |
| Vite | Build Tool & Dev Server |
| Tailwind CSS | Styling |
| React Router v7 | Client-side Routing |
| Framer Motion | Animations |
| Recharts | Data Visualization |
| Lucide React | Icons |
| React Hot Toast | Notifications |
| PDF.js | Resume PDF Parsing |

---

## ⚙️ Backend

| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API Server |
| MongoDB + Mongoose | NoSQL Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password Hashing |
| uuid | Unique ID Generation |
| CORS | Cross-Origin Support |

---

# 📦 Required Packages

### 🎨 Frontend Dependencies (`frontend/`)

```bash
npm install react react-dom react-router-dom lucide-react framer-motion recharts react-hot-toast pdfjs-dist
```

- **`react` / `react-dom`** — Core UI component framework & DOM rendering engine
- **`react-router-dom`** — Single-page routing & seamless client navigation
- **`lucide-react`** — Lightweight vector icons for modern UI elements
- **`framer-motion`** — Smooth animations, transitions, and interactive micro-UI
- **`recharts`** — Interactive charting library for analytics visualization
- **`react-hot-toast`** — Clean toast notification alerts for user feedback
- **`pdfjs-dist`** — Client-side resume PDF parsing & text extraction

---

### ⚙️ Backend Dependencies (`backend/`)

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken cors uuid
```

- **`express`** — Fast Node.js web framework for REST API endpoints
- **`mongoose`** — MongoDB object modeling (ODM) & schema validation
- **`jsonwebtoken` & `bcryptjs`** — JWT authentication & password encryption
- **`cors` & `dotenv`** — Cross-Origin sharing & environment variable management
- **`uuid` & `nodemon`** — Unique ID generation & dev auto-restart server

---

# 📂 Project Structure

```text
InterviewPro-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Route Pages
│   │   ├── context/        # Global State (Auth, Theme)
│   │   └── ...
│   ├── index.html
│   └── package.json
│
└── backend/
    ├── models/             # User, Profile, Session, Resume Schemas
    ├── server.js           # Express Server & REST API Routes
    ├── .env                # MongoDB URI & JWT Secret
    └── package.json
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:
* Node.js v18+
* npm
* MongoDB running locally (or remote MongoDB URI)

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

Backend server runs on `http://localhost:4000`.

---

## 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend application runs on `http://localhost:5173`.

---

# 🔌 API Endpoints

| Method | Endpoint | Description | Authentication |
|------|-----------------------------|-----------------------------|---------------|
| POST | `/api/auth/signup` | Register a new user | ❌ Public |
| POST | `/api/auth/login` | Login and receive JWT | ❌ Public |
| GET | `/api/auth/me` | Get current user & profile | ✅ Required |
| PUT | `/api/profile` | Update profile | ✅ Required |
| GET | `/api/sessions` | Get interview sessions | ✅ Required |
| POST | `/api/sessions` | Save interview session | ✅ Required |
| DELETE | `/api/sessions/:id` | Delete interview session | ✅ Required |
| POST | `/api/resume-analyses` | Save resume analysis | ✅ Required |
| GET | `/api/analytics` | Retrieve analytics | ✅ Required |
| DELETE | `/api/auth/delete-account` | Delete account & user data | ✅ Required |

---

<div align="center">

## 👨‍💻 Developed by **Eswar Teja Purum**

<p>
<a href="https://github.com/purumeswarteja">
<img src="https://img.shields.io/badge/GitHub-purumeswarteja-181717?logo=github&logoColor=white" />
</a>
</p>

</div>
