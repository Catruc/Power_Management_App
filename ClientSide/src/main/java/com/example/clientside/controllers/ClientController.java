package com.example.clientside.controllers;

import com.example.clientside.dtos.ClientDTO;
import com.example.clientside.entities.Client;
import com.example.clientside.security.JwtService;
import com.example.clientside.services.ClientService;
import com.example.clientside.validators.ClientValidator;
import com.example.clientside.validators.ClientValidatorUpdate;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
@AllArgsConstructor
@RequestMapping("/clients")
public class ClientController{



    private static final Logger LOGGER = LoggerFactory.getLogger(ClientController.class);
    public final ClientService clientService;
    public final JwtService jwtService;


    @GetMapping("/all")
    public ResponseEntity<?> getAllClients() {
        LOGGER.info("Getting all clients");

        // Fetch clients from service
        List<ClientDTO> clients = clientService.getAllClients();

        // Log the size of the returned list
        LOGGER.info("Fetched {} clients from service", clients.size());

        // Log each client for inspection
        clients.forEach(client -> {
            LOGGER.info("Client before clearing password: {}", client);
            client.setPassword(""); // Clear passwords
            LOGGER.info("Client after clearing password: {}", client);
        });

        // Return the response
        return ResponseEntity.ok(clients);
    }


    @PostMapping("/insert")
    public ResponseEntity<?> addClient(@RequestBody ClientDTO clientDTO) {
        // Check if the email already exists
        if (clientService.checkEmailExists(clientDTO.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(List.of("Email already exists!"));
        }

        // Validate user data
        List<String> validationErrors = ClientValidator.validateWholeDataForUser(
                clientDTO.getEmail(),
                clientDTO.getPassword(),
                clientDTO.getFirstName(),
                clientDTO.getLastName(),
                clientDTO.getPhoneNumber(),
                clientDTO.getDateOfBirth()
        );

        if (!validationErrors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(validationErrors);
        }

        // If validation passes, insert the user
        try {
            // Insert the user into the main database
            Client client = clientService.insertClient(clientDTO);
            LOGGER.info("Client with id {} was inserted in the database", client.getId());

            // **Role Check**
            if ("User".equalsIgnoreCase(client.getRole())) {
                // Now send the user ID to the second microservice
                RestTemplate restTemplate = new RestTemplate();
                LOGGER.info("Attempting to copy user with ID: {}", client.getId());

                // Ensure UUID does not contain braces
                String userId = client.getId().toString().replaceAll("[{}]", "");
                String copyUserUrl = "http://localhost:8081/copyuser/" + userId;
                LOGGER.info("CopyUser URL: {}", copyUserUrl);

                // Set headers
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<String> entity = new HttpEntity<>(null, headers);

                try {
                    ResponseEntity<String> response = restTemplate.postForEntity(copyUserUrl, entity, String.class);
                    LOGGER.info("CopyUser response status: {}", response.getStatusCode());
                    LOGGER.info("CopyUser response body: {}", response.getBody());

                    if (response.getStatusCode().is2xxSuccessful()) {
                        LOGGER.info("User with id {} successfully copied to the second microservice", client.getId());
                    } else {
                        LOGGER.warn("Failed to copy user with id {} to the second microservice", client.getId());
                        return ResponseEntity.status(HttpStatus.CREATED)
                                .body("Account created successfully. Could not add the user in the other microservice, sync will be done when possible.");
                    }

                } catch (Exception e) {
                    LOGGER.error("Error while sending user with id {} to the second microservice: ", client.getId(), e);
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body("Account created successfully. Could not add the user in the other microservice, sync will be done when possible.");
                }
            } else {
                LOGGER.info("User with id {} is an Admin. Skipping copy to second microservice.", client.getId());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body("Account created successfully.");

        } catch (Exception e) {
            LOGGER.error("Error occurred during user registration: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating account. Please try again later.");
        }
    }




    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable String id) {
        LOGGER.info("Deleting client with id {}", id);
        UUID uuid = UUID.fromString(id);

        // Retrieve the client to get the role
        ClientDTO clientDTO = clientService.findUserById(uuid);
        if (clientDTO == null) {
            LOGGER.warn("Client with id {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Client not found");
        }

        String role = clientDTO.getRole();

        if ("Admin".equalsIgnoreCase(role)) {
            // If role is Admin, proceed to delete in the first microservice only
            try {
                clientService.deleteClient(uuid);
                LOGGER.info("Admin client with id {} deleted from first microservice", uuid);
                return ResponseEntity.ok("Admin client deleted successfully.");
            } catch (Exception e) {
                LOGGER.error("Error deleting admin client with id {}: ", uuid, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to delete admin client. Please try again later.");
            }
        } else if ("User".equalsIgnoreCase(role)) {
            // If role is User, attempt to delete in the second microservice first
            RestTemplate restTemplate = new RestTemplate();
            String deleteCopyUserUrl = "http://localhost:8081/copyuser/" + uuid;

            try {
                // Create an HttpEntity with headers if needed
                HttpEntity<String> requestEntity = new HttpEntity<>(null);

                ResponseEntity<String> response = restTemplate.exchange(
                        deleteCopyUserUrl,
                        HttpMethod.DELETE,
                        requestEntity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful()) {
                    LOGGER.info("CopyUser with id {} successfully deleted from the second microservice", uuid);
                    // Proceed to delete in the first microservice
                    clientService.deleteClient(uuid);
                    return ResponseEntity.ok("Client deleted successfully.");
                } else {
                    LOGGER.warn("Failed to delete CopyUser with id {} from the second microservice", uuid);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to delete client in the second microservice. Deletion aborted.");
                }
            } catch (Exception e) {
                LOGGER.error("Error while deleting CopyUser with id {} from the second microservice: ", uuid, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to delete client in the second microservice. Deletion aborted.");
            }
        } else {
            LOGGER.warn("Client with id {} has unknown role: {}", uuid, role);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Client has an unknown role. Deletion aborted.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginClient(@RequestBody ClientDTO clientDTO, HttpServletRequest request) {
        String email = clientDTO.getEmail();
        String password = clientDTO.getPassword();

        Map<String, Object> response = new HashMap<>();
        Client authenticatedClient = clientService.loginClient(email, password);

        if (authenticatedClient != null) {
            // Generate JWT token
            String jwtToken = jwtService.generateToken(authenticatedClient);

            // Set client details in the session
            authenticatedClient.setPassword(""); // Clear password for security
            request.getSession().setAttribute("client", authenticatedClient);
            request.getSession().setAttribute("role", authenticatedClient.getRole());

            // Prepare the response
            response.put("message", "Login successful");
            response.put("role", authenticatedClient.getRole());
            response.put("name", authenticatedClient.getFirstName());
            response.put("id", authenticatedClient.getId());
            response.put("jwtToken", jwtToken);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("errorMessage", "Invalid email or password");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }




    @GetMapping("/logout")
    public ResponseEntity<String> logoutUser(HttpServletRequest request) {
        HttpSession session = request.getSession();
        session.invalidate(); // Invalidate the session
        LOGGER.info("User logged out");
        return ResponseEntity.ok("Logout successful");
    }


    @PostMapping("/register")
    public ResponseEntity<?> registerClient(@RequestBody ClientDTO clientDTO) {
        // Check if the email already exists
        if (clientService.checkEmailExists(clientDTO.getEmail())) {
            // Return 400 Bad Request with an error message
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(List.of("Email already exists!"));
        }

        // Validate user data
        List<String> validationErrors = ClientValidator.validateWholeDataForUser(
                clientDTO.getEmail(),
                clientDTO.getPassword(),
                clientDTO.getFirstName(),
                clientDTO.getLastName(),
                clientDTO.getPhoneNumber(),
                clientDTO.getDateOfBirth()
        );

        if (!validationErrors.isEmpty()) {
            // Return 400 Bad Request with validation errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(validationErrors);
        }

        // If validation passes, insert the user
        try {
            Client client = clientService.insertClient(clientDTO);
            LOGGER.info("Client with id {} was inserted in the database", client.getId());

            // Return 201 Created with a success message
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Your account has been created successfully.");
        } catch (Exception e) {
            // Handle any unexpected errors
            LOGGER.error("Error occurred during user registration: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating your account. Please try again later.");
        }
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable("id") UUID id, @RequestBody ClientDTO clientDTO) {

        if (id == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ID cannot be null");
        }
        // Check if the email already exists and it does not belong to the user being updated
        if (clientService.checkEmailExists(clientDTO.getEmail()) && !clientService.isEmailBelongingToUserId(clientDTO.getEmail(), id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(List.of("Email already exists!"));
        }

        // Validate user data
        List<String> validationErrors = ClientValidatorUpdate.validateWholeDataForUser(
                clientDTO.getEmail(),
                clientDTO.getFirstName(),
                clientDTO.getLastName(),
                clientDTO.getPhoneNumber(),
                clientDTO.getDateOfBirth()
        );

        // If there are validation errors, return them with 400 Bad Request
        if (!validationErrors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(validationErrors);
        }

        // Perform the update
        try {
            clientService.updateClient(id, clientDTO); // Assuming clientService has updateUser method
            LOGGER.info("Client with id {} was updated", id);

            // Return success response
            return ResponseEntity.ok("User with id " + id + " has been updated successfully.");
        } catch (Exception e) {
            // Handle unexpected errors
            LOGGER.error("Error occurred during user update: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the user. Please try again later.");
        }
    }



}
