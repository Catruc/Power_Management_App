package com.example.deviceside.config;

import com.example.deviceside.dtos.ConnectionDTO;
import com.example.deviceside.dtos.ConnectionMessageDTO;
import com.example.deviceside.entities.Connection;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class ReviewMessageProducer {

    private final RabbitTemplate rabbitTemplate;

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitTemplate.class);

    public void sendConnectionDeviceMessage(Connection connection, String actionMessage) {
        ConnectionDTO connectionDTO = ConnectionDTO.builder()
                .id(connection.getId())
                .description(connection.getDescription())
                .address(connection.getAddress())
                .consumption(connection.getConsumption())
                .copyUserId(connection.getCopyUser().getId())
                .deviceId(connection.getDevice().getId())
                .build();

        ConnectionMessageDTO connectionMessage = ConnectionMessageDTO.builder()
                .connectionDTO(connectionDTO)
                .actionMessage(actionMessage)
                .build();

        LOGGER.info("Sending connection message to RabbitMQ: {}", connectionMessage);
        rabbitTemplate.convertAndSend("monitoring-queue", connectionMessage);
    }


}
