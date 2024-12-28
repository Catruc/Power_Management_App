package com.example.monitoringside.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "hourly_monitoring")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class HourlyMonitoring {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "connection_id", referencedColumnName = "id")
    private Connection connection;

    @Column(unique = false, nullable = false, length = 50)
    private LocalDate date;

    @Column(unique = false, nullable = false, length = 50)
    private LocalTime time;

    @Column(unique = false, nullable = false, length = 50)
    private Double hourlyConsumption;
}
