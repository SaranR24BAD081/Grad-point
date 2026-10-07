package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "attendance",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id"}))
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer totalClasses;

    private Integer attendedClasses;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    public Attendance() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getTotalClasses() { return totalClasses; }
    public void setTotalClasses(Integer totalClasses) { this.totalClasses = totalClasses; }
    public Integer getAttendedClasses() { return attendedClasses; }
    public void setAttendedClasses(Integer attendedClasses) { this.attendedClasses = attendedClasses; }
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
}
