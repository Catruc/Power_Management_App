package com.example.monitoringside.repositories;

import com.example.monitoringside.entities.HourlyMonitoring;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface HourlyMonitoringRepository extends JpaRepository<HourlyMonitoring, UUID> {

    List<HourlyMonitoring> findByDate(LocalDate date);
    List<HourlyMonitoring> findByConnectionIdAndDate(UUID connectionId, LocalDate date);


}
