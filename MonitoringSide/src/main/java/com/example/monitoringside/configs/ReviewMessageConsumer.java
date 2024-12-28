package com.example.monitoringside.configs;

import com.example.monitoringside.dtos.ConnectionDTO;
import com.example.monitoringside.dtos.ConnectionMessageDTO;
import com.example.monitoringside.services.ConnectionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@AllArgsConstructor
@Component
public class ReviewMessageConsumer {
    private static final Logger log = LoggerFactory.getLogger(ReviewMessageConsumer.class);
    private final ConnectionService connectionService;

    @RabbitListener(queues = "monitoring-queue")
    public void consumeMessage(ConnectionMessageDTO connectionMessage) {
        String actionMessage = connectionMessage.getActionMessage();
        ConnectionDTO connectionDTO = connectionMessage.getConnectionDTO();

        try {
            switch (actionMessage) {
                case "insert":
                    connectionService.insertConnection(connectionDTO);
                    break;
                case "update":
                    connectionService.updateConnection(connectionDTO);
                    break;
                case "delete":
                    connectionService.deleteConnection(connectionDTO);
                    break;
                default:
                    log.warn("Unknown action message: {}", actionMessage);
            }
        } catch (EntityNotFoundException e) {
            // Log the missing entity and prevent the listener from retrying
            log.error("Connection not found with id: {} during {} action", connectionDTO.getId(), actionMessage, e);
        } catch (Exception e) {
            // Log other exceptions to understand any unexpected issues
            log.error("An error occurred while processing message with action {} for Connection ID {}: {}",
                    actionMessage, connectionDTO.getId(), e.getMessage());
            // Optionally rethrow or handle differently if needed
        }
    }
}
