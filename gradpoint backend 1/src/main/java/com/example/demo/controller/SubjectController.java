package com.example.demo.controller;

import com.example.demo.model.Subject;
import com.example.demo.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    public SubjectController() {
    }

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectService.getAllSubjects();
    }

    /** GET /api/subjects?filter=text narrows the list by name ("all" or blank = no filter). */
    @GetMapping(params = "filter")
    public List<Subject> filterSubjects(@RequestParam("filter") String filter) {
        if (filter == null || filter.isBlank() || "all".equalsIgnoreCase(filter.trim())) {
            return subjectService.getAllSubjects();
        }
        return subjectService.searchSubjects(filter.trim());
    }

    @GetMapping("/{id}")
    public Subject getSubjectById(@PathVariable Long id) {
        return subjectService.getSubjectById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createSubject(@Valid @RequestBody Subject subject) {
        subjectService.createSubject(subject);
        return ResponseEntity.status(HttpStatus.CREATED).body("Subject created successfully.");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateSubject(@PathVariable Long id, @Valid @RequestBody Subject subjectDetails) {
        subjectService.updateSubject(id, subjectDetails);
        return ResponseEntity.ok("Subject updated successfully.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok("Subject deleted successfully.");
    }
}
