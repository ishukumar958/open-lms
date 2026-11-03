package com.lms.openlms.config;

import com.lms.openlms.entity.ChatGroup;
import com.lms.openlms.entity.ChatGroupMember;
import com.lms.openlms.entity.ChatMessage;
import com.lms.openlms.entity.Course;
import com.lms.openlms.entity.Enrollment;
import com.lms.openlms.entity.Quiz;
import com.lms.openlms.entity.QuizOption;
import com.lms.openlms.entity.QuizQuestion;
import com.lms.openlms.entity.Role;
import com.lms.openlms.entity.User;
import com.lms.openlms.repository.ChatGroupMemberRepository;
import com.lms.openlms.repository.ChatGroupRepository;
import com.lms.openlms.repository.ChatMessageRepository;
import com.lms.openlms.repository.CourseRepository;
import com.lms.openlms.repository.EnrollmentRepository;
import com.lms.openlms.repository.QuizAnswerRepository;
import com.lms.openlms.repository.QuizAttemptRepository;
import com.lms.openlms.repository.QuizRepository;
import com.lms.openlms.repository.RoleRepository;
import com.lms.openlms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final ChatGroupRepository chatGroupRepository;
    private final ChatGroupMemberRepository chatGroupMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           CourseRepository courseRepository,
                           EnrollmentRepository enrollmentRepository,
                           QuizAnswerRepository quizAnswerRepository,
                           QuizAttemptRepository quizAttemptRepository,
                           QuizRepository quizRepository,
                           ChatGroupRepository chatGroupRepository,
                           ChatGroupMemberRepository chatGroupMemberRepository,
                           ChatMessageRepository chatMessageRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.quizAnswerRepository = quizAnswerRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
        this.chatGroupRepository = chatGroupRepository;
        this.chatGroupMemberRepository = chatGroupMemberRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Roles
        Role studentRole = roleRepository.findByRoleName("STUDENT").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("STUDENT");
            return roleRepository.save(r);
        });

        Role facultyRole = roleRepository.findByRoleName("FACULTY").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("FACULTY");
            return roleRepository.save(r);
        });

        // 2. Users
        String encodedPassword = passwordEncoder.encode("password123");

        User profEntity = userRepository.findByEmail("priya.sharma@geu.edu").orElseGet(() -> {
            User u = new User();
            u.setName("Prof. Priya Sharma");
            u.setEmail("priya.sharma@geu.edu");
            u.setRole(facultyRole);
            return u;
        });
        profEntity.setPasswordHash(encodedPassword);
        profEntity.setRole(facultyRole);
        profEntity.setIsActive(true);
        final User prof = userRepository.save(profEntity);

        User s1Entity = userRepository.findByEmail("rahul.sharma@geu.edu").orElseGet(() -> {
            User u = new User();
            u.setName("Rahul Sharma");
            u.setEmail("rahul.sharma@geu.edu");
            u.setRole(studentRole);
            return u;
        });
        s1Entity.setPasswordHash(encodedPassword);
        s1Entity.setRole(studentRole);
        s1Entity.setIsActive(true);
        final User student1 = userRepository.save(s1Entity);

        User s2Entity = userRepository.findByEmail("neha.patel@geu.edu").orElseGet(() -> {
            User u = new User();
            u.setName("Neha Patel");
            u.setEmail("neha.patel@geu.edu");
            u.setRole(studentRole);
            return u;
        });
        s2Entity.setPasswordHash(encodedPassword);
        s2Entity.setRole(studentRole);
        s2Entity.setIsActive(true);
        final User student2 = userRepository.save(s2Entity);

        // 3. Course: CS-301
        Course course = courseRepository.findByCourseCodeIgnoreCase("CS-301").orElseGet(() -> {
            Course c = new Course();
            c.setCourseCode("CS-301");
            c.setCourseName("Data Structures & Algorithms");
            c.setDescription("Fundamental concepts of data structures, algorithms, asymptotic analysis, and problem solving.");
            c.setSection("Section 01");
            c.setProfessor(prof);
            return courseRepository.save(c);
        });

        // 4. Enrollments
        if (!enrollmentRepository.existsByCourseCourseIdAndStudentUserId(course.getCourseId(), student1.getUserId())) {
            enrollmentRepository.save(new Enrollment(course, student1));
        }
        if (!enrollmentRepository.existsByCourseCourseIdAndStudentUserId(course.getCourseId(), student2.getUserId())) {
            enrollmentRepository.save(new Enrollment(course, student2));
        }

        resetAndSeedDsaQuizzes(course, prof);

        // 5. Initial Demo Group Chat
        if (chatGroupRepository.count() == 0) {
            ChatGroup group = new ChatGroup();
            group.setGroupName("CS-301 DSA Discussions");
            group.setDescription("Official study and discussion group for Data Structures & Algorithms course.");
            group.setCourse(course);
            group.setTeacher(prof);
            group.setGroupImage("indigo");
            group.setStatus("ACTIVE");
            group.setCreatedAt(LocalDateTime.now().minusDays(3));
            group.setUpdatedAt(LocalDateTime.now().minusHours(1));
            ChatGroup savedGroup = chatGroupRepository.save(group);

            chatGroupMemberRepository.save(new ChatGroupMember(savedGroup, student1));
            chatGroupMemberRepository.save(new ChatGroupMember(savedGroup, student2));

            // Seed initial messages
            ChatMessage msg1 = new ChatMessage(
                    savedGroup,
                    prof,
                    "Welcome to the CS-301 discussion group! Please use this group to ask questions about assignments, lecture concepts, and project milestones.",
                    "ANNOUNCEMENT"
            );
            msg1.setIsPinned(true);
            msg1.setPinnedAt(LocalDateTime.now().minusDays(2));
            msg1.setPinnedBy(prof);
            msg1.setCreatedAt(LocalDateTime.now().minusDays(2));
            chatMessageRepository.save(msg1);

            ChatMessage msg2 = new ChatMessage(
                    savedGroup,
                    student1,
                    "Hello Professor! For Assignment 1, should our AVL tree benchmarks include random vs sequential insertions?",
                    "TEXT"
            );
            msg2.setCreatedAt(LocalDateTime.now().minusDays(1));
            chatMessageRepository.save(msg2);

            ChatMessage msg3 = new ChatMessage(
                    savedGroup,
                    prof,
                    "Yes Rahul, please include both! Random keys will demonstrate average case logarithmic height balance.",
                    "TEXT"
            );
            msg3.setCreatedAt(LocalDateTime.now().minusHours(2));
            chatMessageRepository.save(msg3);
        }
    }

    private void resetAndSeedDsaQuizzes(Course course, User professor) {
        String firstTitle = "DSA Basics: Data Structures";
        String secondTitle = "DSA Basics: Algorithms";
        var existingQuizzes = quizRepository.findByCourseCourseId(course.getCourseId());
        boolean hasFreshQuizzes = existingQuizzes.size() == 2
                && existingQuizzes.stream()
                .anyMatch(quiz -> firstTitle.equals(quiz.getTitle()))
                && existingQuizzes.stream().anyMatch(quiz -> secondTitle.equals(quiz.getTitle()));
        if (hasFreshQuizzes) {
            return;
        }

        existingQuizzes.forEach(quiz -> {
            quizAttemptRepository.findByQuizQuizId(quiz.getQuizId()).forEach(attempt -> {
                quizAnswerRepository.deleteAll(quizAnswerRepository.findByAttemptAttemptId(attempt.getAttemptId()));
                quizAttemptRepository.delete(attempt);
            });
            quizRepository.delete(quiz);
        });

        seedQuiz(course, professor, firstTitle, 15, new String[][] {
                {"Which data structure provides LIFO access?", "Queue", "Stack", "1"},
                {"What is the average-case lookup time in a hash table?", "O(n)", "O(1)", "1"},
                {"Which traversal visits a binary search tree in sorted order?", "Preorder", "Inorder", "1"},
                {"What is the time complexity of binary search on a sorted array?", "O(n)", "O(log n)", "1"},
                {"Which data structure is best suited for breadth-first search?", "Stack", "Queue", "1"}
        });
        seedQuiz(course, professor, secondTitle, 15, new String[][] {
                {"What is the worst-case time complexity of quicksort?", "O(n)", "O(n²)", "1"},
                {"Which algorithm finds shortest paths with non-negative edge weights?", "Dijkstra", "Kruskal", "0"},
                {"What is the space complexity of an adjacency matrix for V vertices?", "O(V)", "O(V²)", "1"},
                {"Which sorting algorithm is stable by default?", "Heap sort", "Merge sort", "1"},
                {"What does a queue follow?", "LIFO", "FIFO", "1"}
        });
    }

    private void seedQuiz(Course course, User professor, String title, int durationMinutes,
                          String[][] questions) {
        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTitle(title);
        quiz.setDurationMinutes(durationMinutes);
        quiz.setTotalMarks(questions.length);
        quiz.setCreatedBy(professor);

        for (String[] questionData : questions) {
            QuizQuestion question = new QuizQuestion();
            question.setQuiz(quiz);
            question.setQuestionText(questionData[0]);
            question.setMarks(1);

            for (int optionIndex = 1; optionIndex <= 2; optionIndex++) {
                QuizOption option = new QuizOption();
                option.setQuestion(question);
                option.setOptionText(questionData[optionIndex]);
                option.setIsCorrect(Integer.toString(optionIndex - 1).equals(questionData[3]));
                question.getOptions().add(option);
            }
            quiz.getQuestions().add(question);
        }

        quizRepository.save(quiz);
    }
}
