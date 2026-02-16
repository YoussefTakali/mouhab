package com.assainissement.repository;

import com.assainissement.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByUserId(Long userId);
    
    Optional<Employee> findByEmployeeCode(String employeeCode);
    
    @Query("SELECT e FROM Employee e WHERE e.user.active = true")
    List<Employee> findAllActive();
    
    @Query("SELECT e FROM Employee e WHERE e.supervisor.id = :supervisorId")
    List<Employee> findBySuperviorId(@Param("supervisorId") Long supervisorId);
    
    @Query("SELECT e FROM Employee e WHERE :skill MEMBER OF e.skills")
    List<Employee> findBySkill(@Param("skill") String skill);
    
    @Query("SELECT e FROM Employee e ORDER BY e.totalPoints DESC")
    List<Employee> findAllOrderByTotalPointsDesc();
    
    @Query("SELECT e FROM Employee e ORDER BY e.monthlyPoints DESC")
    List<Employee> findAllOrderByMonthlyPointsDesc();
    
    @Query("SELECT e FROM Employee e WHERE e.user.active = true ORDER BY e.monthlyPoints DESC LIMIT :limit")
    List<Employee> findTopPerformers(@Param("limit") int limit);
    
    @Query("SELECT e FROM Employee e WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(e.currentLatitude)) * " +
           "cos(radians(e.currentLongitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(e.currentLatitude)))) < :distance " +
           "AND e.user.active = true")
    List<Employee> findNearbyEmployees(@Param("lat") Double latitude, 
                                        @Param("lng") Double longitude, 
                                        @Param("distance") Double distanceKm);
}
