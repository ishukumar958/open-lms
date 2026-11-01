-- Open LMS Demo Seed Script
-- Safe and idempotent: can be run on empty or existing database
-- Default password for all seed accounts: password123

-- 1. Ensure Roles
INSERT IGNORE INTO roles (role_id, role_name) VALUES 
(1, 'STUDENT'),
(2, 'FACULTY');

-- 2. Seed Users
-- BCrypt hash for 'password123': $2a$10$WxmYf.j/QSpg1Gb7ODZOjeacOmJNypZjxxe/Xf4U/kgh.bsVnoRsm
INSERT INTO users (email, password_hash, name, role_id, is_active)
SELECT 'priya.sharma@geu.edu', '$2a$10$WxmYf.j/QSpg1Gb7ODZOjeacOmJNypZjxxe/Xf4U/kgh.bsVnoRsm', 'Prof. Priya Sharma', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'priya.sharma@geu.edu');

INSERT INTO users (email, password_hash, name, role_id, is_active)
SELECT 'rahul.sharma@geu.edu', '$2a$10$WxmYf.j/QSpg1Gb7ODZOjeacOmJNypZjxxe/Xf4U/kgh.bsVnoRsm', 'Rahul Sharma', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rahul.sharma@geu.edu');

INSERT INTO users (email, password_hash, name, role_id, is_active)
SELECT 'neha.patel@geu.edu', '$2a$10$WxmYf.j/QSpg1Gb7ODZOjeacOmJNypZjxxe/Xf4U/kgh.bsVnoRsm', 'Neha Patel', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'neha.patel@geu.edu');

-- 3. Seed Course (CS-301)
SET @prof_id = (SELECT user_id FROM users WHERE email = 'priya.sharma@geu.edu' LIMIT 1);
SET @student1_id = (SELECT user_id FROM users WHERE email = 'rahul.sharma@geu.edu' LIMIT 1);
SET @student2_id = (SELECT user_id FROM users WHERE email = 'neha.patel@geu.edu' LIMIT 1);

INSERT INTO courses (course_code, course_name, description, section, professor_id)
SELECT 'CS-301', 'Data Structures & Algorithms', 'Fundamental concepts of data structures, algorithms, asymptotic analysis, and problem solving.', 'Section 01', @prof_id
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CS-301');

SET @course_id = (SELECT course_id FROM courses WHERE course_code = 'CS-301' LIMIT 1);

-- 4. Enroll Students
INSERT INTO enrollments (course_id, student_id)
SELECT @course_id, @student1_id
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE course_id = @course_id AND student_id = @student1_id);

INSERT INTO enrollments (course_id, student_id)
SELECT @course_id, @student2_id
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE course_id = @course_id AND student_id = @student2_id);

-- 5. Seed Resources
INSERT INTO resources (course_id, title, description, file_url, uploaded_by, uploaded_at)
SELECT @course_id, 'CS-301 Course Syllabus & Roadmap', 'Complete syllabus, textbook references, and grading rubrics for the semester.', 'https://res.cloudinary.com/dholhsgd/image/upload/v1792635539/open_lms/resources/sample_syllabus_028bfac6.pdf', @prof_id, NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE course_id = @course_id AND title = 'CS-301 Course Syllabus & Roadmap');

-- 6. Seed Assignments
INSERT INTO assignments (course_id, title, description, max_marks, due_date, attachment_url, created_by)
SELECT @course_id, 'Assignment 1: Linked Lists & Binary Search Trees', 'Implement AVL tree rotations, balanced insertions, and runtime performance benchmarks.', 100, DATE_ADD(NOW(), INTERVAL 7 DAY), 'https://res.cloudinary.com/dholhsgd/image/upload/v1792635539/open_lms/resources/sample_syllabus_028bfac6.pdf', @prof_id
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course_id = @course_id AND title = 'Assignment 1: Linked Lists & Binary Search Trees');

INSERT INTO assignments (course_id, title, description, max_marks, due_date, attachment_url, created_by)
SELECT @course_id, 'Assignment 2: Graph Traversal & Shortest Paths', 'Implement BFS, DFS, Dijkstra, and A* pathfinding on grid maps.', 50, DATE_ADD(NOW(), INTERVAL 14 DAY), NULL, @prof_id
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course_id = @course_id AND title = 'Assignment 2: Graph Traversal & Shortest Paths');

SET @assign1_id = (SELECT assignment_id FROM assignments WHERE course_id = @course_id AND title = 'Assignment 1: Linked Lists & Binary Search Trees' LIMIT 1);
SET @assign2_id = (SELECT assignment_id FROM assignments WHERE course_id = @course_id AND title = 'Assignment 2: Graph Traversal & Shortest Paths' LIMIT 1);

-- 7. Seed Submissions for Assignment 1
-- Student 1 (Rahul): Approved with 92/100 and feedback
INSERT INTO submissions (assignment_id, student_id, submission_text, file_url, status, marks_obtained, feedback, submitted_at, graded_at)
SELECT @assign1_id, @student1_id, 'Completed AVL rotations and included unit test suites in the attached report.', 'https://res.cloudinary.com/dholhsgd/image/upload/v1792635539/open_lms/resources/sample_syllabus_028bfac6.pdf', 'APPROVED', 92, 'Excellent implementation of double rotations and clean test coverage.', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE assignment_id = @assign1_id AND student_id = @student1_id);

-- Student 2 (Neha): Submitted, awaiting grading
INSERT INTO submissions (assignment_id, student_id, submission_text, file_url, status, submitted_at)
SELECT @assign1_id, @student2_id, 'Implemented all tree methods; benchmark graph is attached.', 'https://res.cloudinary.com/dholhsgd/image/upload/v1792635539/open_lms/resources/sample_syllabus_028bfac6.pdf', 'SUBMITTED', DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE assignment_id = @assign1_id AND student_id = @student2_id);

-- 8. Seed Quiz
INSERT INTO quizzes (course_id, title, duration_minutes, total_marks, created_by)
SELECT @course_id, 'Quiz 1: Algorithmic Complexity & Stacks', 20, 10, @prof_id
WHERE NOT EXISTS (SELECT 1 FROM quizzes WHERE course_id = @course_id AND title = 'Quiz 1: Algorithmic Complexity & Stacks');

SET @quiz_id = (SELECT quiz_id FROM quizzes WHERE course_id = @course_id AND title = 'Quiz 1: Algorithmic Complexity & Stacks' LIMIT 1);

-- Question 1
INSERT INTO quiz_questions (quiz_id, question_text, marks)
SELECT @quiz_id, 'What is the worst-case time complexity of inserting an element into an unbalanced Binary Search Tree?', 5
WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE quiz_id = @quiz_id AND question_text LIKE 'What is the worst-case%');

SET @q1_id = (SELECT question_id FROM quiz_questions WHERE quiz_id = @quiz_id AND question_text LIKE 'What is the worst-case%' LIMIT 1);

INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @q1_id, 'O(1)', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @q1_id AND option_text = 'O(1)');

INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @q1_id, 'O(log n)', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @q1_id AND option_text = 'O(log n)');

INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @q1_id, 'O(n)', 1
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @q1_id AND option_text = 'O(n)');

INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @q1_id, 'O(n log n)', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @q1_id AND option_text = 'O(n log n)');

-- Question 2
INSERT INTO quiz_questions (quiz_id, question_text, marks)
SELECT @quiz_id, 'Which data structure follows the Last-In First-Out (LIFO) principle?', 5
WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE quiz_id = @quiz_id AND question_text LIKE 'Which data structure follows%');

SET @q2_id = (SELECT question_id FROM quiz_questions WHERE quiz_id = @quiz_id AND question_text LIKE 'Which data structure follows%' LIMIT 1);

INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @q2_id, 'Queue', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @q2_id AND option_text = 'Queue');

INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @q2_id, 'Stack', 1
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @q2_id AND option_text = 'Stack');

INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @q2_id, 'Array', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @q2_id AND option_text = 'Array');

INSERT INTO quiz_options (question_id, option_text, is_correct)
SELECT @q2_id, 'Heap', 0
WHERE NOT EXISTS (SELECT 1 FROM quiz_options WHERE question_id = @q2_id AND option_text = 'Heap');

-- 9. Seed Quiz Attempt for Student 1 (Rahul): Score 10/10
INSERT INTO quiz_attempts (quiz_id, student_id, status, score, started_at, submitted_at)
SELECT @quiz_id, @student1_id, 'SUBMITTED', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE NOT EXISTS (SELECT 1 FROM quiz_attempts WHERE quiz_id = @quiz_id AND student_id = @student1_id);

SET @attempt_id = (SELECT attempt_id FROM quiz_attempts WHERE quiz_id = @quiz_id AND student_id = @student1_id LIMIT 1);

SET @q1_opt3 = (SELECT option_id FROM quiz_options WHERE question_id = @q1_id AND option_text = 'O(n)' LIMIT 1);
SET @q2_opt2 = (SELECT option_id FROM quiz_options WHERE question_id = @q2_id AND option_text = 'Stack' LIMIT 1);

INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id)
SELECT @attempt_id, @q1_id, @q1_opt3
WHERE NOT EXISTS (SELECT 1 FROM quiz_answers WHERE attempt_id = @attempt_id AND question_id = @q1_id);

INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id)
SELECT @attempt_id, @q2_id, @q2_opt2
WHERE NOT EXISTS (SELECT 1 FROM quiz_answers WHERE attempt_id = @attempt_id AND question_id = @q2_id);


INSERT INTO courses (course_code, course_name, description, section, professor_id)
SELECT 'BIO-214', 'Cell & Molecular Biology', 'Comprehensive curriculum covering cell structure, enzymatic reactions, DNA replication, and microscopy labs.', 'Section 02', @prof_id
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'BIO-214');

SET @bio_course_id = (SELECT course_id FROM courses WHERE course_code = 'BIO-214' LIMIT 1);

INSERT INTO enrollments (course_id, student_id)
SELECT @bio_course_id, @student1_id
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE course_id = @bio_course_id AND student_id = @student1_id);

INSERT INTO enrollments (course_id, student_id)
SELECT @bio_course_id, @student2_id
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE course_id = @bio_course_id AND student_id = @student2_id);

INSERT INTO assignments (course_id, title, description, max_marks, due_date, created_by)
SELECT @bio_course_id, 'Lab Reflection 03: Membrane Permeability', 'Analyze dialysis tubing observations and document solute concentration gradients across selective membranes.', 50, DATE_ADD(NOW(), INTERVAL 5 DAY), @prof_id
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course_id = @bio_course_id AND title = 'Lab Reflection 03: Membrane Permeability');

INSERT INTO courses (course_code, course_name, description, section, professor_id)
SELECT 'DES-202', 'User Experience & Interface Design', 'Studio course emphasizing user research, wireframing, heuristic evaluation, and interactive design sprints.', 'Section 01', @prof_id
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'DES-202');

SET @des_course_id = (SELECT course_id FROM courses WHERE course_code = 'DES-202' LIMIT 1);

INSERT INTO enrollments (course_id, student_id)
SELECT @des_course_id, @student1_id
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE course_id = @des_course_id AND student_id = @student1_id);

INSERT INTO assignments (course_id, title, description, max_marks, due_date, created_by)
SELECT @des_course_id, 'Design Sprint 1: Mobile Wireframes & Heuristics', 'Submit lo-fi wireframe sketches and accessibility audit for the e-commerce redesign project.', 100, DATE_ADD(NOW(), INTERVAL 9 DAY), @prof_id
WHERE NOT EXISTS (SELECT 1 FROM assignments WHERE course_id = @des_course_id AND title = 'Design Sprint 1: Mobile Wireframes & Heuristics');

-- 10. Seed Demo Group Chat
INSERT INTO chat_groups (group_id, group_name, description, course_id, teacher_id, status)
SELECT 1, 'CS-301 DSA Discussions', 'Official study and discussion group for Data Structures & Algorithms.', @course_id, @prof_id, 'ACTIVE'
WHERE @prof_id IS NOT NULL AND @course_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM chat_groups WHERE group_id = 1);

INSERT IGNORE INTO chat_group_members (group_id, student_id, joined_at, last_read_at)
SELECT 1, @student1_id, NOW(), NOW() WHERE @student1_id IS NOT NULL;

INSERT IGNORE INTO chat_group_members (group_id, student_id, joined_at, last_read_at)
SELECT 1, @student2_id, NOW(), NOW() WHERE @student2_id IS NOT NULL;

INSERT INTO chat_messages (message_id, group_id, sender_id, message_content, message_type, is_pinned, pinned_at, pinned_by, created_at)
SELECT 1, 1, @prof_id, 'Welcome to the CS-301 discussion group! Please use this group to ask questions about assignments, lecture concepts, and project milestones.', 'ANNOUNCEMENT', TRUE, NOW(), @prof_id, DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE @prof_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM chat_messages WHERE message_id = 1);

INSERT INTO chat_messages (message_id, group_id, sender_id, message_content, message_type, is_pinned, created_at)
SELECT 2, 1, @student1_id, 'Hello Professor! For Assignment 1, should our AVL tree benchmarks include random vs sequential insertions?', 'TEXT', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE @student1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM chat_messages WHERE message_id = 2);

INSERT INTO chat_messages (message_id, group_id, sender_id, message_content, message_type, is_pinned, created_at)
SELECT 3, 1, @prof_id, 'Yes Rahul, please include both! Random keys will demonstrate average case logarithmic height balance.', 'TEXT', FALSE, DATE_SUB(NOW(), INTERVAL 18 HOUR)
WHERE @prof_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM chat_messages WHERE message_id = 3);


