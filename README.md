# Timetable Optimization System

A full-stack college timetable management platform with role-based access, automated timetable generation, publishing workflow, and live update support.

## Overview

This project helps admins generate and manage department-wise semester timetables while allowing faculty to submit timetable change requests and monitor published schedules.

Core capabilities include:

- Automated timetable generation with constraint-aware scheduling
- Admin CRUD for departments, subjects, faculty, classrooms, time slots, and users
- Draft and publish flow for generated timetables
- Live timetable updates through Socket.IO events
- Faculty request workflow for timetable modifications
- Role-based authentication and authorization

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express, Mongoose, JWT, Socket.IO
- Database: MongoDB

## Project Structure

- Frontend app: `client/`
- Backend API: `server/`
- Testing walkthrough: `TESTING_GUIDE.md`
- Recent fix notes: `FIXES_SUMMARY.md`

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or cloud connection string)

## Environment Variables

Create a file at `server/.env` with:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Installation

1. Install backend dependencies

   ```bash
   cd server
   npm install
   ```

2. Install frontend dependencies

   ```bash
   cd ../client
   npm install
   ```

## Seed Initial Data

From the server folder:

```bash
npm run seed
```

This seeds:
- Departments, subjects, classrooms, and time slots
- Admin user
- Faculty users with expertise mapping

## Run the Application

1. Start backend server (from server folder)

   ```bash
   npm run dev
   ```

2. Start frontend dev server (from client folder)

   ```bash
   npm run dev
   ```

3. Open the app in browser

   `http://localhost:5173`

Backend API runs on:

`http://localhost:5000`

## Demo Credentials

Admin login:

- Email: admin@college.edu
- Password: password123

Seeded faculty users also use:

- Password: password123

## Main Workflows

### Admin

- Log in
- Manage departments, subjects, faculty, classrooms, time slots, and users
- Generate timetables by selecting departments, semester, and working days
- View generated drafts
- Publish timetable
- Monitor published timetables in Live Updates

### Faculty

- Log in
- View relevant timetable data
- Create timetable change requests

### Student

- Role support exists in system; users can be created via admin user management/register routes.

## API Summary

Base URL:

`http://localhost:5000/api`

Auth:
- POST /auth/login
- POST /auth/register (admin only)

Admin:
- GET /admin/overview
- CRUD: /admin/departments
- CRUD: /admin/subjects
- CRUD: /admin/classrooms
- CRUD: /admin/faculty
- CRUD: /admin/timeslots
- CRUD: /admin/users

Timetable:
- POST /timetable/generate (admin)
- GET /timetable
- GET /timetable/:id
- PUT /timetable/:id/publish (admin)
- PUT /timetable/:id/entries/:entryId (admin)

Requests:
- GET /requests (authenticated)
- POST /requests (faculty/authenticated)
- PUT /requests/:id (admin)

## Scheduling Notes

The current scheduler is designed to:

- Use all configured working days and time slots
- Keep at least one free slot per day
- Balance allocations while handling constrained scenarios
- Return fully populated timetable entries for display and editing

## Testing

Follow the detailed end-to-end checklist in:

- `TESTING_GUIDE.md`

Expected behavior and recent fixes are documented in:

- `FIXES_SUMMARY.md`

## Scripts

Frontend (`client`):
- npm run dev
- npm run build
- npm run preview

Backend (`server`):
- npm start
- npm run dev
- npm run seed

## Current Known Defaults

- Frontend API points to `http://localhost:5000/api/`
- CORS is currently open in development configuration
- Socket connection emits `timetable_updated` events on publish and entry update

## License

ISC
