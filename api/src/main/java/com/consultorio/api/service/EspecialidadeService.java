package com.consultorio.api.service;

import com.consultorio.api.model.Especialidade;
import com.consultorio.api.repository.EspecialidadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EspecialidadeService {

    private final EspecialidadeRepository especialidadeRepository;

    public List<Especialidade> listar() {
        return especialidadeRepository.findAll();
    }

    public Especialidade buscarPorId(Long id) {
        return especialidadeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Especialidade não encontrada com ID: " + id));
    }

    @Transactional
    public Especialidade salvar(Especialidade especialidade) {
        // Validação extra profissional: evitar duas especialidades com o mesmo nome
        if (especialidade.getId() == null && especialidadeRepository.existsByNome(especialidade.getNome())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe uma especialidade cadastrada com este nome.");
        }
        return especialidadeRepository.save(especialidade);
    }

    @Transactional
    public Especialidade atualizar(Long id, Especialidade especialidadeAtualizada) {
        // A variável nasce aqui, protegendo contra IDs falsos e apagão de dados
        Especialidade especialidadeExistente = buscarPorId(id);

        especialidadeExistente.setNome(especialidadeAtualizada.getNome());

        return especialidadeRepository.save(especialidadeExistente);
    }

    @Transactional
    public void deletar(Long id) {
        Especialidade especialidade = buscarPorId(id);
        especialidadeRepository.delete(especialidade);
    }
}