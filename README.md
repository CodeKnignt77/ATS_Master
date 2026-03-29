<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ATS-Master: AI-Driven Resume Optimization Engine

ATS-Master is a high-performance web application engineered to bridge the gap between candidate profiles and Applicant Tracking Systems (ATS). By leveraging Google's Gemini Large Language Models (LLMs), it provides a data-driven approach to resume tailoring, ensuring maximum semantic alignment and strategic optimization for specific job descriptions.

View the application on AI Studio: [ATS-Master](https://ai.studio/apps/9221ed9e-eee9-40aa-be7c-f1b739c11c8f)

## 🚀 Key Features

### 1. **Intelligent ATS Gap Analysis**
- **Semantic Matching Engine:** Performs deep contextual analysis of job descriptions (JD) against candidate profiles to identify missing competencies and experiences.
- **Dynamic Scoring:** Calculates a real-time ATS match score (0-100) using proprietary heuristics and LLM-based evaluation.
- **Keyword Extraction:** Automatically isolates high-priority ATS keywords and technical requirements from JDs.

### 2. **Strategic Visualization**
- **D3.js Mind Mapping:** Renders a hierarchical "Strategy Mind Map" that visualizes the optimization roadmap, categorizing tasks into Strategy, Content, and Formatting.
- **Real-time Progress Tracking:** Visual feedback on optimization status via custom SVG-based components.

### 3. **AI Career Coach with Retrieval-Augmented Generation (RAG)**
- **Context-Aware Dialogue:** A specialized LLM-driven coach that interactively gathers missing data points to fortify the resume.
- **Google Search Integration:** Grounded AI responses utilizing real-time web search for salary benchmarking, industry trends, and role-specific certification requirements.

### 4. **Automated Professional Content Generation**
- **XYZ Formula Implementation:** Re-engineers work experience bullets using the Google-standard XYZ formula: *Accomplished [X] as measured by [Y], by doing [Z]*.
- **Tailored Summaries:** Generates punchy, achievement-oriented professional summaries with high keyword density.
- **Structured Skill Taxonomy:** Builds organized skill matrices strictly aligned with the target Job Description.

## 🛠 Technical Architecture

### Frontend Ecosystem
- **Core Framework:** [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) for strict type safety and component-driven architecture.
- **Build System:** [Vite](https://vitejs.dev/) for optimized HMR and production asset bundling.
- **Styling Architecture:** [Tailwind CSS](https://tailwindcss.com/) for utility-first, responsive UI design.
- **Data Visualization:**
  - **D3.js:** Advanced SVG manipulation for the interactive Strategy Mind Map.
  - **Recharts:** Component-based charting for the ATS Score Gauge.
- **Iconography:** [Lucide-React](https://lucide.dev/) for a clean, consistent vector icon set.

### AI Integration & Services
- **LLM Orchestration:** Powered by [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK.
- **Model Selection:**
  - `Gemini 1.5 Flash`: Utilized for low-latency analysis and structured JSON content generation.
  - `Gemini 1.5 Pro`: Employed for complex conversational reasoning within the Career Coach interface.
- **State Persistence:** LocalStorage API for client-side data retention across sessions.

## 📦 Installation and Setup

### Prerequisites
- Node.js (Latest LTS version)
- NPM or Yarn package manager

### Getting Started

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd ats-master-cv-generator
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
   *Note: Free API keys can be obtained via [Google AI Studio](https://aistudio.google.com/).*

4. **Launch Development Environment:**
   ```bash
   npm run dev
   ```

## 🖥 Usage Workflow

1. **Ingestion:** Paste the target Job Description and your existing CV/Profile text into the input interface.
2. **Analysis:** Review the generated ATS Score and Strategy Mind Map to identify critical optimization gaps.
3. **Refinement:** Use the AI Coach to answer clarifying questions. Toggle **Web Search** if you need external data (e.g., "What are common KPIs for a Senior DevRel role?").
4. **Generation:** Execute the building phase to generate a tailored CV section-by-section.
5. **Export:** Preview the finalized resume in the professional A4-standard view and use the **Print** feature to generate a PDF.

---
*Developed with a focus on maximizing candidate success in modern algorithmic hiring pipelines.*
