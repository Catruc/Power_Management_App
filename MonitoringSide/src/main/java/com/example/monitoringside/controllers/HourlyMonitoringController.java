package com.example.monitoringside.controllers;

import com.example.monitoringside.dtos.HourlyMonitoringDTO;
import com.example.monitoringside.dtos.MonitoringRequestDTO;
import com.example.monitoringside.services.ConnectionService;
import com.example.monitoringside.services.HourlyMonitoringService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Controller
@AllArgsConstructor
@CrossOrigin(
        origins = {"http://localhost:3000", "http://react-app.localhost"},
        allowCredentials = "true"
)
@RequestMapping("/monitoring")
public class HourlyMonitoringController {

    private final HourlyMonitoringService hourlyMonitoringService;

    private static final Logger LOGGER = LoggerFactory.getLogger(HourlyMonitoringController.class);

    @PostMapping("/date-monitoring")
    @ResponseBody
    public ResponseEntity<List<HourlyMonitoringDTO>> getHourlyData(
            @RequestBody MonitoringRequestDTO request) {

        UUID connectionId = request.getConnectionId();
        LocalDate date = request.getDate();

        System.out.println("Fetching hourly data for connectionId: " + connectionId + " and date: " + date);
        LOGGER.info("Fetching hourly data for connectionId: {} and date: {}", connectionId, date);

        // Fetch hourly data based on connectionId and date
        List<HourlyMonitoringDTO> hourlyData = hourlyMonitoringService.getHourlyDataByConnectionAndDate(connectionId, date);

        return ResponseEntity.ok(hourlyData);
    }

}
