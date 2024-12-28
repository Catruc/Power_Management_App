package com.example.monitoringside.dtos.builders;

import com.example.monitoringside.dtos.HourlyMonitoringDTO;
import com.example.monitoringside.entities.HourlyMonitoring;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

@Builder
@NoArgsConstructor
public class HourlyMonitoringBuilder {

    private static final ModelMapper modelMapper = new ModelMapper();

    public static HourlyMonitoringDTO toHourlyMonitoringDTO(HourlyMonitoring hourlyMonitoring)
    {
        return modelMapper.map(hourlyMonitoring, HourlyMonitoringDTO.class);
    }

    public static HourlyMonitoring toEntity(HourlyMonitoringDTO hourlyMonitoringDTO) {
        return modelMapper.map(hourlyMonitoringDTO, HourlyMonitoring.class);
    }
}
