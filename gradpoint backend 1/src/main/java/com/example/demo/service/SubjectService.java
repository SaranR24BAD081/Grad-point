package com.example.demo.service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.SubjectConflictException;
import com.example.demo.model.Subject;
import com.example.demo.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public List<Subject> searchSubjects(String name) {
        return subjectRepository.findByNameContaining(name);
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
    }

    public Subject createSubject(Subject subject) {
        List<Subject> similar = subjectRepository.findByNameContaining(subject.getName());
        boolean duplicate = similar != null && similar.stream()
                .anyMatch(s -> s.getName() != null && s.getName().equalsIgnoreCase(subject.getName().trim()));
        if (duplicate) {
            throw new SubjectConflictException("A subject with this title already exists");
        }
        subject.setId(null);
        return subjectRepository.save(subject);
    }

    public Subject updateSubject(Long id, Subject subjectDetails) {
        Subject subject = getSubjectById(id);
        subject.setName(subjectDetails.getName());
        subject.setCredits(subjectDetails.getCredits());
        subject.setDescription(subjectDetails.getDescription());
        return subjectRepository.save(subject);
    }

    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }
}
