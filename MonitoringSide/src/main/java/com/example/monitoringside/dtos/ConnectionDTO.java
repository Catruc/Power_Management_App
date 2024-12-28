package com.example.monitoringside.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionDTO {

        private UUID id;
        private String description;
        private String address;
        private double consumption;
        private UUID copyUserId;
        private UUID deviceId;
}
