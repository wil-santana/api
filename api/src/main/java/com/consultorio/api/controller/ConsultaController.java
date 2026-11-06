package com.consultorio.api.controller;

import com.consultorio.api.model.Consulta;
import com.consultorio.api.service.ConsultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/consulta")
@RequiredArgsConstructor
public class ConsultaController {

    private final ConsultaService consultaService;

    @PostMapping
    public ResponseEntity<Consulta> agendar(@RequestBody Consulta consulta) {
        Consulta consultaAgendada = consultaService.agendar(consulta);
        return ResponseEntity.status(HttpStatus.CREATED).body(consultaAgendada);
    }

    @GetMapping
    public ResponseEntity<List<Consulta>> listar() {
        return ResponseEntity.ok(consultaService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consulta> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(consultaService.buscarPorId(id));
    }

    @PutMapping("/{id}/reagendar")
    public ResponseEntity<Consulta> reagendar(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        LocalDateTime novaData = LocalDateTime.parse(payload.get("dataHorario"));
        Consulta consultaReagendada = consultaService.reagendar(id, novaData);
        return ResponseEntity.ok(consultaReagendada);
    }

    // Cancelamento lógico: muda o status para CANCELADA e libera o horário no banco
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        consultaService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
