# Community Connect Frontend

React single-page application for Community Connect, built with Vite, React Router, Tailwind CSS, Axios, React Hook Form, and React Icons.

## Run locally

1. Ensure the backend is available at `http://localhost:5000`.
2. Copy `.env.example` to `.env` and set `VITE_API_URL` when using a different API URL.
3. Run `npm install`.
4. Run `npm run dev` and open the local URL shown by Vite (normally `http://localhost:5173`).

Use `npm run build` to create a production build in `dist/`.

## API integration

The Axios client is centralized in `src/services/api.js`. Its request interceptor attaches the current JWT, while domain service modules encapsulate calls for authentication, posts, comments, reports, events, announcements, notifications, and users.

The admin dashboard requires an account with `role: "admin"`; that role is enforced by the backend, not by frontend state.
