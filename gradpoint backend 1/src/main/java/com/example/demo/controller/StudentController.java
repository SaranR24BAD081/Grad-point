package com.example.demo.controller;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.StudentProfile;
import com.example.demo.model.User;
import com.example.demo.repository.StudentProfileRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @GetMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public List<User> getAllStudents() {
        return userRepository.findByRole("ROLE_STUDENT");
    }

    @GetMapping("/{id}")
    public Map<String, Object> getStudentById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        StudentProfile profile = studentProfileRepository.findByUser(user).orElse(null);

        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("profile", profile);
        return result;
    }

    @PostMapping("/{id}/profile")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public StudentProfile saveProfile(@PathVariable Long id,
                                      @RequestBody StudentProfile profile,
                                      Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin && !user.getUsername().equals(authentication.getName())) {
            throw new AccessDeniedException("Students can only edit their own profile");
        }

        // Create-or-update: reuse the existing profile row for this user, if any.
        studentProfileRepository.findByUser(user).ifPresent(existing -> profile.setId(existing.getId()));
        profile.setUser(user);
        return studentProfileRepository.save(profile);
    }
}
