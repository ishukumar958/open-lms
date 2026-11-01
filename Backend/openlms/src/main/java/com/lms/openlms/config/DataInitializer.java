package com.lms.openlms.config;

import com.lms.openlms.entity.ChatGroup;
import com.lms.openlms.entity.ChatGroupMember;
import com.lms.openlms.entity.ChatMessage;
import com.lms.openlms.entity.Course;
import com.lms.openlms.entity.Enrollment;
import com.lms.openlms.entity.Role;
import com.lms.openlms.entity.User;
import com.lms.openlms.repository.ChatGroupMemberRepository;
import com.lms.openlms.repository.ChatGroupRepository;
import com.lms.openlms.repository.ChatMessageRepository;
import com.lms.openlms.repository.CourseRepository;
import com.lms.openlms.repository.EnrollmentRepository;
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
    private final ChatGroupRepository chatGroupRepository;
    private final ChatGroupMemberRepository chatGroupMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           CourseRepository courseRepository,
                           EnrollmentRepository enrollmentRepository,
                           ChatGroupRepository chatGroupRepository,
                           ChatGroupMemberRepository chatGroupMemberRepository,
                           ChatMessageRepository chatMessageRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
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
}
