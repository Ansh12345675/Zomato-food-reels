# React + Vite

## Run the application locally

Start the backend from `backend` with `node server.js` (it listens on port
`3000` by default), then start the frontend from `frontend` with `npm run dev`.
Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The frontend sends API requests to `/api`; Vite proxies these requests to
`http://localhost:3000`. To use another API server, set `VITE_API_URL` to its
base API URL, such as `http://localhost:3000/api`.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
