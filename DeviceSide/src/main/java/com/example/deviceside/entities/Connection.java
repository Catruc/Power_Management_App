package com.example.deviceside.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

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
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(unique = false, nullable = false, length = 2000)
    private String description;

    @Column(unique = false, nullable = false, length = 300)
    private String address;

    @Column(unique = false, nullable = false, length = 25)
    private double consumption;
    @ManyToOne
    @JoinColumn(name = "copy_user_id", referencedColumnName = "id")
    private CopyUser copyUser;

    @ManyToOne
    @JoinColumn(name = "device_id", referencedColumnName = "id")
    private Device device;

}
