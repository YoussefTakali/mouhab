package com.assainissement.repository;

import com.assainissement.entity.Client;
import com.assainissement.entity.ClientType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    List<Client> findByActiveTrue();
    
    List<Client> findByType(ClientType type);
    
    Optional<Client> findBySiret(String siret);
    
    @Query("SELECT c FROM Client c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Client> searchByName(@Param("search") String search);
    
    @Query("SELECT c FROM Client c WHERE c.city = :city AND c.active = true")
    List<Client> findByCity(@Param("city") String city);
    
    @Query("SELECT c FROM Client c WHERE c.hasContract = true AND c.active = true")
    List<Client> findClientsWithContracts();
}
