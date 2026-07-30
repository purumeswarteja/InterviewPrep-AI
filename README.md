<div align="center">

# 🎯 InterviewPro AI

### 🚀 Your AI-Powered Interview Preparation Companion

Practice mock interviews, analyze your resume, track your progress, and land your dream job.

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

**InterviewPro AI** is an AI-powered interview preparation platform that helps students and job seekers strengthen their interview skills through AI mock interviews, resume analysis, voice-based interactions, and detailed performance analytics.

The platform provides realistic interview experiences with AI-generated questions, instant feedback, resume evaluation, progress tracking, and personalized insights to help users prepare confidently for technical and HR interviews.

---

# ✨ Features

<table>
<tr>
<td width="50%">

## 🤖 AI Mock Interviews

- Practice technical interview sessions
- HR interview simulations
- AI-generated interview questions
- Instant feedback and scoring

</td>

<td width="50%">

## 📄 Resume Analyzer

- Upload resume PDFs
- ATS score analysis
- Grammar checking
- Keyword analysis
- Actionable improvement suggestions

</td>
</tr>

<tr>
<td width="50%">

## 🎤 Voice Interviews

- Built-in Speech-to-Text
- Text-to-Speech interview questions
- Interactive voice interview experience

</td>

<td width="50%">

## 📊 Analytics Dashboard

- Session history
- Average interview scores
- Performance trends
- Interactive charts
- Practice streak tracking

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

- Upload profile photo
- Update bio
- Manage skills
- Set target role
- Optional experience level

</td>

<td width="50%">

## 🔐 Secure Authentication

- JWT-based authentication
- Secure signup & login
- bcrypt password hashing
- Delete account with all associated data
- Protected API routes

</td>
</tr>

<tr>
<td width="50%">

## 🔑 Interactive Authentication

- Live password requirement validation
- Password visibility toggle
- Clear authentication error alerts

</td>

<td width="50%">

## 🗑️ Account Management

- One-click account deletion
- Removes all associated user data securely

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

# 📂 Project Structure

```text
InterviewPro-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Route Pages
│   │   ├── context/        # Global State
│   │   └── ...
│   ├── index.html
│   └── package.json
│
└── backend/
    ├── models/             # User, Profile, Session, Resume
    ├── server.js           # Express Server
    ├── .env                # MongoDB URI & JWT Secret
    └── package.json
```

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


---

<div align="center">

## 👨‍💻 Developed by **Eswar Teja Purum**

<p>
<a href="https://github.com/purumeswarteja">
<img src="https://img.shields.io/badge/GitHub-purumeswarteja-181717?logo=github&logoColor=white" />
</a>
</p>



</div>
