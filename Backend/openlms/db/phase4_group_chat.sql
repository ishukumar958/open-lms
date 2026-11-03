-- Open LMS - Phase 4: Teacher-Controlled Group Chat Module
-- Adds tables for chat_groups, chat_group_members, and chat_messages

CREATE TABLE IF NOT EXISTS chat_groups (
    group_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(150) NOT NULL,
    description TEXT,
    course_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    group_image VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_group_course FOREIGN KEY (course_id) REFERENCES courses (course_id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_group_teacher FOREIGN KEY (teacher_id) REFERENCES users (user_id) ON DELETE CASCADE,
    INDEX idx_cg_teacher (teacher_id),
    INDEX idx_cg_course (course_id),
    INDEX idx_cg_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cgm_group FOREIGN KEY (group_id) REFERENCES chat_groups (group_id) ON DELETE CASCADE,
    CONSTRAINT fk_cgm_student FOREIGN KEY (student_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT uk_cgm_group_student UNIQUE (group_id, student_id),
    INDEX idx_cgm_student (student_id),
    INDEX idx_cgm_group (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message_content TEXT NOT NULL,
    message_type VARCHAR(30) NOT NULL DEFAULT 'TEXT',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    pinned_at DATETIME NULL,
    pinned_by BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_cm_group FOREIGN KEY (group_id) REFERENCES chat_groups (group_id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_sender FOREIGN KEY (sender_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_pinned_by FOREIGN KEY (pinned_by) REFERENCES users (user_id) ON DELETE SET NULL,
    INDEX idx_cm_group_created (group_id, created_at),
    INDEX idx_cm_sender (sender_id),
    INDEX idx_cm_pinned (group_id, is_pinned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional initial seed for demo course CS-301
SET @prof_id = (SELECT user_id FROM users WHERE email = 'priya.sharma@geu.edu' LIMIT 1);
SET @course_id = (SELECT course_id FROM courses WHERE course_code = 'CS-301' LIMIT 1);
SET @student1_id = (SELECT user_id FROM users WHERE email = 'rahul.sharma@geu.edu' LIMIT 1);
SET @student2_id = (SELECT user_id FROM users WHERE email = 'neha.patel@geu.edu' LIMIT 1);

INSERT INTO chat_groups (group_id, group_name, description, course_id, teacher_id, status)
SELECT 1, 'CS-301 DSA Project Discussions', 'Official study and discussion group for Data Structures & Algorithms course.', @course_id, @prof_id, 'ACTIVE'
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
