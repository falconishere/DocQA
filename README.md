# 📘 DocQA – Context-Aware Document Question Answering

DocQA is an **AI-powered application** that allows users to upload documents and interact with them through natural language questions.  
It leverages LLMs with retrieval-based augmentation to provide **accurate, context-driven answers**, complete with **source highlighting** and **a dual-panel interface** for smooth navigation.

---

## 🚀 Features

- 📄 Multi-Format Document Support – Upload PDFs, TXT, Markdown, or HTML documents.  
- 🌐 Web URL Ingestion – Analyze live content from web pages without manual downloads.  
- 🤖 AI-Powered Q&A – Ask natural language questions and get context-aware answers powered by LLMs.  
- 🔍 Source Highlighting & Auto-Scroll – See exactly where the answer came from, highlighted in the document viewer.  
- 🎛 Configurable Answer Styles – Switch between *Classic, Brief, or Technical* modes and select domains like *General, Education, or Law*.  
- 🌓 Dual-Panel Interface with Theme Toggle – Parallel view of the document and chat interface with Light/Dark mode for usability.  

---

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js  
- **Styling/UI**: TailwindCSS, ShadCN components  
- **Backend/Logic**: Node.js, TypeScript  
- **AI Integration**: OpenAI GPT APIs (RAG pipeline)  
- **Document Parsing**: PDF.js / custom parsing logic  
- **Deployment**: Firebase Studio  

---

## 📂 Project Structure

``
src/
│-- ai/ # AI utilities, embeddings, and query handling
│-- app/ # App-level logic and routing
│-- components/ui/ # UI components (dual-panel, chat, etc.)
│-- hooks/ # React hooks for state & logic
│-- lib/ # Helpers, utils, parsing functions
docs/ # Documentation files
README.md # Project documentation
``

---

## ⚡ Future Roadmap

- Multi-Document Q&A across several files.  
- Persistent Chat History with cloud storage.  
- One-Click Summarization for high-level insights.  
- User Accounts and Personalized Workspaces.  
- Expanded File Support: DOCX and PPTX.  

---

## 👥 Team Contributions

- **Abhishan Francis** – Core architecture, AI integration, retrieval pipeline.  
- **Teammate 4** – Highlighting, auto-scroll, and debugging.  
- **Teammate 5** – Documentation, testing, and deployment setup.  

---

## 🏆 Why DocQA is Unique

Unlike generic tools (e.g., ChatPDF), **DocQA** emphasizes:  
- ✅ **Trust & Transparency** – Full sentence/paragraph highlighting instead of fragmented text.  
- ✅ **Domain Adaptability** – Legal, Medical, Educational modes for specialized use.  
- ✅ **Customizable Depth** – Users choose between brief, detailed, or academic answers.  
- ✅ **Professional UX** – Clean, dual-panel interface designed for real-world research.  

---

## 📸 Screenshots

*(Add screenshots or GIFs of your app in action here for judges & GitHub visitors.)*

---

## hi just testinh