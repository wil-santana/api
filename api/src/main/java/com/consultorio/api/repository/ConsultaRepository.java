package com.consultorio.api.repository;

import com.consultorio.api.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    // Verifica conflito de horário apenas para consultas que NÃO estão canceladas
    // Assim, ao cancelar ou reagendar, o horário antigo é automaticamente liberado no banco
    boolean existsByMedicoIdAndDataHorarioAndStatusNot(Long medicoId, LocalDateTime dataHorario, String status);

}
