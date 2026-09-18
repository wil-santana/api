package com.consultorio.api.repository;

import com.consultorio.api.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    // Agora o Spring lê DataHorario perfeitamente e cruza com a sua anotação @Column
    boolean existsByMedicoIdAndDataHorario(Long medicoId, LocalDateTime dataHorario);

}