# GEMINI Project Analysis: Portal de Verificação Medicamentosa

## Project Overview

This project is a **Medication Verification Portal**, a web application designed to assist clinical pharmacists in analyzing drug interactions. It leverages the OpenAI API (specifically, GPT-4o-mini) to provide intelligent, evidence-based analyses.

The frontend is built with **React** and **Vite**, styled with **Tailwind CSS**. The backend is powered by **Supabase**, which provides the PostgreSQL database, authentication, and serverless functions.

The application's core features include:
-   **Intelligent Drug Analysis:** Select multiple medications and receive an AI-powered analysis of potential interactions.
-   **Scientific Database:** The analyses are based on a knowledge base of known drug interactions.
-   **Detailed Reporting:** Generate comprehensive reports for pharmaceutical consultations.

## Building and Running

### Prerequisites
-   Node.js (v18 or higher)
-   `yarn` or `npm`
-   A Supabase account and project
-   An OpenAI API key

### Setup and Execution

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file and add your Supabase and OpenAI credentials.
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    VITE_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```
    **Note:** The `VITE_OPENAI_API_KEY` is currently exposed on the client-side, which is a security risk. It is highly recommended to move the OpenAI API calls to a Supabase Edge Function.

3.  **Set up the Database:**
    -   Navigate to the SQL Editor in your Supabase project.
    -   Execute the contents of `database/schema_fixed.sql` to create the necessary tables.
    -   Execute the contents of `database/interactions_data.sql` to populate the database with initial data.

4.  **Run the Application:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Key Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Creates a production build of the application.
-   `npm run lint`: Lints the codebase using ESLint.
-   `npm run preview`: Serves the production build locally for preview.

## Development Conventions

### Code Style
The project uses ESLint to enforce a consistent code style. The configuration can be found in the `.eslintrc.cjs` file.

### Commit Messages
The `README.md` suggests using **Conventional Commits** for clear and organized version history. Examples include:
-   `feat:` for new features
-   `fix:` for bug fixes
-   `docs:` for documentation changes
-   `refactor:` for code refactoring

### Testing
There is currently no testing framework set up. Adding a testing library like **Vitest** or **React Testing Library** would be a valuable improvement to ensure code quality and reliability.
