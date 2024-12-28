# Power Consuming App

A comprehensive web application developed using **Spring Boot** and **React.js**, featuring a modular architecture with four microservices and a secure frontend-backend communication. This project includes functionality for managing clients and devices, monitoring energy consumption, and real-time chat with notifications.

---

## Features

- **Frontend**:

  - Built with **React.js**.
  - Runs on **port 3000**.
  - Communicates with backend microservices via secure headers with **JWT tokens**.
  - Displays real-time notifications and data visualization charts.

- **Microservices**:

  - **Client Service**:
    - Runs on **port 8080**.
    - Manages client-related operations.
    - Synchronizes `userId` with the Device Service using an automated system.
  - **Device Service**:
    - Runs on **port 8081**.
    - Handles device management and associations with users.
    - Syncs `userId` with Client Service.
  - **Monitoring Service**:
    - Runs on **port 8082**.
    - Processes and displays energy consumption data.
    - Features **charts and dashboards** for data visualization.
    - Communicates with the Device Service using **RabbitMQ** for efficient messaging.
  - **Chatting Service**:
    - Runs on **port 8083**.
    - Provides a real-time chat feature using **WebSockets**.
    - Sends notifications to users in real-time.

- **Databases**:

  - Each microservice has its own dedicated database for data persistence and scalability.

- **Secure Communication**:

  - Authentication and communication secured using **JWT tokens**.

- **Message Broker**:

  - Implements **RabbitMQ** for efficient communication between the Device Service and Monitoring Service.

- **Real-Time Features**:

  - **WebSockets** enable real-time chat and user notifications.

- **Automated Synchronization**:

  - Automated `userId` synchronization between Client Service and Device Service ensures data consistency.

---

## Prerequisites

To run this project locally, ensure you have the following installed:

- **Java 17 or higher**
- **Node.js** (for React frontend)
- **RabbitMQ**
- **PostgreSQL** (or preferred database system for each microservice)

---

## Usage

1. **Client Management**:

   - Add, edit, and delete clients via the Client Service.
   - Monitor synchronized `userId` data with the Device Service.

2. **Device Management**:

   - Manage devices and associate them with clients.

3. **Energy Monitoring**:

   - View detailed energy consumption data visualizations.
   - Automatically fetch updates via RabbitMQ communication.

4. **Real-Time Chat and Notifications**:

   - Engage in real-time chat.
   - Receive notifications dynamically.

---

## Technology Stack

- **Frontend**: React.js
- **Backend**: Spring Boot
- **Message Broker**: RabbitMQ
- **Database**: PostgreSQL (or equivalent relational database)
- **Real-Time Communication**: WebSockets
- **Security**: JWT-based authentication

---

## Contact

For inquiries or support, please contact:

- **Name**: Alex Catruc
- **Email**: [dan.catruc@gmail.com](mailto\:dan.catruc@gmail.com)



