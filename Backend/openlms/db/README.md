# Database Migration & Seed Guide

This document describes the ordered sequence of SQL scripts required to initialize, migrate, and seed the Open LMS database on a fresh MySQL instance.

---

## 1. Database Setup

Ensure MySQL is running and create the `open_lms` database:

```sql
CREATE DATABASE IF NOT EXISTS open_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE open_lms;
```

---

## 2. Ordered SQL Execution Sequence

Execute the SQL files located in `Backend/openlms/db/` in the following strict order:

| Step | Script | Description |
|:---|:---|:---|
| **1** | `phase0_roles.sql` | Inserts the base authorization roles (`STUDENT` and `FACULTY`). |
| **2** | `phase1_courses.sql` | Adds `description` and `section` columns to `courses`. |
| **3** | `phase1_assignments.sql` | Adds `description` and `attachment_url` columns to `assignments`. |
| **4** | `phase2_resources.sql` | Adds `description` and `uploaded_at` columns to `resources`. |
| **5** | `phase2_submissions.sql` | Adds `submission_text`, `file_url`, `feedback`, `submitted_at`, `graded_at` columns and unique index to `submissions`. |
| **6** | `phase3_quizzes.sql` | Adds `duration_minutes` to `quizzes` and `started_at`, `submitted_at` to `quiz_attempts`. |
| **7** | `phase4_group_chat.sql` | Creates `chat_groups`, `chat_group_members`, and `chat_messages` tables with indices and demo course discussion group. |
| **8** | `seed_demo.sql` | Idempotent demo dataset: faculty (`priya.sharma@geu.edu`), students (`rahul.sharma@geu.edu`, `neha.patel@geu.edu`), course `CS-301`, assignments, submissions, resources, quiz with questions, and completed attempts. |

### Running via MySQL CLI (Windows PowerShell)

```powershell
$SQL_DIR = "Backend\openlms\db"
$SCRIPTS = @(
    "phase0_roles.sql",
    "phase1_courses.sql",
    "phase1_assignments.sql",
    "phase2_resources.sql",
    "phase2_submissions.sql",
    "phase3_quizzes.sql",
    "phase4_group_chat.sql",
    "seed_demo.sql"
)

foreach ($script in $SCRIPTS) {
    Write-Host "Applying $script..."
    & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot open_lms -e "source $SQL_DIR\$script"
}
```

---

## 3. Environment Variables

The backend requires the following environment variables (defined in `.env` or system environment):

| Variable | Description | Default / Example |
|---|---|---|
| `SPRING_DATASOURCE_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/open_lms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `SPRING_DATASOURCE_USERNAME` | Database user | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `root` |
| `JWT_SECRET` | HMAC SHA256 key (min 32 chars) | `c3VwZXJzZWNyZXRqd3RrZXlmb3JvcGVubG1zZGV2ZWxvcG1lbnQyMDI2` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | e.g. `dholhsgd` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | e.g. `513667225463921` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | e.g. `B-91EynEDK3jpsjkIGVbLY-duzk` |

---

## 4. Running the Application

### Running the Backend

From `Backend/openlms`:

```powershell
# Set environment variables for Cloudinary
$env:CLOUDINARY_CLOUD_NAME="your_cloud_name"
$env:CLOUDINARY_API_KEY="your_api_key"
$env:CLOUDINARY_API_SECRET="your_api_secret"

# Compile and run
.\mvnw.cmd spring-boot:run
```

The backend server listens on `http://localhost:8081` with base path `/api/v1`.

On startup, `DataInitializer` also creates the demo CS-301 DSA certification quiz if it does not already exist. Restart the backend after pulling this change so the quiz is available to both the course owner and enrolled students.

### Running the Frontend

From `Frontend`:

```powershell
# Install dependencies (first time only)
npm install

# Run Vite development server
npm run dev
```

The frontend server runs on `http://localhost:5173`.

---

## 5. Seed Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Faculty** | `priya.sharma@geu.edu` | `password123` | Prof. Priya Sharma (owner of course `CS-301`) |
| **Student** | `rahul.sharma@geu.edu` | `password123` | Rahul Sharma (enrolled in `CS-301`, has graded submissions & completed quiz) |
| **Student** | `neha.patel@geu.edu` | `password123` | Neha Patel (enrolled in `CS-301`, has submitted pending assignment) |
