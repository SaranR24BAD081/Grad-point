package com.example.demo.controller;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Prediction;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/student/{studentId}")
    public List<Prediction> getStudentPredictions(@PathVariable Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        return predictionService.getStudentPredictions(student);
    }

    @GetMapping
    public List<Prediction> getAllPredictions() {
        return predictionService.getAllPredictions();
    }
}
