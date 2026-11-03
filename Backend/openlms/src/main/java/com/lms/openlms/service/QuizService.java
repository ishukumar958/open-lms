package com.lms.openlms.service;

import com.lms.openlms.dto.QuizDto.*;
import com.lms.openlms.entity.*;
import com.lms.openlms.exception.BadRequestException;
import com.lms.openlms.exception.ConflictException;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.repository.*;
import com.lms.openlms.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final UserRepository userRepository;
    private final CourseAccessService courseAccessService;

    public QuizService(QuizRepository quizRepository,
                       QuizQuestionRepository quizQuestionRepository,
                       QuizOptionRepository quizOptionRepository,
                       QuizAttemptRepository quizAttemptRepository,
                       QuizAnswerRepository quizAnswerRepository,
                       UserRepository userRepository,
                       CourseAccessService courseAccessService) {
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizOptionRepository = quizOptionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.quizAnswerRepository = quizAnswerRepository;
        this.userRepository = userRepository;
        this.courseAccessService = courseAccessService;
    }

    // Q1 — POST /courses/{courseId}/quizzes (owner) -> 201
    public QuizResponse createQuiz(Long courseId, Long facultyUserId, CreateQuizRequest req) {
        Course course = courseAccessService.requireOwner(courseId, facultyUserId);
        User professor = course.getProfessor();

        if (req.getTitle() == null || req.getTitle().trim().length() < 2 || req.getTitle().trim().length() > 150) {
            throw new BadRequestException("Title must be between 2 and 150 characters");
        }

        if (req.getDurationMinutes() != null) {
            if (req.getDurationMinutes() < 1 || req.getDurationMinutes() > 300) {
                throw new BadRequestException("Duration minutes must be between 1 and 300");
            }
        }

        if (req.getQuestions() == null || req.getQuestions().isEmpty()) {
            throw new BadRequestException("At least one question is required");
        }

        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTitle(req.getTitle().trim());
        quiz.setDurationMinutes(req.getDurationMinutes());
        quiz.setCreatedBy(professor);

        int totalMarks = 0;
        List<QuizQuestion> questionEntities = new ArrayList<>();

        for (CreateQuestionRequest qReq : req.getQuestions()) {
            if (qReq.getQuestionText() == null || qReq.getQuestionText().isBlank()) {
                throw new BadRequestException("Question text is required");
            }
            if (qReq.getMarks() == null || qReq.getMarks() < 1) {
                throw new BadRequestException("Question marks must be at least 1");
            }
            if (qReq.getOptions() == null || qReq.getOptions().size() < 2 || qReq.getOptions().size() > 6) {
                throw new BadRequestException("Each question must have between 2 and 6 options");
            }

            int correctCount = 0;
            QuizQuestion question = new QuizQuestion();
            question.setQuiz(quiz);
            question.setQuestionText(qReq.getQuestionText().trim());
            question.setMarks(qReq.getMarks());

            List<QuizOption> optionEntities = new ArrayList<>();
            for (CreateOptionRequest oReq : qReq.getOptions()) {
                if (oReq.getOptionText() == null || oReq.getOptionText().isBlank()) {
                    throw new BadRequestException("Option text is required");
                }
                if (oReq.getIsCorrect() == null) {
                    throw new BadRequestException("isCorrect is required for each option");
                }
                if (Boolean.TRUE.equals(oReq.getIsCorrect())) {
                    correctCount++;
                }
                QuizOption opt = new QuizOption();
                opt.setQuestion(question);
                opt.setOptionText(oReq.getOptionText().trim());
                opt.setIsCorrect(oReq.getIsCorrect());
                optionEntities.add(opt);
            }

            if (correctCount != 1) {
                throw new BadRequestException("Each question must have exactly one correct option");
            }

            question.setOptions(optionEntities);
            questionEntities.add(question);
            totalMarks += qReq.getMarks();
        }

        quiz.setTotalMarks(totalMarks);
        quiz.setQuestions(questionEntities);

        Quiz saved = quizRepository.save(quiz);
        return toQuizResponse(saved, true, null);
    }

    // Q2 — GET /courses/{courseId}/quizzes (member) -> 200 array without questions
    @Transactional(readOnly = true)
    public List<QuizResponse> listCourseQuizzes(Long courseId, AuthUser user) {
        courseAccessService.requireMemberOrOwner(courseId, user);
        List<Quiz> quizzes = quizRepository.findByCourseCourseIdOrderByQuizIdDesc(courseId);

        boolean isFaculty = "FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role());

        Map<Long, QuizAttempt> attemptMap = new HashMap<>();
        if (!isFaculty) {
            List<QuizAttempt> attempts = quizAttemptRepository.findByStudentUserId(user.userId());
            for (QuizAttempt qa : attempts) {
                if (qa.getQuiz() != null) {
                    attemptMap.put(qa.getQuiz().getQuizId(), qa);
                }
            }
        }

        return quizzes.stream().map(q -> {
            MyAttemptSummary attemptSummary = null;
            if (!isFaculty) {
                QuizAttempt qa = attemptMap.get(q.getQuizId());
                if (qa != null) {
                    attemptSummary = new MyAttemptSummary(qa.getAttemptId(), qa.getStatus(), qa.getScore());
                }
            }
            return toQuizResponseSummary(q, attemptSummary);
        }).collect(Collectors.toList());
    }

    // Q3 — GET /quizzes/{quizId} (member) -> 200 QuizResponse with questions
    @Transactional(readOnly = true)
    public QuizResponse getQuiz(Long quizId, AuthUser user) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        courseAccessService.requireMemberOrOwner(quiz.getCourse().getCourseId(), user);

        boolean isFaculty = "FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role());

        MyAttemptSummary attemptSummary = null;
        if (!isFaculty) {
            Optional<QuizAttempt> opt = quizAttemptRepository.findByQuizQuizIdAndStudentUserId(quizId, user.userId());
            if (opt.isPresent()) {
                QuizAttempt qa = opt.get();
                attemptSummary = new MyAttemptSummary(qa.getAttemptId(), qa.getStatus(), qa.getScore());
            }
        }

        return toQuizResponse(quiz, isFaculty, attemptSummary);
    }

    // Q4 — DELETE /quizzes/{quizId} (owner) -> 204
    public void deleteQuiz(Long quizId, Long facultyUserId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        courseAccessService.requireOwner(quiz.getCourse().getCourseId(), facultyUserId);

        if (quizAttemptRepository.existsByQuizQuizId(quizId)) {
            throw new ConflictException("Quiz has attempts");
        }

        quizRepository.delete(quiz);
    }

    // Q5 — POST /quizzes/{quizId}/attempts/start (STUDENT, enrolled) -> 200
    public StartAttemptResponse startAttempt(Long quizId, Long studentId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        courseAccessService.requireStudentEnrolled(quiz.getCourse().getCourseId(), studentId);

        List<QuizAttempt> existingAttempts = quizAttemptRepository.findByQuizQuizIdAndStudentUserIdOrderByAttemptIdDesc(quizId, studentId);
        int maxAttempts = 2;

        // If there is an active IN_PROGRESS attempt, resume it
        for (QuizAttempt qa : existingAttempts) {
            if ("IN_PROGRESS".equalsIgnoreCase(qa.getStatus())) {
                LocalDateTime endsAt = null;
                if (quiz.getDurationMinutes() != null && qa.getStartedAt() != null) {
                    endsAt = qa.getStartedAt().plusMinutes(quiz.getDurationMinutes());
                }
                StartAttemptResponse resp = new StartAttemptResponse(qa.getAttemptId(), quizId, "IN_PROGRESS",
                        qa.getStartedAt(), quiz.getDurationMinutes(), endsAt);
                int submittedCount = (int) existingAttempts.stream().filter(a -> "SUBMITTED".equalsIgnoreCase(a.getStatus())).count();
                resp.setAttemptsUsed(submittedCount);
                resp.setAttemptsLeft(Math.max(0, maxAttempts - submittedCount));
                resp.setMaxAttempts(maxAttempts);
                return resp;
            }
        }

        int submittedCount = (int) existingAttempts.stream().filter(a -> "SUBMITTED".equalsIgnoreCase(a.getStatus())).count();
        if (submittedCount >= maxAttempts) {
            throw new ConflictException("Maximum attempts reached (" + maxAttempts + "/" + maxAttempts + ")");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setStatus("IN_PROGRESS");
        attempt.setStartedAt(LocalDateTime.now());
        QuizAttempt saved = quizAttemptRepository.save(attempt);

        LocalDateTime endsAt = null;
        if (quiz.getDurationMinutes() != null) {
            endsAt = saved.getStartedAt().plusMinutes(quiz.getDurationMinutes());
        }

        StartAttemptResponse resp = new StartAttemptResponse(saved.getAttemptId(), quizId, "IN_PROGRESS",
                saved.getStartedAt(), quiz.getDurationMinutes(), endsAt);
        resp.setAttemptsUsed(submittedCount);
        resp.setAttemptsLeft(Math.max(0, maxAttempts - submittedCount));
        resp.setMaxAttempts(maxAttempts);
        return resp;
    }

    // Q6 — POST /quizzes/{quizId}/attempts/submit (STUDENT) -> 200
    public AttemptResultResponse submitAttempt(Long quizId, Long studentId, SubmitAttemptRequest req) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        courseAccessService.requireStudentEnrolled(quiz.getCourse().getCourseId(), studentId);

        QuizAttempt attempt = quizAttemptRepository.findFirstByQuizQuizIdAndStudentUserIdAndStatusOrderByAttemptIdDesc(quizId, studentId, "IN_PROGRESS")
                .orElseThrow(() -> new ConflictException("No active attempt"));

        if (!"IN_PROGRESS".equalsIgnoreCase(attempt.getStatus())) {
            throw new ConflictException("No active attempt");
        }

        LocalDateTime now = LocalDateTime.now();
        if (quiz.getDurationMinutes() != null && attempt.getStartedAt() != null) {
            LocalDateTime deadlineWithGrace = attempt.getStartedAt()
                    .plusMinutes(quiz.getDurationMinutes())
                    .plusSeconds(60);
            if (now.isAfter(deadlineWithGrace)) {
                throw new ConflictException("Time expired");
            }
        }

        List<QuizQuestion> questions = quiz.getQuestions();
        Map<Long, QuizQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(QuizQuestion::getQuestionId, q -> q));

        Set<Long> seenQuestionIds = new HashSet<>();
        List<QuizAnswer> answersToSave = new ArrayList<>();
        int totalScore = 0;

        if (req != null && req.getAnswers() != null) {
            for (SubmitAnswerItem item : req.getAnswers()) {
                if (item.getQuestionId() == null || item.getSelectedOptionId() == null) {
                    throw new BadRequestException("questionId and selectedOptionId are required");
                }
                if (!seenQuestionIds.add(item.getQuestionId())) {
                    throw new BadRequestException("Duplicate questionId in answers");
                }
                QuizQuestion question = questionMap.get(item.getQuestionId());
                if (question == null) {
                    throw new BadRequestException("Question does not belong to quiz");
                }
                QuizOption selectedOption = question.getOptions().stream()
                        .filter(o -> o.getOptionId().equals(item.getSelectedOptionId()))
                        .findFirst()
                        .orElseThrow(() -> new BadRequestException("Option does not belong to question"));

                if (Boolean.TRUE.equals(selectedOption.getIsCorrect())) {
                    totalScore += question.getMarks();
                }

                QuizAnswer answer = new QuizAnswer(attempt, question, selectedOption);
                answersToSave.add(answer);
            }
        }

        quizAnswerRepository.saveAll(answersToSave);

        attempt.setScore(totalScore);
        attempt.setStatus("SUBMITTED");
        attempt.setSubmittedAt(now);
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        return buildAttemptResultResponse(savedAttempt, quiz, answersToSave);
    }

    // Q7 — GET /quizzes/{quizId}/attempts/me (STUDENT) -> 200
    @Transactional(readOnly = true)
    public AttemptResultResponse getMyAttempt(Long quizId, Long studentId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        courseAccessService.requireStudentEnrolled(quiz.getCourse().getCourseId(), studentId);

        QuizAttempt attempt = quizAttemptRepository.findFirstByQuizQuizIdAndStudentUserIdOrderByAttemptIdDesc(quizId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (!"SUBMITTED".equalsIgnoreCase(attempt.getStatus())) {
            AttemptResultResponse resp = new AttemptResultResponse();
            resp.setAttemptId(attempt.getAttemptId());
            resp.setQuizId(quizId);
            resp.setStatus(attempt.getStatus());
            resp.setScore(attempt.getScore());
            resp.setTotalMarks(quiz.getTotalMarks());
            resp.setStartedAt(attempt.getStartedAt());
            resp.setSubmittedAt(attempt.getSubmittedAt());

        List<QuizAttempt> allAttempts = quizAttemptRepository.findByQuizQuizIdAndStudentUserIdOrderByAttemptIdDesc(quiz.getQuizId(), attempt.getStudent().getUserId());
        int submittedCount = (int) allAttempts.stream().filter(a -> "SUBMITTED".equalsIgnoreCase(a.getStatus())).count();
        int maxAttempts = 2;
        resp.setAttemptsUsed(submittedCount);
        resp.setAttemptsLeft(Math.max(0, maxAttempts - submittedCount));
        resp.setMaxAttempts(maxAttempts);
            resp.setAnswers(null);
            return resp;
        }

        List<QuizAnswer> answers = quizAnswerRepository.findByAttemptAttemptId(attempt.getAttemptId());
        return buildAttemptResultResponse(attempt, quiz, answers);
    }

    // Q8 — GET /quizzes/{quizId}/attempts (owner) -> 200
    @Transactional(readOnly = true)
    public List<QuizAttemptListItem> listQuizAttempts(Long quizId, Long facultyUserId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        courseAccessService.requireOwner(quiz.getCourse().getCourseId(), facultyUserId);

        return quizAttemptRepository.findByQuizQuizIdOrderByAttemptIdDesc(quizId).stream()
                .map(qa -> {
                    User student = qa.getStudent();
                    return new QuizAttemptListItem(
                            qa.getAttemptId(),
                            student != null ? student.getUserId() : null,
                            student != null ? student.getName() : null,
                            student != null ? student.getEmail() : null,
                            qa.getStatus(),
                            qa.getScore(),
                            quiz.getTotalMarks(),
                            qa.getSubmittedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    private QuizResponse toQuizResponseSummary(Quiz q, MyAttemptSummary myAttempt) {
        QuizResponse resp = new QuizResponse();
        resp.setQuizId(q.getQuizId());
        resp.setId(q.getQuizId());
        if (q.getCourse() != null) {
            resp.setCourseId(q.getCourse().getCourseId());
            resp.setCourseName(q.getCourse().getCourseName());
            resp.setCourseCode(q.getCourse().getCourseCode());
        }
        resp.setTitle(q.getTitle());
        resp.setTotalMarks(q.getTotalMarks());
        resp.setDurationMinutes(q.getDurationMinutes());
        resp.setQuestionCount(q.getQuestions() != null ? q.getQuestions().size() : 0);
        if (q.getCreatedBy() != null) {
            resp.setCreatedById(q.getCreatedBy().getUserId());
        }
        resp.setMyAttempt(myAttempt);
        resp.setQuestions(null);
        return resp;
    }

    private QuizResponse toQuizResponse(Quiz q, boolean isFaculty, MyAttemptSummary myAttempt) {
        QuizResponse resp = toQuizResponseSummary(q, myAttempt);

        if (q.getQuestions() != null) {
            List<QuizQuestionResponse> qList = q.getQuestions().stream().map(question -> {
                List<QuizOptionResponse> oList = question.getOptions().stream().map(opt -> {
                    QuizOptionResponse oResp = new QuizOptionResponse();
                    oResp.setOptionId(opt.getOptionId());
                    oResp.setId(opt.getOptionId());
                    oResp.setOptionText(opt.getOptionText());
                    if (isFaculty) {
                        oResp.setIsCorrect(opt.getIsCorrect());
                    } else {
                        oResp.setIsCorrect(null);
                    }
                    return oResp;
                }).collect(Collectors.toList());

                QuizQuestionResponse qqResp = new QuizQuestionResponse();
                qqResp.setQuestionId(question.getQuestionId());
                qqResp.setId(question.getQuestionId());
                qqResp.setQuestionText(question.getQuestionText());
                qqResp.setMarks(question.getMarks());
                qqResp.setOptions(oList);
                return qqResp;
            }).collect(Collectors.toList());

            resp.setQuestions(qList);
        }

        return resp;
    }

    private AttemptResultResponse buildAttemptResultResponse(QuizAttempt attempt, Quiz quiz, List<QuizAnswer> answers) {
        AttemptResultResponse resp = new AttemptResultResponse();
        resp.setAttemptId(attempt.getAttemptId());
        resp.setQuizId(quiz.getQuizId());
        resp.setStatus(attempt.getStatus());
        resp.setScore(attempt.getScore());
        resp.setTotalMarks(quiz.getTotalMarks());
        resp.setStartedAt(attempt.getStartedAt());
        resp.setSubmittedAt(attempt.getSubmittedAt());

        Map<Long, QuizAnswer> answerByQuestionId = answers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getQuestionId(), a -> a, (a1, a2) -> a1));

        List<AttemptAnswerDetail> details = quiz.getQuestions().stream().map(q -> {
            QuizAnswer ans = answerByQuestionId.get(q.getQuestionId());
            Long selectedOptionId = ans != null && ans.getSelectedOption() != null ? ans.getSelectedOption().getOptionId() : null;

            Long correctOptionId = q.getOptions().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .map(QuizOption::getOptionId)
                    .findFirst()
                    .orElse(null);

            boolean isCorrect = selectedOptionId != null && selectedOptionId.equals(correctOptionId);

            AttemptAnswerDetail detail = new AttemptAnswerDetail();
            detail.setQuestionId(q.getQuestionId());
            detail.setQuestionText(q.getQuestionText());
            detail.setMarks(q.getMarks());
            detail.setSelectedOptionId(selectedOptionId);
            detail.setCorrectOptionId(correctOptionId);
            detail.setIsCorrect(isCorrect);
            return detail;
        }).collect(Collectors.toList());

        resp.setAnswers(details);
        return resp;
    }
}
