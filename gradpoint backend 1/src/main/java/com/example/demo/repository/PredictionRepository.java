package com.example.demo.repository;

import com.example.demo.model.Prediction;
import com.example.demo.model.Subject;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByStudent(User student);

    Optional<Prediction> findByStudentAndSubject(User student, Subject subject);
}
