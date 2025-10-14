# Copilot Instructions for Refugee_offline_ui

## Project Overview
This is a React-based offline UI for refugee management, with a modular structure and custom authentication. The app is organized into feature-based folders under `src/`, with clear separation of pages, components, layouts, context, and utilities.

## Architecture & Key Patterns
- **Entry Point:** `src/index.js` bootstraps the app; `src/App.js` is the main component.
- **Routing:** Managed via `src/routes.js` and custom `PrivateRoutes` in `src/auth/PrivateRoutes.js`.
- **Authentication:** JWT-based, with helpers in `src/auth/jwt.js` and `src/auth/decrypt.js`.
- **Context:** Global state via React Context in `src/components/context/appContext.jsx`.
- **Layouts:** Dashboard and simple layouts in `src/layouts/`, with nested header/nav structure.
- **Mock Data:** Used for development in `src/_mock/`.
- **UI Components:** Modular, reusable components in `src/components/` (e.g., Loader, NotificationMsg, chart, nav-section).
- **Theme:** Custom MUI theme in `src/theme/`.
- **Utilities:** Shared helpers in `src/utils/` (e.g., fetch, alerts, decodJWT).

## Developer Workflows
- **Start App:**
  ```powershell
  npm start
  ```
- **Build App:**
  ```powershell
  npm run build
  ```
- **Lint:**
  ```powershell
  npm run lint
  ```
- **No formal test suite detected.**

## Conventions & Patterns
- **File Naming:**
  - Components: `PascalCase.jsx` (e.g., `Loader.jsx`)
  - Utility files: `camelCase.js`
- **State Management:** Prefer React Context over Redux.
- **Authentication:** Use helpers from `src/auth/` for login, token decode, and route protection.
- **Routing:** Use `PrivateRoutes` for protected pages.
- **Mock Data:** Use files in `src/_mock/` for local development and UI prototyping.
- **Theme Customization:** Extend MUI theme via files in `src/theme/`.

## Integration Points
- **Firebase:** Config in `src/firebase.config.js` (if used).
- **Material-UI:** Custom theme and components.
- **Assets:** Static files in `public/assets/` and `src/components/fonts/`.

## Examples
- **Protected Route:** See `src/auth/PrivateRoutes.js` for custom route protection.
- **Global Context:** See `src/components/context/appContext.jsx` for app-wide state.
- **Custom Chart:** See `src/components/chart/useChart.js` for chart logic.

## Tips for AI Agents
- Always check for existing helpers/utilities before adding new ones.
- Follow the established folder structure for new features.
- Use mock data for UI development when backend is unavailable.
- Reference theme and context files for consistent UI and state.

---
_If any section is unclear or missing, please request clarification or provide feedback to improve these instructions._
