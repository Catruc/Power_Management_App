package com.example.monitoringside.controllers;

import com.example.monitoringside.dtos.ConnectionDTO;
import com.example.monitoringside.services.ConnectionService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.UUID;

@Controller
@AllArgsConstructor
@CrossOrigin(
        origins = {"http://localhost:3000", "http://react-app.localhost"},
        allowCredentials = "true"
)
@RequestMapping("/connections")
public class ConnectionController {

    private static final Logger LOGGER= LoggerFactory.getLogger(ConnectionController.class);

    public final ConnectionService connectionService;



    @GetMapping("/all")
    public ResponseEntity<?> getAllConnections(){
        LOGGER.info("Getting all connections");
        return ResponseEntity.ok(connectionService.getAllConnections());
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
