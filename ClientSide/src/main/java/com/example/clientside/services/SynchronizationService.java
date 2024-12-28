package com.example.clientside.services;

import com.example.clientside.dtos.ClientDTO;
import lombok.AllArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SynchronizationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SynchronizationService.class);

    private final ClientService clientService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void synchronizeClients() {
        LOGGER.info("Starting synchronization of clients with second microservice.");

        List<ClientDTO> clients = clientService.getAllClients();

        for (ClientDTO client : clients) {
            // Check if client's role is "Admin" and skip synchronization if so
            if ("Admin".equalsIgnoreCase(client.getRole())) {
                LOGGER.info("Skipping synchronization for Admin user with id {}", client.getId());
                continue; // Skip to the next client
            }

            UUID clientId = client.getId();
            // In SynchronizationService.java
            String checkUrl = "http://localhost:8081/copyuser/" + clientId;


            try {
                ResponseEntity<String> response = restTemplate.getForEntity(checkUrl, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    LOGGER.info("Client with id {} exists in second microservice.", clientId);
                    // Client exists, no action needed
                } else {
                    // Handle unexpected success status codes if necessary
                    LOGGER.warn("Unexpected response when checking client with id {} in second microservice: {}", clientId, response.getStatusCode());
                }
            } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
                // Client does not exist in second microservice, need to insert
                LOGGER.info("Client with id {} does not exist in second microservice, inserting.", clientId);

                String insertUrl = "http://localhost:8081/copyuser/" + clientId;
                try {
                    ResponseEntity<String> insertResponse = restTemplate.postForEntity(insertUrl, null, String.class);
                    if (insertResponse.getStatusCode().is2xxSuccessful()) {
                        LOGGER.info("Client with id {} successfully inserted into second microservice.", clientId);
                    } else {
                        LOGGER.warn("Failed to insert client with id {} into second microservice. Response status: {}", clientId, insertResponse.getStatusCode());
                    }
                } catch (Exception ex) {
                    LOGGER.error("Error inserting client with id {} into second microservice: ", clientId, ex);
                }

            } catch (Exception e) {
                LOGGER.error("Error checking client with id {} in second microservice: ", clientId, e);
            }
        }

        LOGGER.info("Synchronization task completed.");
    }

}
