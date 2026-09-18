package com.consultorio.api.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "consulta") // Se no banco a tabela estiver no plural, mude para "consultas"
@Data
public class Consulta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "medico_id")
    private Medico medico;

    // O Java usa dataHorario, mas salva no banco na coluna data_horario
    @Column(name = "data_horario")
    private LocalDateTime dataHorario;

    private String status;
}