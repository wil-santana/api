package com.consultorio.api.repository;

import com.consultorio.api.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface MedicoRepository extends JpaRepository<Medico,Long> {
    boolean existsByCrm(String crm);
}
