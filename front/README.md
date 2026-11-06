# Consulta Fácil — Frontend (React + Node)

Interface acessível de agendamento médico com foco na terceira idade e baixa literacia digital, desenvolvida com **React 18** e **Vite**.

---

## 🚀 Como Executar o Projeto

Certifique-se de que o **Node.js** está instalado em seu computador.

1. Abra o terminal (PowerShell, CMD ou Git Bash) e acesse a pasta `front`:
   ```bash
   cd front
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. O sistema abrirá automaticamente no navegador em:
   `http://localhost:3000`

---

## 📱 Funcionalidades e Telas Implementadas

* **Tela 01 — Boas-Vindas:** Botões principais na zona do polegar, benefícios claros e canal telefônico 0800.
* **Tela 02 — Login Seguro:** Identificação por CPF ou e-mail, alternância bimodal de senha (`[ 👁️ Mostrar ]` / `[ 🙈 Ocultar ]`) e foco de alto contraste.
* **Tela 03 — Novo Cadastro:** Coluna única vertical, chunking em 2 passos (Dados Pessoais e Contato & Senha) e máscaras automáticas de digitação.
* **Tela 04 — Reagendar Consulta:** Card contextual da consulta atual, mini calendário retrátil sob demanda e chips de horários 2x2.
* **Modo Sênior:** Botão no cabeçalho que amplia a escala tipográfica em 20% e reforça o contraste visual.

---

## 🔌 Integração com o Backend Java

O arquivo [`src/services/api.js`](src/services/api.js) está pré-configurado para comunicar-se com a API Java (porta `8080`). Se o backend ainda não estiver em execução, o front continua navegável com respostas simuladas.
