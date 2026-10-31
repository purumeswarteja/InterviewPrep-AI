<div align="center">

# 🎯 InterPrep AI (InterviewPro)

### 🚀 Next-Generation AI Interview Preparation & Career Advancement Platform

*Master technical interviews, conquer HR rounds, sharpen analytical aptitude, optimize your resume for ATS, and track your career growth with Google Gemini AI.*

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini_AI-2.5-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini AI" />
  <img src="https://img.shields.io/badge/Resend-Email_API-black?style=for-the-badge&logo=resend&logoColor=white" alt="Resend" />
  <img src="https://img.shields.io/badge/JWT-Authentication-F57C00?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
</p>

[Explore Features](#-key-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Quick Start](#-getting-started) • [API Reference](#-api-endpoints) • [Project Structure](#-project-structure)

</div>

---

## 📖 Overview

**InterPrep AI**  is an enterprise-grade, full-stack AI interview preparation companion designed for students, software engineers, and job seekers. Powered by **Google Gemini AI**, the platform offers personalized mock interviews, realistic voice-driven conversations, rigorous aptitude and reasoning tests, deep ATS resume analysis and rewriting, and automated daily practice routines.

Whether preparing for system design discussions, HR behavioral screening, or college campus placements, InterPrep AI provides the feedback, analytics, and practice tools needed to ace every stage of the hiring pipeline.

---

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

### 🤖 AI Technical Mock Interviews
* **Adaptive Questioning**: Dynamic technical questions tailored to your target role, core tech stack, and experience level.
* **Instant Evaluation & Scoring**: Detailed breakdown on technical accuracy, depth, code efficiency, and communication clarity.
* **Model Answers & Insights**: Get instant sample responses, key missed points, and follow-up guidance.

</td>
<td width="50%" valign="top">

### 👔 HR & Behavioral Interview Simulator
* **STAR Methodology**: Evaluates answers using the Situation, Task, Action, Result framework.
* **Behavioral Assessment**: Questions targeting leadership, conflict resolution, teamwork, and culture fit.
* **Actionable Feedback**: Constructive tips on phrasing, confidence, and professional delivery.

</td>
</tr>

<tr>
<td width="50%" valign="top">

### 🧠 Aptitude & Logical Reasoning Tests
* **Quantitative Aptitude**: Time-bound practice on arithmetic, algebra, probability, data interpretation, and geometry.
* **Logical & Analytical Reasoning**: Puzzles, syllogisms, pattern recognition, and critical reasoning drills.
* **Step-by-Step Solutions**: In-depth explanations for every problem with instant score computation.

</td>
<td width="50%" valign="top">

### 📄 AI Resume Analyzer & Optimizer
* **Client-Side PDF Parsing**: Fast extraction using `pdfjs-dist` without sending raw files over the wire.
* **ATS Compatibility Scoring**: Comprehensive match score against targeted job titles and industry keywords.
* **Grammar & Impact Audit**: Identifies passive voice, weak bullet points, and formatting pitfalls.
* **AI Resume Optimizer**: Rewrites bullet points to highlight measurable achievements with one-click PDF export via `jspdf`.

</td>
</tr>

<tr>
<td width="50%" valign="top">

### 🎙️ 2-Way Interactive Voice Interviews
* **Speech-to-Text (STT)**: Built on the Web Speech Recognition API for seamless, hands-free spoken answers.
* **Text-to-Speech (TTS)**: Realistic audio playback of interviewer questions for authentic real-world pacing.
* **Dual Input Modes**: Seamlessly switch between voice dictation and typed markdown responses.

</td>
<td width="50%" valign="top">

### 📊 Performance Analytics & Streaks
* **Interactive Visualizations**: Progress charts, score trends, and category distribution using Recharts.
* **Daily Goal Tracker**: Set and monitor daily practice targets and historical completion rates.
* **Streak Counter & Achievements**: Gamified milestone badges to keep interview preparation consistent.

</td>
</tr>

<tr>
<td width="50%" valign="top">

### 🔐 Multi-Factor Email Security & OTP
* **Email Verification**: 6-digit numeric OTP verification on signup powered by **Resend**.
* **Secure Credential Changes**: OTP-protected workflows for updating registered email addresses or passwords.
* **Safe Account Management**: Multi-step OTP confirmation before permanent account deletion and data sanitization.
* **JWT Authentication**: Encrypted JSON Web Tokens with live client-side validation and protected routes.

</td>
<td width="50%" valign="top">

### ⏰ Automated Reminders & Daily Cron
* **Automated Cron Jobs**: Built-in scheduled reminder script (`cron-reminders.js`) to alert users to maintain their practice streaks.
* **Customizable Delivery Windows**: Configurable reminder hours and endpoint security via `CRON_SECRET`.
* **Dark / Light Theme**: High-contrast, responsive user interface with system preference detection and smooth Framer Motion transitions.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Layer / Library | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | React 18 (`react`, `react-dom`) | Modern component-driven UI architecture |
| **Build Tool** | Vite 5 | Ultra-fast Hot Module Replacement (HMR) and production bundler |
| **Language** | JavaScript (ES6+) / TypeScript definitions | Strong typing support and scalable code |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive design with custom color schemes |
| **Routing** | React Router v7 (`react-router-dom`) | Declarative client-side routing & protected route wrappers |
| **Animations** | Framer Motion 12 | Smooth page transitions and interactive micro-animations |
| **Charts** | Recharts 3.9 | Interactive area charts, bar graphs, and score trends |
| **Icons** | Lucide React | Modern, lightweight SVG iconography |
| **Notifications** | React Hot Toast | Responsive feedback and alert messages |
| **PDF Handling** | `pdfjs-dist` & `jspdf` | Client-side resume parsing and formatted PDF generation |

### ⚙️ Backend
| Layer / Library | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | Server-side JavaScript runtime |
| **Web Framework** | Express 4.18 | RESTful API server with custom security middlewares |
| **Database** | MongoDB & Mongoose 9.8 | Document-oriented NoSQL database and schema modeling |
| **AI Engine** | Google Gen AI SDK (`@google/genai`) | Gemini models for question synthesis, answer grading, and resume audits |
| **Email Service** | Resend SDK (`resend`) & Nodemailer | Transactional email delivery and 6-digit OTP dispatch |
| **Security & Auth** | `jsonwebtoken` & `bcryptjs` | JWT authorization headers, secure salt hashing, and route protection |
| **Utilities** | `uuid`, `dotenv`, `cors` | Environment isolation, UUID generation, and CORS handling |

---

## 📂 Project Structure

```text
interview-prep/
├── backend/
│   ├── models/
│   │   ├── InterviewSession.js   # Schemas for mock interviews, QA transcripts, and scores
│   │   ├── Profile.js            # User profile, skills, goals, bookmarks, and badges
│   │   ├── ResumeAnalysis.js     # Saved resume audit history and ATS scores
│   │   └── User.js               # User accounts, hashed passwords, and OTP verification state
│   ├── utils/
│   │   ├── mailer.js             # Resend SDK integration for OTP and notification emails
│   │   └── mockQuestionBank.js   # Fallback question sets for offline / mock testing
│   ├── cron-reminders.js         # Automated daily study reminder and streak cron script
│   ├── server.js                 # Primary Express server, AI endpoints, and auth handlers
│   ├── .env.example              # Environment variables template
│   └── package.json              # Backend dependencies and scripts
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg           # Platform branding icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # OtpVerification and auth UI components
│   │   │   ├── layout/           # AppLayout, PublicNavbar, Footer, NotificationDropdown
│   │   │   ├── ui/               # Reusable buttons, cards, badges, and modals
│   │   │   └── ProtectedRoute.jsx# Auth route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user state, login/logout, profile refresh
│   │   │   └── ThemeContext.jsx  # Dark/light mode theme provider
│   │   ├── lib/
│   │   │   ├── api.js            # Axios/Fetch client with authorization interceptors
│   │   │   ├── speech.js         # Speech-to-Text and Text-to-Speech Web API wrappers
│   │   │   ├── resumePdfGenerator.js # jsPDF resume export generator
│   │   │   └── utils.js          # Class name merging and formatting utilities
│   │   ├── pages/
│   │   │   ├── app/              # Dashboard, MockInterview, HRInterview, Aptitude, Reasoning,
│   │   │   │                     # ResumeAnalyzer, Analytics, History, Profile, Settings
│   │   │   ├── auth/             # LoginPage, RegisterPage, VerifyOtpPage, ForgotPasswordPage
│   │   │   └── public/           # LandingPage, AboutPage, FeaturesPage
│   │   ├── App.jsx               # Application routes and navigation structure
│   │   ├── main.jsx              # Application bootstrap
│   │   └── index.css             # Tailwind base styles and theme tokens
│   ├── index.html                # HTML entry point with theme initializer
│   ├── vite.config.ts            # Vite bundler configuration
│   └── package.json              # Frontend dependencies and build scripts
│
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: A running local instance (`mongodb://localhost:27017`) or a remote [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
* **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)
* *(Optional)* **Resend API Key**: Obtainable from [Resend](https://resend.com/) for email delivery and OTP verification

---

### 📥 1. Clone the Repository

```bash
git clone https://github.com/purumeswarteja/InterviewPro-AI.git
cd InterviewPro-AI
```

---

### ⚙️ 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `backend/` folder based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Populate your `.env` variables:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/interviewprep

   # JWT Secret Key
   JWT_SECRET=your_super_secret_jwt_key

   # Server Port
   PORT=4000

   # Google Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Resend Email Configuration (Optional for local testing, required for OTP delivery)
   RESEND_API_KEY=re_your_resend_api_key
   EMAIL_FROM="InterPrep AI <onboarding@resend.dev>"

   # Automated Daily Reminders (Optional)
   CRON_SECRET=your_random_cron_secret_token
   REMINDER_HOUR=9
   ```

5. Launch the backend development server:
   ```bash
   npm run dev
   ```
   *The backend REST API will run at `http://localhost:4000`.*

---

### 🎨 3. Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend client will run at `http://localhost:5173`.*

---

## 📜 Available Scripts

### Backend (`/backend`)
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Runs backend in development mode with `nodemon` auto-reload |
| `start` | `npm start` | Runs backend with standard Node.js runtime |
| `cron:reminders` | `npm run cron:reminders` | Triggers the daily interview reminder notification task |

### Frontend (`/frontend`)
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Starts Vite HMR dev server |
| `build` | `npm run build` | Compiles optimized production bundle |
| `preview` | `npm run preview` | Previews the local production build |
| `lint` | `npm run lint` | Runs ESLint to check code quality |
| `typecheck` | `npm run typecheck` | Validates TypeScript types across the application |

---

## 🔌 API Endpoints

### 🔐 Authentication & Account Management
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Register a new user and dispatch verification OTP | ❌ Public |
| `POST` | `/api/auth/verify-otp` | Verify email address using 6-digit OTP | ❌ Public |
| `POST` | `/api/auth/resend-otp` | Request a new verification OTP | ❌ Public |
| `POST` | `/api/auth/login` | Authenticate user and return JWT | ❌ Public |
| `GET` | `/api/auth/me` | Fetch active user credentials and profile state | ✅ Required |
| `POST` | `/api/auth/forgot-password/request` | Initiate password reset and dispatch OTP email | ❌ Public |
| `POST` | `/api/auth/forgot-password/verify-otp`| Validate password reset OTP | ❌ Public |
| `POST` | `/api/auth/forgot-password/reset-password`| Set a new password using reset token | ❌ Public |
| `POST` | `/api/auth/change-email/request` | Request an email update with OTP sent to new address | ✅ Required |
| `POST` | `/api/auth/change-email/verify` | Confirm and commit new email address | ✅ Required |
| `POST` | `/api/auth/change-password/request` | Request password change OTP | ✅ Required |
| `POST` | `/api/auth/change-password/verify-otp` | Validate password update OTP | ✅ Required |
| `POST` | `/api/auth/change-password/set-new` | Update password after successful OTP verification | ✅ Required |
| `POST` | `/api/auth/delete-account/request` | Send deletion confirmation OTP | ✅ Required |
| `POST` | `/api/auth/delete-account/confirm` | Permanently wipe account and user records | ✅ Required |

### 🤖 Gemini AI Services
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/generate-next-question` | Generate dynamic technical interview question | ❌ Optional |
| `POST` | `/api/ai/generate-hr-question` | Generate behavioral / HR situational question | ❌ Optional |
| `POST` | `/api/ai/generate-aptitude-questions` | Generate quantitative aptitude problem set | ❌ Optional |
| `POST` | `/api/ai/generate-reasoning-questions`| Generate logical reasoning drills | ❌ Optional |
| `POST` | `/api/ai/evaluate-interview` | Evaluate user answer and return score and tips | ❌ Optional |
| `POST` | `/api/ai/analyze-resume` | Perform deep ATS score analysis, grammar, and audit | ❌ Optional |
| `POST` | `/api/ai/optimize-resume` | Rewrite and enhance resume bullets for job alignment | ❌ Optional |

### 👤 Profile, Sessions & Analytics
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `PUT` | `/api/profile` | Update profile bio, skills, target role, bookmarks & goals | ✅ Required |
| `GET` | `/api/sessions` | Retrieve list of historical interview sessions | ✅ Required |
| `POST` | `/api/sessions` | Save a completed interview session and transcript | ✅ Required |
| `DELETE`| `/api/sessions/:id` | Delete an interview session record | ✅ Required |
| `POST` | `/api/resume-analyses` | Persist resume evaluation outcome | ✅ Required |
| `GET` | `/api/analytics` | Compute and retrieve performance analytics & statistics | ✅ Required |
| `POST` | `/api/notifications/test-reminder` | Trigger a test study reminder email | ✅ Required |
| `POST` | `/api/notifications/test-goal` | Trigger a test goal achievement celebration email | ✅ Required |

---

## 🔒 Security Best Practices

* **Zero-Plaintext Passwords**: Passwords are salted and encrypted via `bcryptjs` with high cost factor prior to storage.
* **OTP Expiration Windows**: All one-time passcodes generated for email confirmation, password resets, and account purges expire automatically after 10 minutes.
* **Isolated Environment Configurations**: Strict segregation between development and production secrets using `.env` validation.
* **No Raw File Retention**: Resume files are parsed client-side in the browser (`pdfjs-dist`); only the extracted plain text is evaluated for security and privacy.

---

<div align="center">

### 👨‍💻 Developed with ❤️ by **[Eswar Teja Purum](https://github.com/purumeswarteja)**

[![GitHub](https://img.shields.io/badge/GitHub-purumeswarteja-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/purumeswarteja)

*If you found this project helpful, give it a ⭐️ 

</div>
