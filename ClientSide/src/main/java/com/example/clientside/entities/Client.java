package com.example.clientside.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "clients")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Client implements UserDetails{

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;
    @Column(unique = false, nullable = false, length = 50)
    private String role;
    @Column(unique = true, nullable = false, length = 50)
    private String email;
    @Column(unique = false, nullable = false, length = 100)
    private String password;
    @Column(name="first_name",unique = false, nullable = false, length = 100)
    private String firstName;
    @Column(name="last_name",unique = false, nullable = false, length = 100)
    private String lastName;
    @Column(name="phone_number",unique = false, nullable = false, length = 25)
    private String phoneNumber;
    @Column(name="date_of_birth",unique = false, nullable = false, length = 25)
    private LocalDate dateOfBirth;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}
