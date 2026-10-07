package com.example.demo.controller;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Attendance;
import com.example.demo.model.Subject;
import com.example.demo.model.User;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private ReferenceResolver referenceResolver;

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Attendance> addAttendance(@RequestBody Attendance attendance) {
        Integer total = attendance.getTotalClasses();
        Integer attended = attendance.getAttendedClasses();
        if (total == null || attended == null || total < 0 || attended < 0 || attended > total) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Error: attendedClasses must be between 0 and totalClasses");
        }
        User student = referenceResolver.student(attendance.getStudent());
        Subject subject = referenceResolver.subject(attendance.getSubject());

        attendance.setStudent(student);
        attendance.setSubject(subject);
        // One attendance row per student+subject: update it if it already exists.
        attendanceRepository.findByStudentAndSubject(student, subject)
                .ifPresent(existing -> attendance.setId(existing.getId()));

        Attendance saved = attendanceRepository.save(attendance);
        predictionService.generatePrediction(student, subject);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteAttendance(@PathVariable Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
        return ResponseEntity.ok("Attendance deleted successfully.");
    }
}
