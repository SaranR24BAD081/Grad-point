# GradPoint – Frontend

React 18 (Create React App) · Redux Toolkit · React Router 6 · Ant Design 5 · Recharts · Axios

## Run
```
npm install
npm start          # http://localhost:3000
```
The Spring Boot backend must be running on http://localhost:8080 (change it with
`REACT_APP_API_ORIGIN` in a `.env` file; see `.env.example`). `services/api.js` keeps the
`http://localhost:8080/api` base URL from the spec.

Log in with the seeded admin `admin@gradpoint.com` / `Admin@123`, or register a student/teacher.
The email is used as the username.

## Layout
- `components/` Login, Register, Navbar/Layout, SubjectList, SubjectForm, ErrorHandler, NotificationStack
- `pages/` Dashboard, SubjectsPage, MarksPage, AttendancePage, PredictionsPage, StudentsPage, ProfilePage, UsersPage
- `store/` auth + academic slices · `services/` api, authService · `hooks/useFetch.js`

## Who sees what
| Role | Pages |
|---|---|
| Student | Dashboard (own data), Subjects (read), Marks / Attendance / Predictions (own), My profile |
| Teacher | + record marks and attendance, Students |
| Admin | + add/edit/delete subjects, delete attendance, Users, Subject cards |
