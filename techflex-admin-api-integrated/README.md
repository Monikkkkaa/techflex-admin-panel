# Techflex Admin Panel

React + Vite admin panel for Techflex Plasto inquiry management.

## Setup

```bash
npm install
npm run dev
```

## API Base URL

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Backend APIs Used

- POST `/api/admin/login`
- POST `/api/admin/forgot-password`
- POST `/api/admin/verify-otp`
- POST `/api/admin/reset-password`
- GET `/api/contact`
- PATCH `/api/contact/:id/status`
- DELETE `/api/contact/:id`

## Login

Use the admin email/password configured in your backend.
