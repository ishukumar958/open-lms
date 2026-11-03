# Open LMS — Manual Smoke Test Checklist

**Run time:** ~15 minutes  
**Prerequisites:**
1. MySQL `open_lms` database initialized and seeded via `Backend/openlms/db/README.md`.
2. Backend running on `http://localhost:8081` (with `CLOUDINARY_*` env variables set).
3. Frontend running on `http://localhost:5173` with `VITE_USE_MOCKS=false`.

---

## 1. Authentication & Profile (`/api/v1/auth`)

- [ ] **1.1 Login with Seed Faculty**
  - Navigate to `/login`.
  - Enter email `priya.sharma@geu.edu` and password `password123`. Click "Sign In".
  - **Expected:** Redirected to Professor Dashboard `/professor/dashboard`. Navigation shows "Prof. Priya Sharma".

- [ ] **1.2 Verify Session Persistence (`/auth/me`)**
  - Press browser Refresh (F5).
  - **Expected:** Session persists, user remains logged in as faculty without redirect to login.

- [ ] **1.3 Logout & Student Login**
  - Click user profile / Logout button.
  - **Expected:** Redirected to `/login`.
  - Enter student email `rahul.sharma@geu.edu` and password `password123`. Click "Sign In".
  - **Expected:** Redirected to Student Dashboard `/student/dashboard`.

- [ ] **1.4 Student Registration**
  - Logout and navigate to `/signup/student`.
  - Register with a new email `test.student@geu.edu`, name `Test Student`, password `password123`.
  - **Expected:** Account created (HTTP 201), automatically logged in or redirected to student classes.

---

## 2. Course Management & Enrollment (`/api/v1/courses`)

- [ ] **2.1 View Seed Course (Student)**
  - As student `rahul.sharma@geu.edu`, go to "My Classes" (`/student/classes`).
  - **Expected:** Card for `CS-301: Data Structures & Algorithms` appears with professor name "Prof. Priya Sharma".

- [ ] **2.2 Create Course (Faculty)**
  - Login as faculty `priya.sharma@geu.edu`, navigate to "My Courses" (`/professor/courses`).
  - Click "+ Create New Course". Fill Title: `WEB-201 Modern Web Development`, Section: `Section 02`, Description: `Fullstack app development`. Click Create.
  - **Expected:** Course created (HTTP 201), unique class code is generated and displayed with a copy button.

- [ ] **2.3 Join Course via Code (Student)**
  - Login as `test.student@geu.edu`. Navigate to "My Classes" (`/student/classes`).
  - Click "Join Class", enter the class code from step 2.2, click Join.
  - **Expected:** Success notification; `WEB-201` card immediately appears in student classes.

- [ ] **2.4 View Students Roster & Leave Course**
  - As faculty `priya.sharma@geu.edu`, open `WEB-201` and navigate to the "Students" tab.
  - **Expected:** `Test Student` is listed in the roster.
  - As `test.student@geu.edu`, click "Leave Class" on `WEB-201`.
  - **Expected:** Course removed from student's classes. Roster on faculty side no longer shows student.

---

## 3. Resources (`/api/v1/courses/{courseId}/resources`, `/resources/{id}`)

- [ ] **3.1 View Existing Resources (Student)**
  - As student `rahul.sharma@geu.edu`, open `CS-301` and click the "Resources" tab.
  - **Expected:** `CS-301 Course Syllabus & Roadmap` is listed with a working link to the PDF.

- [ ] **3.2 Add Resource (Faculty)**
  - As faculty `priya.sharma@geu.edu`, open `CS-301` > "Resources" tab.
  - Click "+ Add Resource". Provide Title: `Week 1 Slides`, Link: `https://example.com/slides.pdf`. Click Add.
  - **Expected:** Resource created (HTTP 201) and visible in list.

- [ ] **3.3 Delete Resource (Faculty)**
  - Click Delete (trash icon) on `Week 1 Slides`.
  - **Expected:** Confirmation prompt; resource deleted (HTTP 204) and disappears from list.

---

## 4. Assignments (`/api/v1/assignments`)

- [ ] **4.1 Create Assignment with Attachment (Faculty)**
  - As faculty `priya.sharma@geu.edu`, open `CS-301` > "Assignments" tab.
  - Click "+ Create Assignment". Title: `Assignment 3: Dynamic Programming`, Max Marks: `100`, Due Date: 7 days ahead.
  - Upload or enter an attachment URL. Click Create.
  - **Expected:** Assignment appears in assignment list with status/dates.

- [ ] **4.2 View Student Assignments & Calendar (Student)**
  - As student `rahul.sharma@geu.edu`, navigate to "Assignments" (`/student/assignments`) and "Calendar" (`/student/calendar`).
  - **Expected:** `Assignment 3` appears with status badge `PENDING`. Calendar highlights the due date.

---

## 5. Submissions & Grading (`/api/v1/submissions`)

- [ ] **5.1 Submit Assignment (Student)**
  - As student `rahul.sharma@geu.edu`, open `Assignment 3`.
  - Enter submission text: `Here is my DP matrix solution` and optional file attachment. Click "Submit".
  - **Expected:** Status changes to `SUBMITTED` (HTTP 201). Re-submitting updates the text/file (HTTP 200).

- [ ] **5.2 Faculty Grading Queue & Grading**
  - As faculty `priya.sharma@geu.edu`, navigate to "Submissions" (`/professor/submissions`).
  - Filter by `CS-301`.
  - **Expected:** Rahul's submission for `Assignment 3` appears under status `SUBMITTED`.
  - Click on the submission, enter Marks: `95`, Feedback: `Great dynamic programming recurrence.`, and click "Approve".
  - **Expected:** Submission status updates to `APPROVED` (HTTP 200).

- [ ] **5.3 Verify Graded Feedback (Student)**
  - As student `rahul.sharma@geu.edu`, check `Assignment 3`.
  - **Expected:** Status badge displays `APPROVED`, score `95/100`, and professor feedback is visible.

---

## 6. Quizzes & Attempts (`/api/v1/quizzes`)

- [ ] **6.1 Create Quiz (Faculty)**
  - As faculty `priya.sharma@geu.edu`, open `CS-301` > "Quizzes" tab.
  - Click "+ Create Quiz". Title: `Quiz 2: Tree Traversals`, Duration: `15` mins.
  - Add Question: "Which traversal visits the root first?", Marks: `5`.
    - Options: "In-order" (false), "Pre-order" (true), "Post-order" (false).
  - Click "Publish Quiz".
  - **Expected:** Quiz created (HTTP 201) with computed total marks = 5.

- [ ] **6.2 Take and Submit Quiz (Student)**
  - As student `neha.patel@geu.edu`, open `CS-301` > "Quizzes" tab.
  - Click "Start Quiz" on `Quiz 2`.
  - **Expected:** Fullscreen quiz interface opens with 15-minute countdown timer. Options do NOT reveal which is correct.
  - Select "Pre-order" and click "Submit Quiz". Confirm submission.
  - **Expected:** HTTP 200; immediate review displays Score: `5/5`, showing selected option and correctness review.

- [ ] **6.3 Review Attempts (Faculty)**
  - As faculty `priya.sharma@geu.edu`, open `Quiz 2` > View Attempts.
  - **Expected:** Neha Patel's attempt is listed with status `SUBMITTED`, score `5/5`.

---

## 7. Gradebook & Grades (`/api/v1/courses/{courseId}/gradebook`, `/grades/me`)

- [ ] **7.1 Professor Gradebook**
  - As faculty `priya.sharma@geu.edu`, navigate to "Gradebook" (`/professor/gradebook`). Select `CS-301`.
  - **Expected:** Matrix table lists enrolled students (Rahul Sharma, Neha Patel) with columns for assignments and quizzes, along with computed total obtained, total max, and overall percentage.

- [ ] **7.2 Student Grades Summary**
  - As student `rahul.sharma@geu.edu`, open `CS-301` > "Grades" tab.
  - **Expected:** Breakdown shows Assignment 1 (92/100), Assignment 3 (95/100), Quiz 1 (10/10), with correct aggregate percentage.

---

## 8. Dashboards (`/api/v1/dashboard/student`, `/api/v1/dashboard/professor`)

- [ ] **8.1 Student Dashboard Summary**
  - As student `rahul.sharma@geu.edu`, navigate to `/student/dashboard`.
  - **Expected:** Stats cards show enrolled courses count, pending assignments, and calculated average grade percentage. Courses list shows progress percentages.

- [ ] **8.2 Professor Dashboard Summary**
  - As faculty `priya.sharma@geu.edu`, navigate to `/professor/dashboard`.
  - **Expected:** Stats cards show total active courses, distinct student count, pending grading queue count, and class average grade. Grading queue lists oldest submitted items.

---

## 9. File Uploads (`/api/v1/files/upload`)

- [ ] **9.1 Test Upload via FileUploader**
  - In course resources or assignment creation, use the file upload component to drag-and-drop a sample `.pdf` or `.png` file.
  - **Expected:** Upload progress indicator appears, followed by a valid HTTPS Cloudinary URL populated in the field.
- [ ] **9.2 Test Disallowed File Type**
  - Attempt to upload an `.exe` or disallowed format.
  - **Expected:** Frontend error message and backend HTTP 415 rejection.
