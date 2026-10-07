package com.example.demo.repository;

import com.example.demo.model.Attendance;
import com.example.demo.model.Subject;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent(User student);

    Optional<Attendance> findByStudentAndSubject(User student, Subject subject);
}
