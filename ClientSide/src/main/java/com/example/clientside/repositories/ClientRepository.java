package com.example.clientside.repositories;

import com.example.clientside.entities.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {
    public Optional<Client> findByEmail(String email);

    boolean existsByEmail(String email);
}
