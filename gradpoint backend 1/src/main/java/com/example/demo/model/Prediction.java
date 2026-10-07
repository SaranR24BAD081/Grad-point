package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "predictions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id"}))
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double predictedScore;

    /** "HIGH RISK", "MEDIUM" or "LOW" */
    private String riskLevel;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    public Prediction() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getPredictedScore() { return predictedScore; }
    public void setPredictedScore(Double predictedScore) { this.predictedScore = predictedScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
}
