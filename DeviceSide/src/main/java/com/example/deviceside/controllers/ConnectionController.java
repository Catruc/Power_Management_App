package com.example.deviceside.controllers;

import com.example.deviceside.dtos.ConnectionDTO;
import com.example.deviceside.entities.Connection;
import com.example.deviceside.services.ConnectionService;
import lombok.AllArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.util.List;
import java.util.UUID;


@Controller
@AllArgsConstructor
@RequestMapping("/connections")
public class ConnectionController {

    private static final Logger LOGGER= LoggerFactory.getLogger(ConnectionController.class);

    public final ConnectionService connectionService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllConnections(){
        LOGGER.info("Getting all connections");
        return ResponseEntity.ok(connectionService.getAllConnections());
    }

    @PostMapping("/insert")
    public ResponseEntity<?> insertConnection(@RequestBody ConnectionDTO connectionDTO) {
        Connection connection = connectionService.insertConnection(connectionDTO,connectionDTO.getCopyUserId(),connectionDTO.getDeviceId());
        LOGGER.info("Connection with id {} was inserted in the database", connection.getId());
        return new ResponseEntity<>("Connection with id" + connection.getId() + " was inserted in the database", HttpStatus.CREATED);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteConnection(@PathVariable("id") UUID id) {
        connectionService.deleteConnection(id);
        LOGGER.info("Connection with id {} was deleted", id);
        return new ResponseEntity<>("Connection with id " + id + " was deleted", HttpStatus.OK);
    }


    @GetMapping("/{userId}")
    public ResponseEntity<List<ConnectionDTO>> getDevicesByUserId(@PathVariable String userId) {
        LOGGER.info("Getting devices for user with id {}", userId);
        UUID userID = UUID.fromString(userId);
        List<ConnectionDTO> connections = connectionService.getConnectionsByUserId(userID);
        if (connections.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.ok(connections);
    }

}
