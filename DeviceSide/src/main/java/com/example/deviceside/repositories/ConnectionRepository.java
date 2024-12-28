package com.example.deviceside.repositories;

import com.example.deviceside.entities.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.UUID;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, UUID> {
    List<Connection> findByCopyUserId(UUID copyUserId);
    List<Connection> findByDeviceId(UUID deviceId);
}
