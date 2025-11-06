# Project Overview

This project is a comprehensive security system with multi-factor authentication, implemented in Node.js with Express. It's designed to manage user registration, authentication, and system monitoring, with a strong focus on information security.

**Main Technologies:**

*   **Backend:** Node.js, Express
*   **Database:** SQLite
*   **Authentication:** JSON Web Tokens (JWT), bcryptjs
*   **Security:** Helmet, express-rate-limit, CORS
*   **Email:** Nodemailer

**Architecture:**

The project follows a modular architecture with a clear separation of concerns:

*   **`src/config`:** Database configuration.
*   **`src/controllers`:** Request handlers for different routes.
*   **`src/database`:** Database initialization scripts and schema.
*   **`src/middleware`:** Custom middleware for authentication, error handling, and rate limiting.
*   **`src/models`:** Database models representing the application's data structure.
*   **`src/routes`:** Route definitions for different parts of the application.
*   **`src/services`:** Business logic for authentication, email, and MFA.
*   **`src/utils`:** Utility functions for generating tokens and codes.
*   **`frontend`:** Contains the frontend application, likely a single-page application (SPA).

# Building and Running

**1. Installation:**

```bash
npm install
```

**2. Configure Environment Variables:**

Create a `.env` file in the root directory by copying the `.env.example` file. Update the variables with your specific configuration.

```bash
cp .env.example .env
```

**3. Initialize the Database:**

```bash
npm run init-db
```

**4. Running the Application:**

*   **Development Mode (with auto-reloading):**

    ```bash
    npm run dev
    ```

*   **Production Mode:**

    ```bash
    npm start
    ```

The application will be available at `http://localhost:3000`.

# Development Conventions

*   **Coding Style:** The project appears to follow standard JavaScript and Node.js conventions.
*   **Testing:** There are no explicit tests in the provided file structure. A `test` script is defined in `package.json` but it currently does nothing.
*   **API Documentation:** The API is documented in the `API_DOCUMENTATION.md` file and also available at the `/api/docs` endpoint.
*   **Database:** The project uses SQLite for the database, with the schema defined in `src/database/schema.sql`.
*   **Frontend:** The `frontend` directory suggests a separation of the client-side application. It has its own `package.json`, indicating it's a separate project that likely communicates with the backend API.
