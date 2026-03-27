// backend/src/main/java/com/neurofleetx/repository/UserRepository.java
package com.neurofleetx.repository;

import com.neurofleetx.entity.User;
import com.neurofleetx.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndRole(String email, Role role);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleAndAvailableTrue(Role role);
    long countByRole(Role role);
}