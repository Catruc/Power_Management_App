package com.example.monitoringside.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "connections")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Connection {

    @Id
    private UUID id;
    @Column(unique = false, nullable = false, length = 2000)
    private String description;
    @Column(unique = false, nullable = false, length = 300)
    private String address;
    @Column(unique = false, nullable = false, length = 25)
    private double consumption;
    @Column(unique = false, nullable = false, length = 25)
    private UUID copyUserId;
    @Column(unique = false, nullable = false, length = 25)
    private UUID deviceId;

    @OneToMany(mappedBy = "connection", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<HourlyMonitoring> hourlyMonitoring;
}
