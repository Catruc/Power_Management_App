package com.example.clientside.dtos.builders;

import com.example.clientside.dtos.ClientDTO;
import com.example.clientside.entities.Client;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

@Builder
@NoArgsConstructor
public class ClientBuilder {
    private static final ModelMapper modelMapper = new ModelMapper();

    public static ClientDTO toClientDTO(Client client)
    {
        return modelMapper.map(client, ClientDTO.class);
    }

    public static Client toEntity(ClientDTO clientDTO) {
        return modelMapper.map(clientDTO, Client.class);
    }
}
