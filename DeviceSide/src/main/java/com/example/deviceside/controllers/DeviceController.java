package com.example.deviceside.controllers;

import com.example.deviceside.dtos.DeviceDTO;
import com.example.deviceside.entities.Device;
import com.example.deviceside.services.DeviceService;
import com.example.deviceside.validators.DeviceValidator;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Controller
@AllArgsConstructor
@RequestMapping("/devices")
public class DeviceController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceController.class);
    public final DeviceService deviceService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllDevices(){
        LOGGER.info("Getting all devices");
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @PostMapping("/insert")
    public ResponseEntity<?> addDevice(@RequestBody DeviceDTO deviceDTO) {

        List<String> validationErrors = DeviceValidator.validateWholeDataForDevice(
                deviceDTO.getDescription(),
                deviceDTO.getAddress(),
                deviceDTO.getConsumption()
        );

        if (!validationErrors.isEmpty()) {
            // Return 400 Bad Request with validation errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(validationErrors);
        }

        try {
            Device device = deviceService.insertDevice(deviceDTO);
            LOGGER.info("Device with id {} was inserted in the database", device.getId());

            // Return 201 Created with a success message
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Device created successfully.");
        } catch (Exception e) {
            LOGGER.error("Error occurred during device registration: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating device. Please try again later.");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteDevice(@PathVariable String id){
        LOGGER.info("Deleting device");
        UUID uuid = UUID.fromString(id);
        deviceService.deleteDevice(uuid);
        return ResponseEntity.ok("Device deleted");
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateDevice(@PathVariable("id") UUID id, @RequestBody DeviceDTO deviceDTO) {

        if (id == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ID cannot be null");
        }

        List<String> validationErrors = DeviceValidator.validateWholeDataForDevice(
                deviceDTO.getDescription(),
                deviceDTO.getAddress(),
                deviceDTO.getConsumption()
        );

        // If there are validation errors, return them with 400 Bad Request
        if (!validationErrors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(validationErrors);
        }

        // Perform the update
        try {
            deviceService.updateDevice(id, deviceDTO);
            LOGGER.info("Device with id {} was updated", id);


            return ResponseEntity.ok("Device with id " + id + " has been updated successfully.");
        } catch (Exception e) {
            LOGGER.error("Error occurred during device update: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the device. Please try again later.");
        }
    }
}
