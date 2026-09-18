package com.consultorio.api.repository;

import com.consultorio.api.model.Especialidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecialidadeRepository extends JpaRepository<Especialidade, Long> {

    boolean existsByNome(String nome);
}
