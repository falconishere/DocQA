# **App Name**: DocQA Lite

## Core Features:

- PDF Upload: Allow users to upload PDF documents for analysis.
- Document Chunking & Embedding: Automatically process uploaded PDFs: extract text, divide it into chunks, and generate embeddings for each chunk.
- Vector Database Storage: Store the generated embeddings in a lightweight vector database (FAISS).
- Question Input: Provide a text box for users to input natural language questions.
- Contextual Chunk Retrieval: Retrieve the most relevant text chunks from the vector database based on the user's question.
- AI-Powered Answer Generation: Leverage an LLM tool (e.g., OpenAI) to generate a concise answer based on the retrieved context. LLM uses its tool to reason when/if a piece of information needs to be added in the answer.
- Answer Display with References: Display the AI-generated answer to the user, along with references to the source document (page number/paragraph).

## Style Guidelines:

- Primary color: Dark blue (#3F51B5) to evoke trust and intelligence.
- Background color: Light gray (#F0F2F5) for a clean and neutral backdrop.
- Accent color: Orange (#FF9800) to highlight key elements like the submit button.
- Body and headline font: 'Inter' sans-serif for clear and accessible readability.
- Use simple, recognizable icons to represent actions (e.g., upload, question). Using the boxicons library. 
- Use a clean, single-column layout for ease of use. Prominent placement of upload button and question input.
- Subtle animations when displaying the AI-generated answer for user feedback.