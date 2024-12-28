package com.example.monitoringside.services;

import com.example.monitoringside.dtos.ConnectionDTO;
import com.example.monitoringside.dtos.builders.ConnectionBuilder;
import com.example.monitoringside.entities.Connection;
import com.example.monitoringside.repositories.ConnectionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Builder
@AllArgsConstructor
public class ConnectionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ConnectionService.class);

    public final ConnectionRepository connectionRepository;

    private ModelMapper modelMapper;


    public List<ConnectionDTO> getAllConnections() {
        List<Connection> connectionList = connectionRepository.findAll();
        return connectionList.stream()
                .map(ConnectionBuilder::toConnectionDTO).collect(Collectors.toList());
    }

    public Connection insertConnection(ConnectionDTO connectionDTO)
    {
        Connection newConnection = ConnectionBuilder.toEntity(connectionDTO);
        newConnection.setId(connectionDTO.getId());
        newConnection.setDescription(connectionDTO.getDescription());
        newConnection.setAddress(connectionDTO.getAddress());
        newConnection.setConsumption(connectionDTO.getConsumption());
        newConnection.setCopyUserId(connectionDTO.getCopyUserId());
        newConnection.setDeviceId(connectionDTO.getDeviceId());
        newConnection = connectionRepository.save(newConnection);
        LOGGER.info("Connection with id {} was inserted in db", newConnection.getId());
        return newConnection;
    }

    public ConnectionDTO updateConnection(ConnectionDTO connectionDTO)
    {
        Connection connection = connectionRepository.findById(connectionDTO.getId()).orElseThrow(() -> new EntityNotFoundException("Connection not found with id: " + connectionDTO.getId()));
        connection.setDescription(connectionDTO.getDescription());
        connection.setAddress(connectionDTO.getAddress());
        connection.setConsumption(connectionDTO.getConsumption());
        connection.setCopyUserId(connectionDTO.getCopyUserId());
        connection.setDeviceId(connectionDTO.getDeviceId());
        connection = connectionRepository.save(connection);
        LOGGER.info("Connection with id {} was updated in db", connection.getId());
        return ConnectionBuilder.toConnectionDTO(connection);
    }

    public void deleteConnection(ConnectionDTO connectionDTO)
    {
        Connection connection = connectionRepository.findById(connectionDTO.getId()).orElseThrow(() -> new EntityNotFoundException("Connection not found with id: " + connectionDTO.getId()));
        connectionRepository.deleteById(connection.getId());
        LOGGER.info("Connection with id {} was deleted from db", connection.getId());
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
