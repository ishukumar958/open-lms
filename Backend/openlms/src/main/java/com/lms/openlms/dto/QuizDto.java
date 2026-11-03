package com.lms.openlms.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class QuizDto {

    public static class CreateOptionRequest {
        private String optionText;
        private Boolean isCorrect;

        public CreateOptionRequest() {}

        public CreateOptionRequest(String optionText, Boolean isCorrect) {
            this.optionText = optionText;
            this.isCorrect = isCorrect;
        }

        public String getOptionText() {
            return optionText;
        }

        public void setOptionText(String optionText) {
            this.optionText = optionText;
        }

        public Boolean getIsCorrect() {
            return isCorrect;
        }

        public void setIsCorrect(Boolean isCorrect) {
            this.isCorrect = isCorrect;
        }
    }

    public static class CreateQuestionRequest {
        private String questionText;
        private Integer marks;
        private List<CreateOptionRequest> options;

        public CreateQuestionRequest() {}

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public Integer getMarks() {
            return marks;
        }

        public void setMarks(Integer marks) {
            this.marks = marks;
        }

        public List<CreateOptionRequest> getOptions() {
            return options;
        }

        public void setOptions(List<CreateOptionRequest> options) {
            this.options = options;
        }
    }

    public static class CreateQuizRequest {
        private Long courseId;
        private String title;
        private Integer durationMinutes;
        private Integer totalMarks;
        private Long createdById;
        private List<CreateQuestionRequest> questions;

        public CreateQuizRequest() {}

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Integer getDurationMinutes() {
            return durationMinutes;
        }

        public void setDurationMinutes(Integer durationMinutes) {
            this.durationMinutes = durationMinutes;
        }

        public Integer getTotalMarks() {
            return totalMarks;
        }

        public void setTotalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
        }

        public Long getCreatedById() {
            return createdById;
        }

        public void setCreatedById(Long createdById) {
            this.createdById = createdById;
        }

        public List<CreateQuestionRequest> getQuestions() {
            return questions;
        }

        public void setQuestions(List<CreateQuestionRequest> questions) {
            this.questions = questions;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class QuizOptionResponse {
        private Long optionId;
        private String optionText;
        private Boolean isCorrect;

        public QuizOptionResponse() {}

        public QuizOptionResponse(Long optionId, String optionText, Boolean isCorrect) {
            this.optionId = optionId;
            this.optionText = optionText;
            this.isCorrect = isCorrect;
        }

        public Long getOptionId() {
            return optionId;
        }

        public void setOptionId(Long optionId) {
            this.optionId = optionId;
        }

        public Long getId() {
            return optionId;
        }

        public void setId(Long id) {
            this.optionId = id;
        }

        public String getOptionText() {
            return optionText;
        }

        public void setOptionText(String optionText) {
            this.optionText = optionText;
        }

        public Boolean getIsCorrect() {
            return isCorrect;
        }

        public void setIsCorrect(Boolean isCorrect) {
            this.isCorrect = isCorrect;
        }
    }

    public static class QuizQuestionResponse {
        private Long questionId;
        private String questionText;
        private Integer marks;
        private List<QuizOptionResponse> options;

        public QuizQuestionResponse() {}

        public QuizQuestionResponse(Long questionId, String questionText, Integer marks, List<QuizOptionResponse> options) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.marks = marks;
            this.options = options;
        }

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public Long getId() {
            return questionId;
        }

        public void setId(Long id) {
            this.questionId = id;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public Integer getMarks() {
            return marks;
        }

        public void setMarks(Integer marks) {
            this.marks = marks;
        }

        public List<QuizOptionResponse> getOptions() {
            return options;
        }

        public void setOptions(List<QuizOptionResponse> options) {
            this.options = options;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MyAttemptSummary {
        private Long attemptId;
        private String status;
        private Integer score;

        public MyAttemptSummary() {}

        public MyAttemptSummary(Long attemptId, String status, Integer score) {
            this.attemptId = attemptId;
            this.status = status;
            this.score = score;
        }

        public Long getAttemptId() {
            return attemptId;
        }

        public void setAttemptId(Long attemptId) {
            this.attemptId = attemptId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getScore() {
            return score;
        }

        public void setScore(Integer score) {
            this.score = score;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class QuizResponse {
        private Long quizId;
        private Long courseId;
        private String courseName;
        private String courseCode;
        private String title;
        private Integer totalMarks;
        private Integer durationMinutes;
        private Integer questionCount;
        private Long createdById;
        private MyAttemptSummary myAttempt;
        private List<QuizQuestionResponse> questions;

        public QuizResponse() {}

        public Long getQuizId() {
            return quizId;
        }

        public void setQuizId(Long quizId) {
            this.quizId = quizId;
        }

        public Long getId() {
            return quizId;
        }

        public void setId(Long id) {
            this.quizId = id;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public String getCourseName() {
            return courseName;
        }

        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }

        public String getCourseCode() {
            return courseCode;
        }

        public void setCourseCode(String courseCode) {
            this.courseCode = courseCode;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Integer getTotalMarks() {
            return totalMarks;
        }

        public void setTotalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
        }

        public Integer getDurationMinutes() {
            return durationMinutes;
        }

        public void setDurationMinutes(Integer durationMinutes) {
            this.durationMinutes = durationMinutes;
        }

        public Integer getQuestionCount() {
            return questionCount;
        }

        public void setQuestionCount(Integer questionCount) {
            this.questionCount = questionCount;
        }

        public Long getCreatedById() {
            return createdById;
        }

        public void setCreatedById(Long createdById) {
            this.createdById = createdById;
        }

        public MyAttemptSummary getMyAttempt() {
            return myAttempt;
        }

        public void setMyAttempt(MyAttemptSummary myAttempt) {
            this.myAttempt = myAttempt;
        }

        public List<QuizQuestionResponse> getQuestions() {
            return questions;
        }

        public void setQuestions(List<QuizQuestionResponse> questions) {
            this.questions = questions;
        }
    }

    public static class StartAttemptResponse {
        private Long attemptId;
        private Long quizId;
        private String status;
        private LocalDateTime startedAt;
        private Integer durationMinutes;
        private LocalDateTime endsAt;

        public StartAttemptResponse() {}

        public StartAttemptResponse(Long attemptId, Long quizId, String status, LocalDateTime startedAt, Integer durationMinutes, LocalDateTime endsAt) {
            this.attemptId = attemptId;
            this.quizId = quizId;
            this.status = status;
            this.startedAt = startedAt;
            this.durationMinutes = durationMinutes;
            this.endsAt = endsAt;
        }

        public Long getAttemptId() {
            return attemptId;
        }

        public void setAttemptId(Long attemptId) {
            this.attemptId = attemptId;
        }

        public Long getQuizId() {
            return quizId;
        }

        public void setQuizId(Long quizId) {
            this.quizId = quizId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public LocalDateTime getStartedAt() {
            return startedAt;
        }

        public void setStartedAt(LocalDateTime startedAt) {
            this.startedAt = startedAt;
        }

        public Integer getDurationMinutes() {
            return durationMinutes;
        }

        public void setDurationMinutes(Integer durationMinutes) {
            this.durationMinutes = durationMinutes;
        }

        public LocalDateTime getEndsAt() {
            return endsAt;
        }

        public void setEndsAt(LocalDateTime endsAt) {
            this.endsAt = endsAt;
        }
    }

    public static class SubmitAnswerItem {
        private Long questionId;
        private Long selectedOptionId;

        public SubmitAnswerItem() {}

        public SubmitAnswerItem(Long questionId, Long selectedOptionId) {
            this.questionId = questionId;
            this.selectedOptionId = selectedOptionId;
        }

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public Long getSelectedOptionId() {
            return selectedOptionId;
        }

        public void setSelectedOptionId(Long selectedOptionId) {
            this.selectedOptionId = selectedOptionId;
        }
    }

    public static class SubmitAttemptRequest {
        private List<SubmitAnswerItem> answers;

        public SubmitAttemptRequest() {}

        public SubmitAttemptRequest(List<SubmitAnswerItem> answers) {
            this.answers = answers;
        }

        public List<SubmitAnswerItem> getAnswers() {
            return answers;
        }

        public void setAnswers(List<SubmitAnswerItem> answers) {
            this.answers = answers;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AttemptAnswerDetail {
        private Long questionId;
        private String questionText;
        private Integer marks;
        private Long selectedOptionId;
        private Long correctOptionId;
        private Boolean isCorrect;

        public AttemptAnswerDetail() {}

        public AttemptAnswerDetail(Long questionId, String questionText, Integer marks, Long selectedOptionId, Long correctOptionId, Boolean isCorrect) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.marks = marks;
            this.selectedOptionId = selectedOptionId;
            this.correctOptionId = correctOptionId;
            this.isCorrect = isCorrect;
        }

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public Integer getMarks() {
            return marks;
        }

        public void setMarks(Integer marks) {
            this.marks = marks;
        }

        public Long getSelectedOptionId() {
            return selectedOptionId;
        }

        public void setSelectedOptionId(Long selectedOptionId) {
            this.selectedOptionId = selectedOptionId;
        }

        public Long getCorrectOptionId() {
            return correctOptionId;
        }

        public void setCorrectOptionId(Long correctOptionId) {
            this.correctOptionId = correctOptionId;
        }

        public Boolean getIsCorrect() {
            return isCorrect;
        }

        public void setIsCorrect(Boolean isCorrect) {
            this.isCorrect = isCorrect;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AttemptResultResponse {
        private Long attemptId;
        private Long quizId;
        private String status;
        private Integer score;
        private Integer totalMarks;
        private LocalDateTime startedAt;
        private LocalDateTime submittedAt;
        private List<AttemptAnswerDetail> answers;

        public AttemptResultResponse() {}

        public Long getAttemptId() {
            return attemptId;
        }

        public void setAttemptId(Long attemptId) {
            this.attemptId = attemptId;
        }

        public Long getQuizId() {
            return quizId;
        }

        public void setQuizId(Long quizId) {
            this.quizId = quizId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getScore() {
            return score;
        }

        public void setScore(Integer score) {
            this.score = score;
        }

        public Integer getTotalMarks() {
            return totalMarks;
        }

        public void setTotalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
        }

        public LocalDateTime getStartedAt() {
            return startedAt;
        }

        public void setStartedAt(LocalDateTime startedAt) {
            this.startedAt = startedAt;
        }

        public LocalDateTime getSubmittedAt() {
            return submittedAt;
        }

        public void setSubmittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
        }

        public List<AttemptAnswerDetail> getAnswers() {
            return answers;
        }

        public void setAnswers(List<AttemptAnswerDetail> answers) {
            this.answers = answers;
        }
    }

    public static class QuizAttemptListItem {
        private Long attemptId;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private String status;
        private Integer score;
        private Integer totalMarks;
        private LocalDateTime submittedAt;

        public QuizAttemptListItem() {}

        public QuizAttemptListItem(Long attemptId, Long studentId, String studentName, String studentEmail, String status, Integer score, Integer totalMarks, LocalDateTime submittedAt) {
            this.attemptId = attemptId;
            this.studentId = studentId;
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.status = status;
            this.score = score;
            this.totalMarks = totalMarks;
            this.submittedAt = submittedAt;
        }

        public Long getAttemptId() {
            return attemptId;
        }

        public void setAttemptId(Long attemptId) {
            this.attemptId = attemptId;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }

        public String getStudentEmail() {
            return studentEmail;
        }

        public void setStudentEmail(String studentEmail) {
            this.studentEmail = studentEmail;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getScore() {
            return score;
        }

        public void setScore(Integer score) {
            this.score = score;
        }

        public Integer getTotalMarks() {
            return totalMarks;
        }

        public void setTotalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
        }

        public LocalDateTime getSubmittedAt() {
            return submittedAt;
        }

        public void setSubmittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
        }
    }

    // Keep backwards compatibility with existing references
    public static class QuizAttemptRequest {
        private Long studentId;
        private Map<Long, Long> answers;

        public QuizAttemptRequest() {}

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public Map<Long, Long> getAnswers() {
            return answers;
        }

        public void setAnswers(Map<Long, Long> answers) {
            this.answers = answers;
        }
    }

    public static class QuizAttemptResponse {
        private Long attemptId;
        private Long quizId;
        private Long studentId;
        private Integer score;
        private Integer totalMarks;

        public QuizAttemptResponse() {}

        public QuizAttemptResponse(Long attemptId, Long quizId, Long studentId, Integer score, Integer totalMarks) {
            this.attemptId = attemptId;
            this.quizId = quizId;
            this.studentId = studentId;
            this.score = score;
            this.totalMarks = totalMarks;
        }

        public Long getAttemptId() {
            return attemptId;
        }

        public void setAttemptId(Long attemptId) {
            this.attemptId = attemptId;
        }

        public Long getQuizId() {
            return quizId;
        }

        public void setQuizId(Long quizId) {
            this.quizId = quizId;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public Integer getScore() {
            return score;
        }

        public void setScore(Integer score) {
            this.score = score;
        }

        public Integer getTotalMarks() {
            return totalMarks;
        }

        public void setTotalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
        }
    }
}
