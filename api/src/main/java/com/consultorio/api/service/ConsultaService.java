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

        // 4. Regra de Negócio: Evitar choque de horários para o mesmo médico
        if (consultaRepository.existsByMedicoIdAndDataHorario(medicoReal.getId(), consulta.getDataHorario())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O médico já possui uma consulta agendada para este horário.");
        }

        // 5. Preenche os dados validados e define o status inicial
        consulta.setPaciente(pacienteReal);
        consulta.setMedico(medicoReal);
        consulta.setStatus("AGENDADA"); // Protege contra o frontend mandar um status "REALIZADA" na hora de criar

        return consultaRepository.save(consulta);
    }

    @Transactional
    public void cancelar(Long id) {
        Consulta consulta = buscarPorId(id);

        if (consulta.getStatus().equals("CANCELADA")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta consulta já encontra-se cancelada.");
        }

        // Em vez de deletar a linha do banco, nós atualizamos o status.
        // Isso é chamado de "Soft Delete" ou Cancelamento Lógico.
        consulta.setStatus("CANCELADA");
        consultaRepository.save(consulta);
    }
}