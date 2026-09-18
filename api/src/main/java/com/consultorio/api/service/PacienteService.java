package com.consultorio.api.service;

import com.consultorio.api.model.Paciente;
import com.consultorio.api.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public List<Paciente> listar() {
        return pacienteRepository.findAll();
    }

    public Paciente buscarPorId(Long id) {
        // Busca o paciente; se não achar, joga um Erro 404 limpo, sem quebrar o sistema.
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado com ID: " + id));
    }

    @Transactional // Garante que a operação no banco seja executada por completo ou desfeita em caso de erro
    public Paciente salvar(Paciente paciente) {
        // Regra: Verifica se o CPF já existe antes de tentar salvar
        if (paciente.getId() == null && pacienteRepository.existsByCpf(paciente.getCpf())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe um paciente cadastrado com este CPF.");
        }
        return pacienteRepository.save(paciente);
    }

    @Transactional
    public Paciente atualizar(Long id, Paciente pacienteAtualizado) {
        // Busca primeiro para garantir que o paciente existe no banco
        Paciente pacienteExistente = buscarPorId(id);

        // Atualiza apenas os campos permitidos
        pacienteExistente.setNome(pacienteAtualizado.getNome());
        pacienteExistente.setEmail(pacienteAtualizado.getEmail());
        pacienteExistente.setTelefone(pacienteAtualizado.getTelefone());

        // A data de nascimento e o CPF geralmente não mudam,
        // mas se precisar mudar o CPF, seria necessário validar duplicidade novamente.

        return pacienteRepository.save(pacienteExistente);
    }

    @Transactional
    public void deletar(Long id) {
        Paciente paciente = buscarPorId(id); // Garante que existe antes de tentar deletar
        pacienteRepository.delete(paciente);
    }
}