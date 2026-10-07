package com.example.demo.controller;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Subject;
import com.example.demo.model.User;
import com.example.demo.repository.SubjectRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Turns the {"id": n} stubs sent by the client for "student" / "subject"
 * into fully loaded entities (and rejects missing or unknown references).
 */
@Component
public class ReferenceResolver {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    public User student(User ref) {
        if (ref == null || ref.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error: student with an id is required");
        }
        return userRepository.findById(ref.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + ref.getId()));
    }

    public Subject subject(Subject ref) {
        if (ref == null || ref.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error: subject with an id is required");
        }
        return subjectRepository.findById(ref.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + ref.getId()));
    }
}
