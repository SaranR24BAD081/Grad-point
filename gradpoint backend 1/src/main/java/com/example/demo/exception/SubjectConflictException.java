package com.example.demo.exception;

public class SubjectConflictException extends RuntimeException {
    public SubjectConflictException(String message) {
        super(message);
    }
}
