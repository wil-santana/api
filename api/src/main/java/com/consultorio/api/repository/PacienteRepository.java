package com.consultorio.api.repository;

import com.consultorio.api.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    // O Spring Boot gera automaticamente a query: SELECT COUNT(1) FROM pacientes WHERE cpf = ?
    boolean existsByCpf(String cpf);

}