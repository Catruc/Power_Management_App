package com.example.deviceside.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConnectionMessageDTO {

    private ConnectionDTO connectionDTO;
    private String actionMessage;
}
