package com.lms.openlms.service;

import com.lms.openlms.dto.CourseDto;
import com.lms.openlms.entity.Course;
import com.lms.openlms.entity.Enrollment;
import com.lms.openlms.entity.User;
import com.lms.openlms.exception.ConflictException;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.repository.CourseRepository;
import com.lms.openlms.repository.EnrollmentRepository;
import com.lms.openlms.repository.UserRepository;
import com.lms.openlms.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@Transactional
public class CourseService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseAccessService courseAccessService;

    public CourseService(CourseRepository courseRepository,
                         EnrollmentRepository enrollmentRepository,
                         UserRepository userRepository,
                         CourseAccessService courseAccessService) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseAccessService = courseAccessService;
    }

    public CourseDto.CourseResponse createCourse(Long professorUserId, CourseDto.CreateCourseRequest request) {
        User professor = userRepository.findById(professorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String code = generateUniqueCourseCode();

        Course course = new Course();
        course.setCourseName(request.getCourseName().trim());
        course.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        String section = (request.getSection() != null && !request.getSection().trim().isEmpty())
                ? request.getSection().trim() : "Section 01";
        course.setSection(section);
        course.setCourseCode(code);
        course.setProfessor(professor);

        Course saved = courseRepository.save(course);
        return toCourseResponse(saved, 0);
    }

    @Transactional(readOnly = true)
    public List<CourseDto.CourseResponse> listMyCourses(AuthUser user) {
        if ("FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role())) {
            List<Course> courses = courseRepository.findByProfessorUserIdOrderByCourseNameAsc(user.userId());
            return courses.stream()
                    .map(c -> toCourseResponse(c, enrollmentRepository.countByCourseCourseId(c.getCourseId())))
                    .toList();
        } else {
            List<Enrollment> enrollments = enrollmentRepository.findByStudentUserIdOrderByCourseCourseNameAsc(user.userId());
            return enrollments.stream()
                    .map(Enrollment::getCourse)
                    .filter(Objects::nonNull)
                    .map(c -> toCourseResponse(c, enrollmentRepository.countByCourseCourseId(c.getCourseId())))
                    .toList();
        }
    }

    @Transactional(readOnly = true)
    public CourseDto.CourseResponse getCourse(Long courseId, AuthUser user) {
        Course course = courseAccessService.requireMemberOrOwner(courseId, user);
        long count = enrollmentRepository.countByCourseCourseId(courseId);
        return toCourseResponse(course, count);
    }

    public CourseDto.CourseResponse updateCourse(Long courseId, Long professorUserId, CourseDto.UpdateCourseRequest request) {
        Course course = courseAccessService.requireOwner(courseId, professorUserId);

        course.setCourseName(request.getCourseName().trim());
        course.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        if (request.getSection() != null && !request.getSection().trim().isEmpty()) {
            course.setSection(request.getSection().trim());
        }

        Course updated = courseRepository.save(course);
        long count = enrollmentRepository.countByCourseCourseId(courseId);
        return toCourseResponse(updated, count);
    }

    public CourseDto.CourseResponse joinCourse(Long studentUserId, CourseDto.JoinCourseRequest request) {
        String code = request.getCourseCode() != null ? request.getCourseCode().trim().toUpperCase(Locale.ROOT) : "";
        Course course = courseRepository.findByCourseCodeIgnoreCase(code)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid class code"));

        if (enrollmentRepository.existsByCourseCourseIdAndStudentUserId(course.getCourseId(), studentUserId)) {
            throw new ConflictException("Already enrolled");
        }

        User student = userRepository.findById(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Enrollment enrollment = new Enrollment(course, student);
        enrollmentRepository.save(enrollment);

        long count = enrollmentRepository.countByCourseCourseId(course.getCourseId());
        return toCourseResponse(course, count);
    }

    @Transactional(readOnly = true)
    public List<CourseDto.StudentItem> listCourseStudents(Long courseId, Long professorUserId) {
        courseAccessService.requireOwner(courseId, professorUserId);
        List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(courseId);
        return enrollments.stream()
                .map(Enrollment::getStudent)
                .filter(Objects::nonNull)
                .map(s -> new CourseDto.StudentItem(s.getUserId(), s.getName(), s.getEmail()))
                .sorted(Comparator.comparing(CourseDto.StudentItem::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public void removeStudent(Long courseId, Long studentId, Long professorUserId) {
        courseAccessService.requireOwner(courseId, professorUserId);
        Enrollment enrollment = enrollmentRepository.findByCourseCourseIdAndStudentUserId(courseId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not enrolled in course"));
        enrollmentRepository.delete(enrollment);
    }

    public void leaveCourse(Long courseId, Long studentUserId) {
        Enrollment enrollment = enrollmentRepository.findByCourseCourseIdAndStudentUserId(courseId, studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Not enrolled in course"));
        enrollmentRepository.delete(enrollment);
    }

    private String generateUniqueCourseCode() {
        for (int i = 0; i < 10; i++) {
            StringBuilder sb = new StringBuilder(6);
            for (int j = 0; j < 6; j++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (!courseRepository.existsByCourseCode(code)) {
                return code;
            }
        }
        throw new RuntimeException("Unable to generate unique course code");
    }

    private CourseDto.CourseResponse toCourseResponse(Course course, long enrollmentCount) {
        User prof = course.getProfessor();
        return new CourseDto.CourseResponse(
                course.getCourseId(),
                course.getCourseName(),
                course.getCourseCode(),
                course.getDescription(),
                course.getSection(),
                prof != null ? prof.getUserId() : null,
                prof != null ? prof.getName() : null,
                enrollmentCount
        );
    }
}
