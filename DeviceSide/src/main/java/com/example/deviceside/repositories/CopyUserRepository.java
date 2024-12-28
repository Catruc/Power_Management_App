package com.example.deviceside.repositories;

import com.example.deviceside.entities.CopyUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface CopyUserRepository extends JpaRepository<CopyUser, UUID> {
}
