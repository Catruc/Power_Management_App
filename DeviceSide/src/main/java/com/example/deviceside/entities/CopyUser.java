package com.example.deviceside.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "copy_user")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CopyUser {

    @Id
    private UUID id;

    @OneToMany(mappedBy = "copyUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Connection> connections;
}
