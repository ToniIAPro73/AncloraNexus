# GEMINI.md - Anclora Metaform

## Project Overview

Anclora Metaform is a powerful, full-stack file conversion application with a primary focus on providing a high-quality, AI-powered API-as-a-Service (APIaaS). The project is designed to be a comprehensive solution for both individual users and businesses, offering a wide range of conversion formats and a flexible monetization model.

The application consists of two main parts:

*   **Frontend:** A modern, user-friendly web interface built with **React/TypeScript** and **Next.js**. It allows users to upload files, manage their accounts, and track their conversions. The frontend is styled with **Tailwind CSS** and uses **Vitest** for testing.
*   **Backend:** A robust backend service built with **Python** and the **Flask** web framework. It handles user authentication (using JWT), file processing, and payments (via Stripe). The backend uses **SQLAlchemy** as an ORM to interact with a **PostgreSQL** database, and leverages **Celery** with **Redis** for asynchronous task processing, ensuring scalability and performance.

The core of the project is its intelligent conversion engine, which supports over 150 formats and uses AI to optimize conversion quality. The business model is flexible, offering both pay-as-you-go options and various subscription tiers for individuals and businesses. Additionally, a gamified rewards system is in place to encourage user engagement.

## Building and Running

### Prerequisites

*   Node.js 18+ and npm/yarn
*   Python 3.10+
*   Git

### Frontend

To run the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

To run the frontend tests:

```bash
cd frontend
npm test
```

### Backend

To run the backend server:

```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
python src/main.py
```

To run the backend tests:

```bash
cd backend
python -m pytest tests/
```

**Note:** The backend requires environment variables to be set for `SECRET_KEY`, `JWT_SECRET_KEY`, and `ALLOWED_ORIGINS`. Refer to the `.env.example` file for more details.

## Development Conventions

*   **Frontend:** The frontend code follows standard React and TypeScript conventions, with a focus on creating reusable components. It uses ESLint and Prettier for code formatting and quality.
*   **Backend:** The backend is structured using Flask Blueprints to organize routes by functionality. It follows the best practices for building scalable and maintainable Flask applications.
*   **Commits:** The project uses Conventional Commits for clear and consistent commit messages.
*   **Testing:** Both the frontend and backend have comprehensive test suites. New features should be accompanied by corresponding tests.

## Key Files

*   `README.md`: The main entry point for understanding the project, with installation and setup instructions.
*   `frontend/`: Contains the entire Next.js frontend application.
*   `backend/`: Contains the Flask backend application.
*   `docs/BACKEND_ARCHITECTURE_ANCLORA.md`: A detailed document outlining the backend architecture, database schema, and key components.
*   `docs/ESTRATEGIA_API_ANCLORA.md`: A comprehensive document detailing the API-as-a-Service strategy, including market analysis, pricing models, and API design.
*   `data/`: Contains data files used by the application, such as conversion matrices and format references.
