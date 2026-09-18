package com.consultorio.api.model;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "medico")
@Data

public class Medico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String crm;
    private String email;
    private String telefone;

    @ManyToOne
    @JoinColumn(name = "especialidade_id")
    private Especialidade especialidade;
}
