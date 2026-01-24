package com.hdas.repository;

import com.hdas.model.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, Long> {
    
    Optional<FeatureFlag> findByName(String name);
    
    List<FeatureFlag> findByCategory(String category);
    
    List<FeatureFlag> findByEnabled(Boolean enabled);
    
    //    List<FeatureFlag> findByRequiredRolesContaining(String role);
    
    boolean existsByName(String name);
}
