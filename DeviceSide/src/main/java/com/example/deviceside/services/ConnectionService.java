package com.example.deviceside.services;

import com.example.deviceside.config.ReviewMessageProducer;
import com.example.deviceside.dtos.ConnectionDTO;
import com.example.deviceside.dtos.builders.ConnectionBuilder;
import com.example.deviceside.entities.Connection;
import com.example.deviceside.entities.CopyUser;
import com.example.deviceside.entities.Device;
import com.example.deviceside.repositories.ConnectionRepository;
import com.example.deviceside.repositories.CopyUserRepository;
import com.example.deviceside.repositories.DeviceRepository;
import jakarta.persistence.EntityNotFoundException;
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
public class ConnectionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);

    public final ConnectionRepository connectionRepository;
    public final CopyUserRepository copyUserRepository;
    public final DeviceRepository deviceRepository;
    public final ReviewMessageProducer reviewMessageProducer;

    private ModelMapper modelMapper;

    public List<ConnectionDTO> getAllConnections() {
        List<Connection> connectionList = connectionRepository.findAll();
        return connectionList.stream()
                .map(ConnectionBuilder::toConnectionDTO).collect(Collectors.toList());
    }

    public Connection insertConnection(ConnectionDTO connectionDTO, UUID userId, UUID deviceId)
    {
        CopyUser copyUser = copyUserRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("CopyUser not found with id: " + userId));
        Device device = deviceRepository.findById(deviceId).orElseThrow(() -> new EntityNotFoundException("Device not found with id: " + deviceId));
        Connection newConnection = ConnectionBuilder.toEntity(connectionDTO);
        newConnection.setCopyUser(copyUser);
        newConnection.setDevice(device);
        newConnection.setDescription(device.getDescription());
        newConnection.setAddress(device.getAddress());
        newConnection.setConsumption(device.getConsumption());
        newConnection = connectionRepository.save(newConnection);
        LOGGER.info("Connection with id {} was inserted in db", newConnection.getId());
        reviewMessageProducer.sendConnectionDeviceMessage(newConnection, "insert");
        LOGGER.info("Connection message sent to RabbitMQ");
        return newConnection;
    }

    public void deleteConnection(UUID id){
        Optional<Connection> connection = connectionRepository.findById(id);
        if (!connection.isPresent()) {
            LOGGER.error("Connection with id {} was not found in db", id);
        }
        connectionRepository.deleteById(id);
        reviewMessageProducer.sendConnectionDeviceMessage(connection.get(), "delete");
        LOGGER.info("Connection with id {} was deleted from db", id);
    }

    public List<ConnectionDTO> getConnectionsByUserId(UUID userId) {
        LOGGER.info("Fetching connections for user ID: {}", userId);
        List<Connection> connections = connectionRepository.findByCopyUserId(userId);

        if (connections.isEmpty()) {
            LOGGER.warn("No connections found for user ID: {}", userId);
        }

        return connections.stream()
                .map(ConnectionBuilder::toConnectionDTO)
                .collect(Collectors.toList());
    }



}
