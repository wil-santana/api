package com.consultorio.api.service;

import com.consultorio.api.model.Especialidade;
import com.consultorio.api.model.Medico;
import com.consultorio.api.repository.MedicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicoService {

    private final MedicoRepository medicoRepository;

    // Injetamos o Service da especialidade para usar as validações dele!
    private final EspecialidadeService especialidadeService;

    public List<Medico> listar() {
        return medicoRepository.findAll();
    }

    public Medico buscarPorId(Long id) {
        return medicoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico não encontrado com ID: " + id));
    }

    @Transactional
    public Medico salvar(Medico medico) {
        // 1. Valida se o CRM já existe
        if (medico.getId() == null && medicoRepository.existsByCrm(medico.getCrm())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe um médico cadastrado com este CRM.");
        }

        // 2. Valida se a especialidade existe. Se o ID for inválido, o especialidadeService
        // vai estourar um Erro 404 automaticamente e barrar a operação!
        Especialidade especialidadeReal = especialidadeService.buscarPorId(medico.getEspecialidade().getId());

        // 3. Associa a especialidade real que veio do banco ao médico
        medico.setEspecialidade(especialidadeReal);

        return medicoRepository.save(medico);
    }

    @Transactional
    public Medico atualizar(Long id, Medico medicoAtualizado) {
        // Busca o médico antigo
        Medico medicoExistente = buscarPorId(id);

        // Busca e valida a nova especialidade (caso ele tenha mudado de especialidade)
        Especialidade novaEspecialidade = especialidadeService.buscarPorId(medicoAtualizado.getEspecialidade().getId());

        // Atualiza os dados permitidos
        medicoExistente.setNome(medicoAtualizado.getNome());
        medicoExistente.setTelefone(medicoAtualizado.getTelefone());
        medicoExistente.setEmail(medicoAtualizado.getEmail());
        medicoExistente.setEspecialidade(novaEspecialidade);

        // O CRM é como um CPF, não deve ser alterado. Por isso não colocamos o setCrm() aqui.

        return medicoRepository.save(medicoExistente);
    }

    @Transactional
    public void deletar(Long id) {
        Medico medico = buscarPorId(id);
        medicoRepository.delete(medico);
    }
}