package com.example.deviceside.controllers;

import com.example.deviceside.services.CopyUserService;
import lombok.AllArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.util.UUID;

@Controller
@AllArgsConstructor
@RequestMapping("/copyuser")
public class CopyUserController {

    private final CopyUserService copyUserService;
    private static final Logger LOGGER = LoggerFactory.getLogger(CopyUserController.class);

    @PostMapping("/{id}")
    public ResponseEntity<?> addCopyUser(@PathVariable("id") UUID id) {
        LOGGER.info("Received request to add CopyUser with ID: {}", id);
        try {
            copyUserService.addCopyUser(id);
            LOGGER.info("CopyUser with id {} was inserted in the database", id);
            return ResponseEntity.status(HttpStatus.CREATED).body("CopyUser created successfully.");
        } catch (Exception e) {
            LOGGER.error("Error occurred during CopyUser registration: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating CopyUser. Please try again later.");
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> checkCopyUserExists(@PathVariable UUID id) {
        if (copyUserService.checkCopyUserExists(id)) {
            return ResponseEntity.ok("CopyUser exists.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("CopyUser not found.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCopyUser(@PathVariable UUID id) {
        try {
            copyUserService.deleteCopyUser(id);
            LOGGER.info("CopyUser with id {} was deleted from the database", id);
            return ResponseEntity.ok("CopyUser deleted successfully.");
        } catch (Exception e) {
            LOGGER.error("Error occurred during CopyUser deletion: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting CopyUser. Please try again later.");
        }
    }

}
