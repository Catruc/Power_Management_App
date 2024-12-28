package com.example.monitoringside.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourlyMonitoringDTO {

    private UUID id;
    private UUID connectionId;
    private LocalDate date;
    private LocalTime time;
    private double hourlyConsumption;
}
