package com.example.deviceside.services;

import com.example.deviceside.config.ReviewMessageProducer;
import com.example.deviceside.entities.Connection;
import com.example.deviceside.entities.CopyUser;
import com.example.deviceside.repositories.ConnectionRepository;
import com.example.deviceside.repositories.CopyUserRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
@Builder
@AllArgsConstructor
public class CopyUserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CopyUserService.class);

    public final CopyUserRepository copyUserRepository;

    public final ConnectionRepository connectionRepository;

    public final ReviewMessageProducer reviewMessageProducer;

    public void addCopyUser(UUID id)
    {
        CopyUser copyUser = new CopyUser();
        copyUser.setId(id);
        copyUserRepository.save(copyUser);
        LOGGER.info("CopyUser with id {} was inserted in db", id);
    }

    public void deleteCopyUser(UUID id)
    {
        Optional<CopyUser> copyUser = copyUserRepository.findById(id);
        if (!copyUser.isPresent()) {
            LOGGER.error("CopyUser with id {} was not found in db", id);
        }
        List<Connection> connections = connectionRepository.findByCopyUserId(id);
        if (!connections.isEmpty()) {
            LOGGER.error("CopyUser with id {} has connections in db", id);
        }
        for(Connection connection : connections) {
            reviewMessageProducer.sendConnectionDeviceMessage(connection, "delete");
            LOGGER.info("Connection message sent to RabbitMQ");
            LOGGER.info("Connection with id {} deleted", connection.getId());
        }
        copyUserRepository.deleteById(id);
        LOGGER.info("CopyUser with id {} was deleted from db", id);
    }

    public boolean checkCopyUserExists(UUID id)
    {
        return copyUserRepository.existsById(id);
    }


}
