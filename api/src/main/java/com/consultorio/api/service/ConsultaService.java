package com.consultorio.api.service;

import com.consultorio.api.model.Consulta;
import com.consultorio.api.model.Medico;
import com.consultorio.api.model.Paciente;
import com.consultorio.api.repository.ConsultaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final PacienteService pacienteService;
    private final MedicoService medicoService;

    public List<Consulta> listar() {
        return consultaRepository.findAll();
    }

    public Consulta buscarPorId(Long id) {
        return consultaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consulta não encontrada."));
    }

    @Transactional
    public Consulta agendar(Consulta consulta) {
        // 1. Valida se a data da consulta não está no passado
        if (consulta.getDataHorario().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível agendar consultas no passado.");
        }

        // 2. Garante que o paciente existe (se não existir, o service lança erro 404)
        Paciente pacienteReal = pacienteService.buscarPorId(consulta.getPaciente().getId());

        // 3. Garante que o médico existe (se não existir, o service lança erro 404)
        Medico medicoReal = medicoService.buscarPorId(consulta.getMedico().getId());

        // 4. Regra de Negócio: Evitar choque de horários para o mesmo médico (ignora consultas canceladas)
        if (consultaRepository.existsByMedicoIdAndDataHorarioAndStatusNot(medicoReal.getId(), consulta.getDataHorario(), "CANCELADA")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O médico já possui uma consulta agendada para este horário.");
        }

        // 5. Preenche os dados validados e define o status inicial
        consulta.setPaciente(pacienteReal);
        consulta.setMedico(medicoReal);
        consulta.setStatus("AGENDADA");

        return consultaRepository.save(consulta);
    }

    @Transactional
    public Consulta reagendar(Long id, LocalDateTime novoDataHorario) {
        Consulta consulta = buscarPorId(id);

        if (novoDataHorario.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível reagendar para uma data no passado.");
        }

        // Verifica se o médico já tem outra consulta ativa nesse novo horário
        if (consultaRepository.existsByMedicoIdAndDataHorarioAndStatusNot(consulta.getMedico().getId(), novoDataHorario, "CANCELADA")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O médico já possui uma consulta agendada para este horário.");
        }

        consulta.setDataHorario(novoDataHorario);
        consulta.setStatus("AGENDADA");
        return consultaRepository.save(consulta);
    }

    @Transactional
    public void cancelar(Long id) {
        Consulta consulta = buscarPorId(id);

        if ("CANCELADA".equalsIgnoreCase(consulta.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta consulta já encontra-se cancelada.");
        }

        // Cancelamento Lógico: muda o status para CANCELADA e libera o horário no banco
        consulta.setStatus("CANCELADA");
        consultaRepository.save(consulta);
    }
}
