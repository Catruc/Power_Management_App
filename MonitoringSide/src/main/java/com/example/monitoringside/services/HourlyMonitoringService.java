package com.example.monitoringside.services;

import com.example.monitoringside.dtos.HourlyMonitoringDTO;
import com.example.monitoringside.dtos.builders.HourlyMonitoringBuilder;
import com.example.monitoringside.entities.Connection;
import com.example.monitoringside.entities.HourlyMonitoring;
import com.example.monitoringside.repositories.ConnectionRepository;
import com.example.monitoringside.repositories.HourlyMonitoringRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Builder
@AllArgsConstructor
public class HourlyMonitoringService {

    private static final Logger LOGGER = LoggerFactory.getLogger(HourlyMonitoringService.class);

    public final HourlyMonitoringRepository hourlyMonitoringRepository;
    public final ConnectionRepository connectionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private ModelMapper modelMapper;

    public void insertHourlyMonitoring(HourlyMonitoringDTO hourlyMonitoringDTO)
    {
        Connection connection = connectionRepository.findById(hourlyMonitoringDTO.getConnectionId()).orElseThrow(() -> new EntityNotFoundException("Connection not found with id: " + hourlyMonitoringDTO.getConnectionId()));
        HourlyMonitoring newHourlyMonitoring = HourlyMonitoringBuilder.toEntity(hourlyMonitoringDTO);
        newHourlyMonitoring.setConnection(connection);
        newHourlyMonitoring.setDate(hourlyMonitoringDTO.getDate());
        newHourlyMonitoring.setTime(hourlyMonitoringDTO.getTime());
        newHourlyMonitoring.setHourlyConsumption(hourlyMonitoringDTO.getHourlyConsumption());
        newHourlyMonitoring = hourlyMonitoringRepository.save(newHourlyMonitoring);
        LOGGER.info("HourlyMonitoring with id {} was inserted in db", newHourlyMonitoring.getId());

        if (hourlyMonitoringDTO.getHourlyConsumption() > connection.getConsumption()) {
            String message = String.format("Consumption exceeded! Connection ID: %s, Hourly Consumption: %.2f",
                    connection.getId(), hourlyMonitoringDTO.getHourlyConsumption());

            String topic = String.format("/topic/alerts/%s", connection.getId());
            messagingTemplate.convertAndSend(topic, message);
            LOGGER.info("Alert sent for Connection ID: {}", connection.getId());
        }

    }

    public List<HourlyMonitoringDTO> getHourlyDataByConnectionAndDate(UUID connectionId, LocalDate date) {
        List<HourlyMonitoring> hourlyMonitoringList = hourlyMonitoringRepository.findByConnectionIdAndDate(connectionId, date);
        List<HourlyMonitoringDTO> hourlyMonitoringDTOList = hourlyMonitoringList.stream()
                .map(hourlyMonitoring -> modelMapper.map(hourlyMonitoring, HourlyMonitoringDTO.class))
                .collect(Collectors.toList());
        System.out.println("Fetched hourly data for connectionId " + connectionId + " and date " + date + ": " + hourlyMonitoringList);
        return hourlyMonitoringDTOList;
    }

}
