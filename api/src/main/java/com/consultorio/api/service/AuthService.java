package com.consultorio.api.service;

import com.consultorio.api.dto.LoginRequest;
import com.consultorio.api.dto.LoginResponse;
import com.consultorio.api.model.Paciente;
import com.consultorio.api.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PacienteRepository pacienteRepository;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public LoginResponse autenticar(LoginRequest request) {
        if (request == null || request.getLogin() == null || request.getLogin().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo de identificador ou login é obrigatório.");
        }

        String identificador = request.getLogin().trim();
        String senha = request.getSenha() != null ? request.getSenha().trim() : "";

        // 1. Verificação do Perfil Administrador (login: admin, senha: admin123)
        boolean isAdminLogin = identificador.equalsIgnoreCase(adminUsername)
                || identificador.equalsIgnoreCase("admin@consultafacil.com.br")
                || identificador.equals("999.999.999-99");

        if (isAdminLogin) {
            if (!senha.equals(adminPassword)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Senha de administrador incorreta.");
            }

            Map<String, Object> adminData = new HashMap<>();
            adminData.put("id", 9999L);
            adminData.put("nome", "Administrador do Sistema");
            adminData.put("email", "admin@consultafacil.com.br");
            adminData.put("cpf", "999.999.999-99");
            adminData.put("role", "ADMIN");

            return LoginResponse.builder()
                    .success(true)
                    .role("ADMIN")
                    .user(adminData)
                    .build();
        }

        // 2. Verificação de Paciente (por CPF ou E-mail)
        String cpfLimpo = identificador.replaceAll("\\D", "");
        Optional<Paciente> pacienteOpt = pacienteRepository.findAll().stream()
                .filter(p -> {
                    String pCpf = p.getCpf() != null ? p.getCpf().replaceAll("\\D", "") : "";
                    boolean matchCpf = !cpfLimpo.isEmpty() && pCpf.equals(cpfLimpo);
                    boolean matchEmail = p.getEmail() != null && p.getEmail().equalsIgnoreCase(identificador);
                    return matchCpf || matchEmail;
                })
                .findFirst();

        if (pacienteOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Paciente não encontrado. Verifique seu CPF ou cadastre-se.");
        }

        Paciente paciente = pacienteOpt.get();
        Map<String, Object> pacienteData = new HashMap<>();
        pacienteData.put("id", paciente.getId());
        pacienteData.put("nome", paciente.getNome());
        pacienteData.put("cpf", paciente.getCpf());
        pacienteData.put("email", paciente.getEmail());
        pacienteData.put("telefone", paciente.getTelefone());
        pacienteData.put("role", "PACIENTE");

        return LoginResponse.builder()
                .success(true)
                .role("PACIENTE")
                .user(pacienteData)
                .build();
    }
}
