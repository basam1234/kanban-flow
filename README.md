# KanbanFlow - Full Stack Project Management Tool

A robust, full-stack Kanban board application built to demonstrate core competency in the PERN stack (PostgreSQL, Express, React, Node.js). 

## 🚀 Features
- **Drag and Drop Interface:** Seamlessly move tasks between columns with optimistic UI updates.
- **Data Persistence:** Relational database design ensuring data integrity.
- **RESTful API:** Clean API structure with robust error handling.
- **Integration Testing:** Automated backend testing using Jest and Supertest.
- **Transaction Safety:** Uses SQL transactions to ensure reordering tasks is atomic and safe.

## 🛠 Tech Stack
- **Frontend:** React (Vite), TailwindCSS, @hello-pangea/dnd.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (Relationally modeled).
- **Testing:** Jest, Supertest.

## 🏗 System Design & Architectural Choices

### 1. Database Schema
I chose a normalized relational schema. 
- `columns` table: Stores board structure.
- `tasks` table: Stores items with a foreign key to `columns`.
- **Ordering Logic:** Used a `position` integer field. When a drag occurs, the frontend calculates the new order, and the backend performs a bulk update transaction. While a Lexorank algorithm is better for scale (Millions of users), integer indices are strictly typed and performant for this scope.

### 2. API Design (Optimistic UI)
To ensure the app feels snappy, the Frontend performs an "Optimistic Update." It updates the UI immediately upon dragging a card, then sends the request to the server. If the server fails (e.g., DB connection lost), the UI would revert (handled via error boundary/alert in this MVP).

### 3. Testing Strategy
I implemented **Integration Tests** over Unit Tests for the backend. In a CRUD heavy application, testing the flow from `API Endpoint -> Controller -> Database` provides significantly higher confidence and ROI than mocking every individual function.

## 🏃‍♂️ How to Run

1. **Setup Database:**
   Ensure PostgreSQL is running. Create a DB named `kanban_db` and run the SQL commands in `db_schema.sql`.

2. **Backend:**
   ```bash
   cd server
   npm install
   # Create .env with DB_PASSWORD=yourpassword
   npm run dev
