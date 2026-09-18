package com.consultorio.api.controller;

import com.consultorio.api.model.Medico;
import com.consultorio.api.service.MedicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medico")
@RequiredArgsConstructor
public class MedicoController {

    private final MedicoService medicoService;

    @PostMapping
    public ResponseEntity<Medico> criar(@RequestBody Medico medico) {
        Medico medicoSalvo = medicoService.salvar(medico);
        // Devolve 201 Created quando o médico é cadastrado com sucesso
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoSalvo);
    }

    @GetMapping
    public ResponseEntity<List<Medico>> listar() {
        return ResponseEntity.ok(medicoService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medico> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medico> atualizar(@PathVariable Long id, @RequestBody Medico medicoAtualizado) {
        Medico medicoSalvo = medicoService.atualizar(id, medicoAtualizado);
        return ResponseEntity.ok(medicoSalvo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        medicoService.deletar(id);
        // Devolve 204 No Content quando a deleção é bem sucedida
        return ResponseEntity.noContent().build();
    }
}