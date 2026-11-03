package com.lms.openlms.repository;

import com.lms.openlms.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleNameIgnoreCase(String roleName);
    Optional<Role> findByRoleName(String roleName);
}
