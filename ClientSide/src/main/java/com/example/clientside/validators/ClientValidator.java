package com.example.clientside.validators;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ClientValidator {
    public static List<String> validateWholeDataForUser(String email, String password, String firstName, String lastName, String phoneNumber, LocalDate dateOfBirth) {
        List<String> errorMessages = new ArrayList<>();

        validateEmail(email, errorMessages);
        validatePassword(password, errorMessages);
        validateFirstName(firstName, errorMessages);
        validateLastName(lastName, errorMessages);
        validatePhoneNumber(phoneNumber, errorMessages);
        validateDateOfBirth(dateOfBirth, errorMessages);

        return errorMessages;
    }

    public static void validateEmail(String email, List<String> errorMessages) {
        if (email == null || email.isEmpty()) {
            errorMessages.add("Email cannot be empty");
        } else if (!email.matches("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$")) {
            errorMessages.add("Invalid email format");
        }
    }

    public static void validatePassword(String password, List<String> errorMessages) {
        if (password.length() < 7 || password.length() > 12) {
            errorMessages.add("Password must be between 7 and 12 characters");
        }
    }

    public static void validateFirstName(String firstName, List<String> errorMessages) {
        if (!firstName.matches("[A-Z][a-z]*(-[A-Z][a-z]*)*")) {
            errorMessages.add("Invalid first name format");
        }
    }

    public static void validateLastName(String lastName, List<String> errorMessages) {
        if (!lastName.matches("[A-Z][a-z]*(-[A-Z][a-z]*)*")) {
            errorMessages.add("Invalid last name format");
        }
    }

    public static void validatePhoneNumber(String phoneNumber, List<String> errorMessages) {
        if (!phoneNumber.matches("^(\\+\\d{1,3}[- ]?)?\\d{10}$")) {
            errorMessages.add("Invalid phone number format");
        }
    }

    public static void validateDateOfBirth(LocalDate dateOfBirth, List<String> errorMessages) {
        if (dateOfBirth.isAfter(LocalDate.now().minusYears(14))) {
            errorMessages.add("You must be at least 14 years old");
        }
    }
}
