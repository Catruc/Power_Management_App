package com.example.monitoringside.configs;

import com.example.monitoringside.dtos.HourlyMonitoringDTO;
import com.example.monitoringside.services.ConnectionService;
import com.example.monitoringside.services.HourlyMonitoringService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@AllArgsConstructor
@Component
public class MonitoringMessageConsumer {

    private static final Logger log = LoggerFactory.getLogger(ReviewMessageConsumer.class);
    private final HourlyMonitoringService hourlyMonitoringService;

    @RabbitListener(queues = "energy_data_queue")
    public void consumeMessage(HourlyMonitoringDTO hourlyMonitoringDTO) {
        try {
            hourlyMonitoringService.insertHourlyMonitoring(hourlyMonitoringDTO);
        } catch (Exception e) {
            log.error("An error occurred while processing message with action {} for HourlyMonitoring ID {}: {}",
                    hourlyMonitoringDTO.getId(), e.getMessage());
        }
    }
}

