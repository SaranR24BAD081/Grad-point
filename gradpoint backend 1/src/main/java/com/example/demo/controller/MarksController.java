package com.example.demo.controller;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Marks;
import com.example.demo.model.Subject;
import com.example.demo.model.User;
import com.example.demo.repository.MarksRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/marks")
public class MarksController {

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private ReferenceResolver referenceResolver;

    @GetMapping
    public List<Marks> getAllMarks() {
        return marksRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Marks> addMarks(@RequestBody Marks marks) {
        if (marks.getScore() == null || marks.getScore() < 0 || marks.getScore() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error: score must be between 0 and 100");
        }
        User student = referenceResolver.student(marks.getStudent());
        Subject subject = referenceResolver.subject(marks.getSubject());

        marks.setId(null);
        marks.setStudent(student);
        marks.setSubject(subject);
        if (marks.getDate() == null) {
            marks.setDate(LocalDate.now());
        }

        Marks saved = marksRepository.save(marks);
        predictionService.generatePrediction(student, subject);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/student/{studentId}")
    public List<Marks> getMarksByStudent(@PathVariable Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        return marksRepository.findByStudent(student);
    }
}
