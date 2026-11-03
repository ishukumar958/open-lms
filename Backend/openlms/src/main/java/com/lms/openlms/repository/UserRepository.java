package com.lms.openlms.repository;

import com.lms.openlms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRoleRoleName(String roleName);
    List<User> findByRoleRoleId(Long roleId);
}
