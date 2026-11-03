package com.lms.openlms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_answers", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"attempt_id", "question_id"})
})
public class QuizAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "selected_option_id", nullable = false)
    private QuizOption selectedOption;

    public QuizAnswer() {}

    public QuizAnswer(QuizAttempt attempt, QuizQuestion question, QuizOption selectedOption) {
        this.attempt = attempt;
        this.question = question;
        this.selectedOption = selectedOption;
    }

    public Long getAnswerId() {
        return answerId;
    }

    public void setAnswerId(Long answerId) {
        this.answerId = answerId;
    }

    public QuizAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(QuizAttempt attempt) {
        this.attempt = attempt;
    }

    public QuizQuestion getQuestion() {
        return question;
    }

    public void setQuestion(QuizQuestion question) {
        this.question = question;
    }

    public QuizOption getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(QuizOption selectedOption) {
        this.selectedOption = selectedOption;
    }
}
