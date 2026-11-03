package com.lms.openlms.dto;

import java.util.List;
import java.util.Map;

public class GradebookDto {

    public record GradebookAssignmentItem(
            Long assignmentId,
            String title,
            Integer maxMarks
    ) {}

    public record GradebookQuizItem(
            Long quizId,
            String title,
            Integer totalMarks
    ) {}

    public record GradebookRow(
            Long studentId,
            String studentName,
            String studentEmail,
            Map<String, Integer> assignmentMarks,
            Map<String, Integer> quizScores,
            Integer totalObtained,
            Integer totalMax,
            Double percentage
    ) {}

    public record GradebookResponse(
            Long courseId,
            List<GradebookAssignmentItem> assignments,
            List<GradebookQuizItem> quizzes,
            List<GradebookRow> rows
    ) {}

    public record StudentGradeAssignmentItem(
            Long assignmentId,
            String title,
            Integer maxMarks,
            String status,
            Integer marksObtained,
            String feedback
    ) {}

    public record StudentGradeQuizItem(
            Long quizId,
            String title,
            Integer totalMarks,
            Integer score,
            String status,
            java.time.LocalDateTime submittedAt
    ) {}

    public record StudentGradesResponse(
            Long courseId,
            List<StudentGradeAssignmentItem> assignments,
            List<StudentGradeQuizItem> quizzes,
            Integer totalObtained,
            Integer totalMax,
            Double percentage
    ) {}
}
