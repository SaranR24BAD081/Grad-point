package com.example.demo.service;

import com.example.demo.model.Attendance;
import com.example.demo.model.Marks;
import com.example.demo.model.Prediction;
import com.example.demo.model.Subject;
import com.example.demo.model.User;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.MarksRepository;
import com.example.demo.repository.PredictionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PredictionService {

    @Autowired
    private PredictionRepository predictionRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    /**
     * predictedScore = (averageMarks * 0.7) + (attendancePercentage * 0.3)
     * < 40 -> HIGH RISK, 40..70 -> MEDIUM, > 70 -> LOW
     */
    public void generatePrediction(User student, Subject subject) {
        List<Marks> marksList = marksRepository.findByStudentAndSubject(student, subject);
        if (marksList == null || marksList.isEmpty()) {
            return;
        }

        double averageMarks = marksList.stream()
                .filter(m -> m.getScore() != null)
                .mapToDouble(Marks::getScore)
                .average()
                .orElse(0.0);

        Optional<Attendance> attendance = attendanceRepository.findByStudentAndSubject(student, subject);
        double attendancePercentage = attendance
                .filter(a -> a.getTotalClasses() != null && a.getTotalClasses() > 0 && a.getAttendedClasses() != null)
                .map(a -> (a.getAttendedClasses() * 100.0) / a.getTotalClasses())
                .orElse(0.0);

        double predictedScore = (averageMarks * 0.7) + (attendancePercentage * 0.3);

        String riskLevel;
        if (predictedScore < 40) {
            riskLevel = "HIGH RISK";
        } else if (predictedScore <= 70) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        Prediction prediction = predictionRepository.findByStudentAndSubject(student, subject)
                .orElseGet(Prediction::new);
        prediction.setStudent(student);
        prediction.setSubject(subject);
        prediction.setPredictedScore(predictedScore);
        prediction.setRiskLevel(riskLevel);
        predictionRepository.save(prediction);
    }

    public List<Prediction> getStudentPredictions(User student) {
        return predictionRepository.findByStudent(student);
    }

    public List<Prediction> getAllPredictions() {
        return predictionRepository.findAll();
    }
}
