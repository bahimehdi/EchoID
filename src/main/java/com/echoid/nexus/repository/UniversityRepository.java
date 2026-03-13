package com.echoid.nexus.repository;

import com.echoid.nexus.model.University;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UniversityRepository extends JpaRepository<University, UUID> {

    Optional<University> findByDomain(String domain);
}
