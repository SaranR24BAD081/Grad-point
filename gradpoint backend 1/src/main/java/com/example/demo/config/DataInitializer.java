package com.example.demo.config;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates a first ADMIN account when the database has no users, so the system
 * can be logged into (registration is open, but admin tooling needs an admin).
 * Disable with app.seed.enabled=false and change the password on first login.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email:admin@gradpoint.com}")
    private String adminEmail;

    @Value("${app.seed.admin-password:Admin@123}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        userRepository.save(new User(adminEmail, passwordEncoder.encode(adminPassword),
                "ROLE_ADMIN", "System Admin", adminEmail));
        logger.info("Seeded default admin account '{}'. Change its password.", adminEmail);
    }
}
