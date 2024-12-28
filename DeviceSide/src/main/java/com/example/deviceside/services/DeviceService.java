package com.example.deviceside.services;

import com.example.deviceside.config.ReviewMessageProducer;
import com.example.deviceside.dtos.DeviceDTO;
import com.example.deviceside.dtos.builders.DeviceBuilder;
import com.example.deviceside.entities.Connection;
import com.example.deviceside.entities.Device;
import com.example.deviceside.repositories.ConnectionRepository;
import com.example.deviceside.repositories.DeviceRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.modelmapper.ModelMapper;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@Builder
@AllArgsConstructor
public class DeviceService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);

    public final DeviceRepository deviceRepository;

    public final ConnectionRepository connectionRepository;

    private ModelMapper modelMapper;

    public final ReviewMessageProducer reviewMessageProducer;

    public List<DeviceDTO> getAllDevices() {
        List<Device> deviceList = deviceRepository.findAll();
        return deviceList.stream()
                .map(DeviceBuilder::toDeviceDTO).collect(Collectors.toList());
    }

    public Device insertDevice(DeviceDTO deviceDTO){
        Device newDevice = DeviceBuilder.toEntity(deviceDTO);
        newDevice = deviceRepository.save(newDevice);
        LOGGER.info("Device with id {} was inserted in db", newDevice.getId());
        return newDevice;
    }

    public void deleteDevice(UUID id){
        Optional<Device> device = deviceRepository.findById(id);
        if (!device.isPresent()) {
            LOGGER.error("Device with id {} was not found in db", id);
        }
        List<Connection> connections = connectionRepository.findByDeviceId(id);
        if (!connections.isEmpty()) {
            LOGGER.error("Device with id {} has connections in db", id);
        }
        for(Connection connection : connections) {
            reviewMessageProducer.sendConnectionDeviceMessage(connection, "delete");
            LOGGER.info("Connection message sent to RabbitMQ");
            LOGGER.info("Connection with id {} deleted", connection.getId());
        }
        deviceRepository.deleteById(id);
        LOGGER.info("Device with id {} was deleted from db", id);
    }

    public DeviceDTO updateDevice(UUID id, DeviceDTO deviceDTO)
    {
        Optional<Device> device = deviceRepository.findById(id);
        if (!device.isPresent()) {
            LOGGER.error("Device with id {} was not found in db", id);
        }

        Device existingDevice = device.get();
        existingDevice.setDescription(deviceDTO.getDescription());
        existingDevice.setAddress(deviceDTO.getAddress());
        existingDevice.setConsumption(deviceDTO.getConsumption());

        Device updatedDevice = deviceRepository.save(existingDevice);
        LOGGER.info("Device with id {} was updated in db", updatedDevice.getId());

        List<Connection> connections = connectionRepository.findByDeviceId(id); // Assuming you have a method like this in `ConnectionRepository`
        for (Connection connection : connections) {
            connection.setDescription(updatedDevice.getDescription());
            connection.setAddress(updatedDevice.getAddress());
            connection.setConsumption(updatedDevice.getConsumption());
            connectionRepository.save(connection);
            reviewMessageProducer.sendConnectionDeviceMessage(connection, "update");
            LOGGER.info("Connection message sent to RabbitMQ");
            LOGGER.info("Connection with id {} updated to match updated Device", connection.getId());
        }

        return DeviceBuilder.toDeviceDTO(updatedDevice);
    }

}
