package com.example.deviceside.dtos.builders;

import com.example.deviceside.dtos.DeviceDTO;
import com.example.deviceside.entities.Device;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

@Builder
@NoArgsConstructor
public class DeviceBuilder {

    private static final ModelMapper modelMapper = new ModelMapper();

    public static DeviceDTO toDeviceDTO(Device device)
    {
        return modelMapper.map(device, DeviceDTO.class);
    }

    public static Device toEntity(DeviceDTO deviceDTO) {
        return modelMapper.map(deviceDTO, Device.class);
    }
}
