package com.example.clientside.services;

import com.example.clientside.dtos.ClientDTO;
import com.example.clientside.dtos.builders.ClientBuilder;
import com.example.clientside.entities.Client;
import com.example.clientside.repositories.ClientRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.modelmapper.ModelMapper;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@Builder
@AllArgsConstructor
public class ClientService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClientService.class);

    public final ClientRepository clientRepository;

    private final AuthenticationManager authenticationManager;

    private final PasswordEncoder passwordEncoder;

    private ModelMapper modelMapper;

    public List<ClientDTO> getAllClients() {
        List<Client> clientList = clientRepository.findAll();
        return clientList.stream()
                .map(ClientBuilder::toClientDTO).collect(Collectors.toList());
    }

    public ClientDTO findUserById(UUID id){
        Optional<Client> client = clientRepository.findById(id);
        if (!client.isPresent()) {
            LOGGER.error("Client with id {} was not found in db", id);
        }
        return ClientBuilder.toClientDTO(client.get());
        //return userDTO;
    }

    public Client insertClient(ClientDTO clientDTO){
        Client newClient = ClientBuilder.toEntity(clientDTO);
        newClient.setPassword(passwordEncoder.encode(newClient.getPassword()));
        newClient = clientRepository.save(newClient);
        LOGGER.info("Client with id {} was inserted in db", newClient.getId());
        return newClient;
    }

    public void deleteClient(UUID id){
        Optional<Client> client = clientRepository.findById(id);
        if (!client.isPresent()) {
            LOGGER.error("Client with id {} was not found in db", id);
        }
        clientRepository.deleteById(id);
        LOGGER.info("Client with id {} was deleted from db", id);
    }

    public ClientDTO updateClient(UUID id, ClientDTO clientDTO)
    {
        Optional<Client> client = clientRepository.findById(id);
        if (!client.isPresent()) {
            LOGGER.error("Client with id {} was not found in db", id);
        }

        Client existingClient = client.get();
        existingClient.setRole(clientDTO.getRole());
        existingClient.setEmail(clientDTO.getEmail());
        //existingClient.setPassword(clientDTO.getPassword());
        existingClient.setFirstName(clientDTO.getFirstName());
        existingClient.setLastName(clientDTO.getLastName());
        existingClient.setPhoneNumber(clientDTO.getPhoneNumber());
        existingClient.setDateOfBirth(clientDTO.getDateOfBirth());
        Client updatedClient = clientRepository.save(existingClient);
        LOGGER.info("Client with id {} was updated in db", updatedClient.getId());
        return ClientBuilder.toClientDTO(updatedClient);
    }

    public Client loginClient(String email, String password) {
        Optional<Client> client = clientRepository.findByEmail(email);
        if (!client.isPresent()) {
            LOGGER.error("Client with email {} was not found in db", email);
            return null;
        }

        // Authenticate using AuthenticationManager
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        return client.get();
    }


    public boolean checkEmailExists(String email) {
        return clientRepository.existsByEmail(email);
    }

    public boolean isEmailBelongingToUserId(String email, UUID id) {
        return clientRepository.findById(id).map(client -> client.getEmail().equals(email)).orElse(false);
    }
}
