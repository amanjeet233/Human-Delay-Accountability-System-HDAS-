package com.hdas.repository;

import com.hdas.domain.process.Process;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProcessRepository extends JpaRepository<Process, UUID> {
    List<Process> findByActiveTrue();
    Optional<Process> findByNameAndVersion(String name, String version);
    List<Process> findByName(String name);
}
