package com.consultorio.api.controller;

import com.consultorio.api.model.Especialidade;
import com.consultorio.api.service.EspecialidadeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/especialidade")
@RequiredArgsConstructor
public class EspecialidadeController {

    private final EspecialidadeService especialidadeService;

    @PostMapping
    public ResponseEntity<Especialidade> salvar(@RequestBody Especialidade especialidade) {
        Especialidade novaEspecialidade = especialidadeService.salvar(especialidade);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaEspecialidade);
    }

    @GetMapping
    public ResponseEntity<List<Especialidade>> listar() {
        return ResponseEntity.ok(especialidadeService.listar());
    }

    // AQUI ESTÁ O ENDPOINT QUE VOCÊ TENTOU ACESSAR NO POSTMAN
    @GetMapping("/{id}")
    public ResponseEntity<Especialidade> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(especialidadeService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Especialidade> atualizar(@PathVariable Long id, @RequestBody Especialidade especialidade) {
        return ResponseEntity.ok(especialidadeService.atualizar(id, especialidade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        especialidadeService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}