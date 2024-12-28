package com.example.deviceside.validators;

import java.util.ArrayList;
import java.util.List;

public class DeviceValidator {

    public static List<String> validateWholeDataForDevice(String address, String description, double consumption) {
        List<String> errors = new ArrayList<>();

        validateAddress(address, errors);
        validateDescription(description, errors);
        validateConsumption(consumption, errors);

        return errors;
    }

    private static void validateAddress(String address, List<String> errors) {
        if (address == null || address.isEmpty()) {
            errors.add("Address cannot be empty");
        }else if (address.length() > 300) {
            errors.add("Address is too long");
        }
    }

    private static void validateDescription(String description, List<String> errors) {
        if (description == null || description.isEmpty()) {
            errors.add("Description cannot be empty");
        }else if (description.length() > 2000) {
            errors.add("Description is too long");
        }
    }

    private static void validateConsumption(double consumption, List<String> errors) {
        if (consumption < 0) {
            errors.add("Consumption cannot be negative");
        }
    }
}
