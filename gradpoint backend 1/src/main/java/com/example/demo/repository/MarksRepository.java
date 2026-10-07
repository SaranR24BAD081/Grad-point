package com.example.demo.repository;

import com.example.demo.model.Marks;
import com.example.demo.model.Subject;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudent(User student);

    List<Marks> findByStudentAndSubject(User student, Subject subject);
}
