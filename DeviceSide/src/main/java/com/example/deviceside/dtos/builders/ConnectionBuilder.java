package com.example.deviceside.dtos.builders;

import com.example.deviceside.dtos.ConnectionDTO;
import com.example.deviceside.entities.Connection;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

@Builder
@NoArgsConstructor
public class ConnectionBuilder {

    private static final ModelMapper modelMapper = new ModelMapper();

    public static ConnectionDTO toConnectionDTO(Connection connection)
    {
        return modelMapper.map(connection, ConnectionDTO.class);
    }

    public static Connection toEntity(ConnectionDTO connectionDTO) {
        return modelMapper.map(connectionDTO, Connection.class);
    }
}
