# GradPoint – Backend

Spring Boot 3.3 · Java 17+ · Maven · MySQL · Spring Security (stateless HS256 JWT)

## Run
1. Start MySQL (the `gradpoint_db` database is created automatically).
2. Set credentials (or edit `src/main/resources/application.properties`):
   ```
   export DB_USERNAME=root
   export DB_PASSWORD=yourpassword
   export JWT_SECRET=<at-least-32-character-random-string>
   ```
3. `mvn spring-boot:run`  → API on http://localhost:8080

A first admin is seeded only when the users table is empty:
`admin@gradpoint.com` / `Admin@123` (override with `SEED_ADMIN_PASSWORD`, or set `app.seed.enabled=false`).
The frontend logs in with the email as the username.

## Endpoints
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/login, /api/auth/register | public |
| GET | /api/subjects, /api/subjects/{id} (`?filter=` optional) | authenticated |
| POST / PUT / DELETE | /api/subjects[/{id}] | ADMIN |
| GET | /api/marks, /api/marks/student/{id} | authenticated |
| POST | /api/marks | TEACHER, ADMIN (auto-updates prediction) |
| GET | /api/attendance | authenticated |
| POST | /api/attendance | TEACHER, ADMIN (auto-updates prediction) |
| DELETE | /api/attendance/{id} | ADMIN |
| GET | /api/predictions, /api/predictions/student/{id} | authenticated |
| GET | /api/students | TEACHER, ADMIN |
| GET | /api/students/{id} | authenticated |
| POST | /api/students/{id}/profile | STUDENT (own), ADMIN |
| GET / DELETE | /api/users[/{id}] | ADMIN |

Send `Authorization: Bearer <token>` on every non-auth request.

## Prediction rule
`predictedScore = avgMarks*0.7 + attendance%*0.3` → `<40` HIGH RISK, `40–70` MEDIUM, `>70` LOW.

## Request bodies (examples)
```json
POST /api/marks       {"score": 78, "examType": "Internal", "student": {"id": 3}, "subject": {"id": 1}}
POST /api/attendance  {"totalClasses": 40, "attendedClasses": 34, "student": {"id": 3}, "subject": {"id": 1}}
POST /api/subjects    {"name": "Mathematics", "credits": 4, "description": "Calculus", "teacher": {"id": 2}}
```
