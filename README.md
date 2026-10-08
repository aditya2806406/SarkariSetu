# 🇮🇳 SarkariSetu

> **AI-powered Government Scheme Discovery & Eligibility Assistant for India**

SarkariSetu is a full-stack web platform that helps Indian citizens discover government welfare schemes, search schemes using natural language, understand eligibility requirements, and ask questions through an AI-powered conversational assistant.

The application combines a React/Vite frontend, an Express/Node.js backend, MongoDB Atlas, Google Gemini, Clerk authentication, and a local multilingual embedding model to provide a practical Retrieval-Augmented Generation (RAG) experience.

---

## 🌐 Live Demo

### 🚀 Live Application
**https://sarkari-setu-six.vercel.app/**

### 💻 Source Code
**https://github.com/aditya2806406/SarkariSetu**

### ⚙️ Production API
**https://sarkarisetu-1y9g.onrender.com**

### ❤️ API Health Check
**https://sarkarisetu-1y9g.onrender.com/api/health**

---

## 📌 Project Overview

Government welfare information can be difficult to discover because citizens often have to search across different portals, understand eligibility rules, interpret bureaucratic language, and determine which schemes are actually relevant to their situation.

SarkariSetu addresses this problem by bringing scheme discovery, filtering, eligibility matching, multilingual support, semantic retrieval, and AI-powered explanations into a single interface.

### Core idea

Instead of expecting a citizen to know the exact name of a government scheme, SarkariSetu allows them to ask questions naturally, for example:

- "What schemes are available for farmers?"
- "I am a student. What government schemes can I apply for?"
- "Which schemes are available for women?"
- "What is PM KISAN?"
- "I have a low annual income. Which schemes may help me?"
- Questions can also be asked in supported Indian languages.

The system retrieves relevant government schemes first and then uses the retrieved information as context for the AI response.

---

# ✨ Key Features

## 1. 🏛️ Government Scheme Discovery

Browse a structured collection of Indian government schemes.

Each scheme can contain:

- Scheme name
- Tagline
- Description
- Ministry
- Category
- Beneficiaries
- Eligibility criteria
- Benefits
- Required documents
- Application procedure
- Official website
- Helpline information
- Search tags
- Featured status

The deployed project currently contains **100 seeded schemes**.

---

## 2. 🔎 Scheme Search & Filtering

The scheme browser supports filtering/searching by:

- Category
- State
- Keyword
- Language

The backend supports MongoDB text search over:

- Scheme name
- Tagline
- Tags

All active schemes are returned with featured schemes prioritized.

---

## 3. 🤖 AI Government Scheme Assistant

SarkariSetu includes a conversational AI assistant powered by **Google Gemini**.

The assistant is designed to answer questions using retrieved scheme information rather than simply generating unrestricted answers.

The RAG flow is:

```text
User Question
      ↓
Language Detection
      ↓
Translate to English for Retrieval
      ↓
Generate Query Embedding
      ↓
Compare Against Stored Scheme Embeddings
      ↓
Retrieve Top 5 Relevant Schemes
      ↓
Build Grounded Context
      ↓
Google Gemini
      ↓
Answer in User's Language
      ↓
Return Answer + Sources
```

This helps reduce hallucination by restricting the generation context to the schemes retrieved from the application's database.

---

## 4. 🧠 Retrieval-Augmented Generation (RAG)

SarkariSetu uses a lightweight local RAG implementation.

### Embedding model

```text
Xenova/multilingual-e5-small
```

Embedding size:

```text
384 dimensions
```

The model runs locally through:

```text
@huggingface/transformers
```

The production configuration uses:

```js
dtype: "q8"
```

to reduce the memory footprint of model inference on the Render deployment.

### Retrieval process

For a user query:

1. The query is converted into an embedding.
2. Stored scheme embeddings are loaded from MongoDB.
3. Cosine similarity is calculated between the query vector and every stored scheme vector.
4. Results are sorted by similarity.
5. The top 5 schemes are retrieved.
6. Their information is supplied to Gemini as grounding context.

The current implementation intentionally uses an in-memory similarity calculation rather than an external vector database because the seeded dataset is small enough for this architecture.

---

## 5. 🌍 Multilingual Support

SarkariSetu supports **14 languages**:

| Code | Language |
|---|---|
| `en` | English |
| `hi` | Hindi |
| `bn` | Bengali |
| `mr` | Marathi |
| `te` | Telugu |
| `ta` | Tamil |
| `gu` | Gujarati |
| `ur` | Urdu |
| `kn` | Kannada |
| `or` | Odia |
| `ml` | Malayalam |
| `pa` | Punjabi |
| `as` | Assamese |
| `mai` | Maithili |

### Multilingual chat flow

For a non-English question:

```text
Indian-language question
        ↓
Language detection
        ↓
Translation to English
        ↓
English semantic retrieval
        ↓
Relevant schemes
        ↓
Gemini generates answer
        ↓
Answer returned in original language
```

This allows the retrieval system to use a common semantic representation while still providing the final response in the citizen's language.

---

## 6. 🌐 On-Demand Scheme Translation

Scheme translations are not stored as 13 permanent copies for every scheme.

Instead:

```text
First request in a language
        ↓
Gemini translates scheme fields
        ↓
Translation saved in MongoDB
        ↓
Future requests use cached translation
```

The cache uses a hash of the source scheme content.

If the original English scheme information changes, the hash changes and the cached translation becomes stale.

This avoids unnecessary repeated translation API calls.

---

## 7. ✅ Eligibility Assessment

SarkariSetu includes a rule-based eligibility matching engine.

A citizen can provide information such as:

- State
- Category
- Annual income
- Age
- Gender
- Student status
- Farmer status
- Woman status
- Senior citizen status
- Divyang status

The matcher checks scheme rules including:

- Minimum age
- Maximum age
- Maximum annual income
- Category
- State
- Gender
- Student requirement
- Farmer requirement
- Woman requirement
- Senior citizen requirement
- Divyang requirement

### Matching philosophy

A missing profile value does not automatically exclude a scheme.

For example:

```text
Age not provided
      ↓
Do not reject the scheme solely because age is unknown
```

An empty state list represents:

```text
All-India eligibility
```

Matched schemes are ranked by the specificity of their eligibility rules.

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────────┐
                         │       User / Browser      │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │ React + Vite Frontend      │
                         │ Deployed on Vercel         │
                         └─────────────┬─────────────┘
                                       │ HTTPS / REST
                                       ▼
                         ┌───────────────────────────┐
                         │ Express / Node.js API      │
                         │ Deployed on Render         │
                         └──────┬─────────┬──────────┘
                                │         │
                ┌───────────────┘         └────────────────┐
                ▼                                          ▼
      ┌──────────────────┐                       ┌──────────────────┐
      │ MongoDB Atlas    │                       │ Google Gemini    │
      │                  │                       │                  │
      │ Schemes          │                       │ Chat generation  │
      │ Embeddings       │                       │ Translation      │
      │ Translation      │                       │ Language detect  │
      │ Cache            │                       │ Eligibility text │
      └──────────────────┘                       └──────────────────┘
                ▲
                │
      ┌──────────────────────┐
      │ Hugging Face         │
      │ Transformers.js      │
      │                      │
      │ multilingual-e5-small│
      │ 384-d embeddings     │
      └──────────────────────┘

                     Clerk
                Authentication
```

---

# 🧩 Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Development/build tooling |
| React Router | Client-side routing |
| Axios | HTTP/API communication |
| Clerk React | Authentication |
| Tailwind CSS | Styling utilities |
| Framer Motion | Animations |
| Lucide React | Icons |
| Three.js | 3D/visual effects |
| React Three Fiber | React integration for Three.js |
| Recharts | Data visualization |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | REST API |
| Mongoose | MongoDB ODM |
| MongoDB Atlas | Cloud database |
| CORS | Cross-origin API access |
| Express Rate Limit | API protection |
| Clerk SDK | Authentication integration |
| Google GenAI SDK | Gemini integration |
| Hugging Face Transformers.js | Local embeddings |
| Vitest | Testing |

## AI / ML

| Component | Technology |
|---|---|
| LLM | Google Gemini |
| Embeddings | `Xenova/multilingual-e5-small` |
| Embedding dimension | 384 |
| Retrieval | Cosine similarity |
| Translation | Google Gemini |
| Language detection | Google Gemini |
| RAG | Custom Node.js pipeline |

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Authentication | Clerk |
| Source control | GitHub |

---

# 📁 Project Structure

```text
SarkariSetu/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── data/
│   │   └── seed.js
│   │
│   ├── jobs/
│   │   ├── embedSchemes.js
│   │   └── runEvaluation.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── Scheme.js
│   │   ├── Embedding.js
│   │   └── TranslationCache.js
│   │
│   ├── routes/
│   │   ├── chat.js
│   │   ├── schemes.js
│   │   └── eligibility.js
│   │
│   ├── services/
│   │   ├── embeddings.js
│   │   ├── eligibilityMatcher.js
│   │   ├── gemini.js
│   │   ├── translator.js
│   │   └── vectorSearch.js
│   │
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.*
│
├── .gitignore
└── README.md
```

---

# 🗄️ Database Design

SarkariSetu uses MongoDB Atlas.

The main collections are:

```text
schemes
embeddings
translationcaches
```

## Scheme document

A scheme contains fields such as:

```text
schemeId
name
tagline
description
ministry
category
beneficiaries
eligibility
benefits
documentsRequired
howToApply
officialWebsite
helpline
tags
embeddingText
isActive
isFeatured
createdAt
updatedAt
```

### Eligibility object

```text
minAge
maxAge
gender
categories
maxAnnualIncome
states
flags
```

### Eligibility flags

```text
requiresStudent
requiresFarmer
requiresWoman
requiresSeniorCitizen
requiresDivyang
```

---

# 🧮 Embedding Storage

Each scheme has a corresponding embedding record.

```text
schemeId
schemeStringId
vector[384]
textHash
createdAt
updatedAt
```

The `textHash` allows the embedding job to determine whether a scheme's source text has changed.

This prevents unnecessary re-embedding.

---

# 🔌 REST API

Base production URL:

```text
https://sarkarisetu-1y9g.onrender.com/api
```

## Health Check

```http
GET /health
```

Example:

```text
GET https://sarkarisetu-1y9g.onrender.com/api/health
```

Response:

```json
{
  "success": true,
  "message": "SarkariSetu API is running."
}
```

---

## Get Schemes

```http
GET /schemes
```

Optional query parameters:

```text
category
state
search
language
```

Example:

```text
GET /api/schemes?category=agriculture&language=en
```

---

## Get Individual Scheme

```http
GET /schemes/:schemeId
```

Example:

```text
GET /api/schemes/pm-kisan-samman-nidhi
```

Optional:

```text
?language=hi
```

---

## AI Chat

```http
POST /chat
```

Request body:

```json
{
  "question": "What is PM KISAN?",
  "language": "en",
  "conversationHistory": []
}
```

The language field is optional. If omitted, the backend detects the language.

Response structure:

```json
{
  "success": true,
  "data": {
    "answer": "...",
    "sources": [],
    "language": "en"
  }
}
```

---

## Semantic Search

```http
POST /chat/search
```

Request:

```json
{
  "query": "financial support for farmers"
}
```

Returns semantically relevant schemes without generating a full AI answer.

---

## Eligibility Check

```http
POST /eligibility/check
```

Example body:

```json
{
  "state": "Andhra Pradesh",
  "category": "general",
  "annualIncome": 300000,
  "age": 22,
  "isStudent": true,
  "isFarmer": false,
  "isWoman": false,
  "isSeniorCitizen": false,
  "isDivyang": false,
  "gender": "any",
  "language": "en"
}
```

Response includes:

```text
analysis
schemes
```

---

# 🔐 Authentication

SarkariSetu integrates **Clerk** for authentication.

The frontend uses Clerk's React integration while the backend contains authentication middleware for protected/optional-auth flows.

Environment variables are used for Clerk configuration.

> Never commit Clerk secret keys to GitHub.

---

# 🛡️ Security & Production Configuration

The production backend includes several protections.

## CORS

Production CORS explicitly allows the deployed frontend:

```text
https://sarkari-setu-six.vercel.app
```

Local development is also supported through:

```text
http://localhost:5173
```

## Trust Proxy

Because Render sits behind a reverse proxy, Express is configured with:

```js
app.set("trust proxy", 1);
```

## Rate Limiting

AI-backed routes are protected using `express-rate-limit`.

Current configuration:

```text
Window: 15 minutes
Maximum: 60 requests
```

Applied to:

```text
/api/chat
/api/eligibility
```

Scheme browsing is intentionally not subjected to the same AI quota protection.

---

# ⚙️ Environment Variables

## Backend

Create:

```text
backend/.env
```

with:

```env
PORT=5000

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/sarkarisetu?appName=Cluster0

GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

CLERK_SECRET_KEY=your_clerk_secret_key

FRONTEND_URL=http://localhost:5173
```

For production:

```env
FRONTEND_URL=https://sarkari-setu-six.vercel.app
```

### Important

Never commit:

```text
.env
```

or real API keys/passwords.

---

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_URL=https://sarkarisetu-1y9g.onrender.com/api
```

`VITE_` variables are exposed to the browser, so only public/non-secret values should use this prefix.

---

# 🚀 Local Development

## Prerequisites

Install:

- Node.js
- npm
- Git
- MongoDB Atlas account
- Clerk account
- Google Gemini API key

---

## 1. Clone Repository

```bash
git clone https://github.com/aditya2806406/SarkariSetu.git
cd SarkariSetu
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Configure Backend Environment

Create:

```text
backend/.env
```

and add the required backend variables.

---

## 4. Seed Database

From the backend directory:

```bash
npm run seed
```

This initializes the scheme dataset in MongoDB.

---

## 5. Generate Embeddings

```bash
npm run embed
```

This:

1. Reads active schemes.
2. Creates the embedding text.
3. Generates 384-dimensional embeddings.
4. Stores vectors in MongoDB.
5. Uses text hashes to skip unchanged schemes.

The local embedding model may need to download its model files the first time it is used.

---

## 6. Start Backend

Development:

```bash
npm run dev
```

Production-style local start:

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

Health endpoint:

```text
http://localhost:5000/api/health
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

Set:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start development server:

```bash
npm run dev
```

Vite normally serves the application at:

```text
http://localhost:5173
```

---

# 🏗️ Production Frontend Build

```bash
cd frontend
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# 🚢 Deployment

## Frontend — Vercel

Recommended configuration:

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

Production environment variables:

```text
VITE_CLERK_PUBLISHABLE_KEY
VITE_API_URL
```

Production API URL:

```text
https://sarkarisetu-1y9g.onrender.com/api
```

---

## Backend — Render

Recommended configuration:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Required backend environment variables:

```text
PORT
MONGODB_URI
GEMINI_API_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
FRONTEND_URL
```

Production frontend origin:

```text
https://sarkari-setu-six.vercel.app
```

---

# 📦 Data Initialization in Production

The production database is hosted on MongoDB Atlas.

The scheme initialization workflow is:

```text
Seed schemes
     ↓
Generate embeddings
     ↓
Store scheme documents
     ↓
Store 384-dimensional vectors
     ↓
Application ready for semantic retrieval
```

Because the Render Free compute plan does not provide a persistent interactive shell for this workflow, database initialization can be performed locally against the production MongoDB Atlas database using the same backend scripts.

---

# 🧠 RAG Pipeline in Detail

The `/api/chat` endpoint performs the following process:

### Step 1 — Receive question

```text
POST /api/chat
```

Example:

```text
"What schemes can help farmers?"
```

### Step 2 — Detect language

If the language was not supplied, Gemini identifies the language.

### Step 3 — Translate

Non-English questions are translated into English for consistent retrieval.

### Step 4 — Embed query

The query is converted into a 384-dimensional vector using:

```text
multilingual-e5-small
```

with the E5 prefix:

```text
query:
```

### Step 5 — Compare vectors

The query vector is compared with stored scheme vectors using cosine similarity.

### Step 6 — Retrieve top results

The top 5 most similar schemes are selected.

### Step 7 — Build context

Relevant fields are assembled into a structured context containing:

- Scheme
- Ministry
- Description
- Benefits
- Eligibility
- Documents
- Official website

### Step 8 — Generate answer

Gemini receives:

```text
User question
+
Retrieved scheme context
+
Conversation history
```

### Step 9 — Grounded response

The model is instructed:

- Do not invent schemes.
- Do not invent benefits.
- Do not invent eligibility rules.
- Use only retrieved information.
- Say when the available information is insufficient.
- Answer in the user's language.

### Step 10 — Sources

The API returns the relevant scheme sources along with the generated answer.

---

# 🔍 Search Architecture

SarkariSetu intentionally provides two complementary search mechanisms.

## Keyword search

Used by:

```text
GET /api/schemes
```

MongoDB text indexes cover:

```text
name
tagline
tags
```

Useful when the user knows an exact or approximate scheme keyword.

## Semantic search

Used by:

```text
POST /api/chat/search
POST /api/chat
```

Semantic search understands meaning rather than requiring exact keyword matches.

Example:

```text
"financial help for farming"
```

can retrieve schemes related to agricultural financial support even if the exact phrase does not appear in the scheme name.

---

# 📊 Current Dataset

The deployed application currently contains:

```text
100 active government schemes
```

Each scheme is stored with structured eligibility information and associated embedding data.

The database can be expanded by adding additional scheme records and running:

```bash
npm run seed
npm run embed
```

The embedding job uses hashes so unchanged schemes are skipped.

---

# 🧪 Testing & Evaluation

Backend scripts include:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Evaluation script:

```bash
npm run eval
```

The backend architecture also keeps important pure functions independently testable, including:

- Cosine similarity
- Eligibility matching
- Scheme/profile matching
- Context construction

---

# 🩺 Troubleshooting

## Backend does not start

Check:

```text
MONGODB_URI
GEMINI_API_KEY
CLERK_SECRET_KEY
```

Then check:

```text
/api/health
```

---

## Schemes are empty

Run:

```bash
npm run seed
```

Then:

```bash
npm run embed
```

Verify:

```text
GET /api/schemes
```

---

## Chat does not respond

Check in this order:

1. `/api/health`
2. `/api/schemes`
3. Browser console
4. Render logs
5. `FRONTEND_URL`
6. `VITE_API_URL`
7. Gemini API configuration
8. Embedding model initialization

---

## CORS error

Production frontend:

```text
https://sarkari-setu-six.vercel.app
```

Backend:

```text
https://sarkarisetu-1y9g.onrender.com
```

Make sure:

```env
FRONTEND_URL=https://sarkari-setu-six.vercel.app
```

and that the frontend uses:

```env
VITE_API_URL=https://sarkarisetu-1y9g.onrender.com/api
```

---

## Embedding model uses too much memory

The production embedding pipeline uses:

```js
dtype: "q8"
```

for the local `multilingual-e5-small` model.

If the embedding model is changed, verify the Render instance has sufficient memory for the selected model/runtime.

---

# 🔒 Secrets & GitHub Safety

The repository intentionally does **not** contain production secrets.

Do not commit:

```text
MONGODB_URI
GEMINI_API_KEY
CLERK_SECRET_KEY
.env
```

The repository uses `.gitignore` rules for environment files and generated build artifacts.

If a secret is ever accidentally committed:

1. Remove it from the repository.
2. Rotate/revoke the exposed secret.
3. Replace it with a new secret.
4. Update the deployment environment.

---

# 🎯 Design Principles

SarkariSetu follows several deliberate design decisions.

### Free-first AI architecture

The project avoids requiring a paid embedding API by running the embedding model locally.

### Provider isolation

AI functionality is separated into service modules so that model/provider changes do not require rewriting the route layer.

### Grounded generation

The chatbot is designed to answer from retrieved scheme context instead of treating Gemini as an unrestricted source of government policy information.

### Cached translation

Translations are generated on demand and cached to reduce repeated API calls.

### Pure eligibility logic

Eligibility matching is implemented as deterministic application logic rather than asking an LLM to decide eligibility.

### Lightweight retrieval

For a dataset of approximately 100–200 schemes, an in-memory cosine similarity search keeps the architecture simple and avoids the operational complexity of a dedicated vector database.

---

# ⚠️ Important Limitations

SarkariSetu is an informational software project and should not be treated as an authoritative legal or governmental decision system.

Government scheme rules, income limits, eligibility conditions, application procedures, and URLs can change.

Users should verify important information on the relevant official government portal before submitting an application or making a decision.

The AI assistant can only be as accurate as:

- The stored scheme information
- The retrieval results
- The translation
- The language model response

The application therefore returns official scheme websites as part of its source information whenever available.

---

# 🔮 Future Improvements

Potential future enhancements include:

- Official government portal data synchronization
- Automated scheme-data refresh
- Larger scheme datasets
- Dedicated vector database / ANN index for large-scale retrieval
- Improved multilingual retrieval for lower-resource languages
- More detailed source citations
- Government portal link verification
- User-specific saved schemes
- Application deadline reminders
- Personalized scheme recommendations
- More advanced eligibility explanations
- Administrative dashboard for scheme management
- Automated monitoring for changed scheme policies
- Improved observability and structured logging
- Automated CI/CD testing

---

# 👨‍💻 Development Commands

## Backend

```bash
cd backend

npm install
npm run dev
npm start

npm run seed
npm run embed

npm test
npm run test:watch
npm run eval
```

## Frontend

```bash
cd frontend

npm install
npm run dev
npm run build
npm run preview
npm run lint
```

---

# 🔗 Important Links

| Resource | Link |
|---|---|
| 🚀 Live Website | https://sarkari-setu-six.vercel.app/ |
| 💻 GitHub Repository | https://github.com/aditya2806406/SarkariSetu |
| ⚙️ Production Backend | https://sarkarisetu-1y9g.onrender.com |
| ❤️ API Health | https://sarkarisetu-1y9g.onrender.com/api/health |
| 📋 Schemes API | https://sarkarisetu-1y9g.onrender.com/api/schemes |

---

# 📜 License

No open-source license is currently specified in the repository.

If this project is intended to be distributed publicly, add an appropriate `LICENSE` file and update this section.

---

# 🙌 Acknowledgements

SarkariSetu is built using open-source and developer-platform technologies including:

- React
- Vite
- Node.js
- Express
- MongoDB
- MongoDB Atlas
- Google Gemini
- Hugging Face Transformers
- Clerk
- Vercel
- Render

---

# ⭐ Project Summary

**SarkariSetu** is a full-stack AI platform designed to make Indian government schemes easier to discover and understand.

It combines:

```text
Structured scheme data
        +
Keyword search
        +
Semantic search
        +
Multilingual processing
        +
Eligibility matching
        +
Retrieval-Augmented Generation
        +
Gemini
        +
Official scheme sources
```

into one citizen-focused platform.

### Live now:

**https://sarkari-setu-six.vercel.app/**

---

<p align="center">
  Built with ❤️ to make government schemes easier to discover, understand, and access.
</p>
