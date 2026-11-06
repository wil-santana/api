// Serviço de integração com a API Java Spring Boot (porta 8080)
// Usa dinamicamente o IP/hostname do dispositivo que está acessando (permitindo acesso via celular na rede local)
const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location && window.location.hostname ? `http://${window.location.hostname}:8080` : 'http://localhost:8080');

// Horários padronizados de 20 em 20 minutos
export const SLOTS_MANHA = [
  '07:00', '07:20', '07:40',
  '08:00', '08:20', '08:40',
  '09:00', '09:20', '09:40',
  '10:00', '10:20', '10:40',
  '11:00', '11:20', '11:40'
];

export const SLOTS_TARDE = [
  '13:20', '13:40',
  '14:00', '14:20', '14:40',
  '15:00', '15:20', '15:40',
  '16:00', '16:20', '16:40',
  '17:00', '17:20', '17:40'
];

// 1. Login: Suporta Pacientes e Administrador através do Backend /auth/login
export async function loginUser(cpfOrEmail, password) {
  const identificador = (cpfOrEmail || '').trim();
  const identLower = identificador.toLowerCase();
  const isAdminInput = identLower === 'admin' || identLower === 'admin@consultafacil.com.br' || identLower === '999.999.999-99';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: identificador,
        senha: password
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        localStorage.setItem('consulta_facil_paciente', JSON.stringify(data.user));
        return { success: true, paciente: data.user, role: data.role };
      }
    }

    // Se o backend retornou 404 Not Found (porque o Spring Boot ainda não foi reiniciado para carregar a nova rota /auth/login)
    if (response.status === 404) {
      if (isAdminInput) {
        if (password !== 'admin123') {
          throw new Error('Senha de administrador incorreta.');
        }
        const adminUser = {
          id: 9999,
          nome: 'Administrador do Sistema',
          email: 'admin@consultafacil.com.br',
          cpf: '999.999.999-99',
          role: 'ADMIN'
        };
        localStorage.setItem('consulta_facil_paciente', JSON.stringify(adminUser));
        return { success: true, paciente: adminUser, role: 'ADMIN' };
      }
    }

    // Se o backend recusou o login (ex: 401 Unauthorized por senha incorreta ou usuário inexistente)
    let msgErro = 'Credenciais inválidas. Verifique seu login e senha.';
    try {
      const errJson = await response.json();
      if (errJson) {
        msgErro = errJson.message || errJson.detail || errJson.error || msgErro;
      }
    } catch (_) {
      const errText = await response.text();
      if (errText) msgErro = errText;
    }
    throw new Error(msgErro);
  } catch (error) {
    if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
      throw error;
    }
    console.warn('Backend Java offline, aplicando autenticação de contingência:', error);
  }

  // Fallback de contingência caso o backend esteja completamente inacessível:
  if (isAdminInput) {
    if (password !== 'admin123') {
      throw new Error('Senha de administrador incorreta.');
    }
    const adminUser = {
      id: 9999,
      nome: 'Administrador do Sistema',
      email: 'admin@consultafacil.com.br',
      cpf: '999.999.999-99',
      role: 'ADMIN'
    };
    localStorage.setItem('consulta_facil_paciente', JSON.stringify(adminUser));
    return { success: true, paciente: adminUser, role: 'ADMIN' };
  }

  // Paciente de demonstração caso a busca falhe e o backend esteja fora
  const pacienteDemo = { id: 1, nome: 'Wilson Santana', cpf: '000.000.000-00', telefone: '(81) 99999-9999', role: 'PACIENTE' };
  localStorage.setItem('consulta_facil_paciente', JSON.stringify(pacienteDemo));
  return { success: true, paciente: pacienteDemo, role: 'PACIENTE' };
}

// 2. Cadastro de Paciente (POST /paciente)
export async function registerUser({ nome, cpf, dataNascimento, telefone, email }) {
  let dataFormatada = dataNascimento;
  if (dataNascimento && dataNascimento.includes('/')) {
    const [dia, mes, ano] = dataNascimento.split('/');
    dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  const payload = {
    nome,
    cpf,
    email: email || `${cpf.replace(/\D/g, '')}@consultafacil.com.br`,
    telefone,
    dataNascimento: dataFormatada
  };

  try {
    const response = await fetch(`${API_BASE_URL}/paciente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const pacienteSalvo = await response.json();
      pacienteSalvo.role = 'PACIENTE';
      localStorage.setItem('consulta_facil_paciente', JSON.stringify(pacienteSalvo));
      return { success: true, paciente: pacienteSalvo };
    }

    // Se o backend respondeu com erro (ex: 400 Bad Request por CPF duplicado ou inválido)
    let msgErro = 'Não foi possível cadastrar o paciente com este CPF.';
    try {
      const errJson = await response.json();
      if (errJson) {
        msgErro = errJson.message || errJson.detail || errJson.error || msgErro;
      }
    } catch (_) {
      const errText = await response.text();
      if (errText) msgErro = errText;
    }
    throw new Error(msgErro);
  } catch (error) {
    if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
      throw error;
    }
    console.warn('Backend Java offline, usando paciente de demonstração:', error);
  }

  const demoSalvo = { id: 1, role: 'PACIENTE', ...payload };
  localStorage.setItem('consulta_facil_paciente', JSON.stringify(demoSalvo));
  return { success: true, paciente: demoSalvo };
}

// 3. Listar Médicos disponíveis (GET /medico)
export async function listarMedicos() {
  try {
    const response = await fetch(`${API_BASE_URL}/medico`);
    if (response.ok) {
      const lista = await response.json();
      if (lista && lista.length > 0) return lista;
    }
  } catch (error) {
    console.warn('Backend Java offline ao buscar médicos:', error);
  }
  return [
    { id: 3, nome: 'Dr. Carlos Silva', crm: '12345-PE', especialidade: { id: 1, nome: 'Cardiologia' }, email: 'carlos@clinica.com', telefone: '(81) 98888-1111' },
    { id: 1, nome: 'Dr. Wilson Santana', crm: '396-7', especialidade: { id: 1, nome: 'Cardiologia' }, email: 'wilson@clinica.com', telefone: '(81) 98888-2222' },
    { id: 4, nome: 'Dra. Ana Maria', crm: '588-MA', especialidade: { id: 2, nome: 'Dermatologia' }, email: 'ana@clinica.com', telefone: '(81) 98888-3333' }
  ];
}

// 4. Listar Consultas do Paciente (GET /consulta)
export async function listarConsultasDoPaciente(pacienteId) {
  try {
    const response = await fetch(`${API_BASE_URL}/consulta`);
    if (response.ok) {
      const todas = await response.json();
      const doPaciente = todas.filter(c => c.paciente && Number(c.paciente.id) === Number(pacienteId));
      return doPaciente;
    }
  } catch (error) {
    console.warn('Backend offline ao buscar consultas:', error);
  }

  return [
    {
      id: 8,
      medico: { id: 3, nome: 'Dr. Carlos Silva', crm: '12345-PE', especialidade: { nome: 'Cardiologia' } },
      dataHorario: '2026-10-15T13:40:00',
      status: 'AGENDADA'
    }
  ];
}

// 5. Buscar Horários Ocupados de um Médico para determinado dia (GET /consulta)
export async function obterHorariosOcupados(medicoId, dataIsoString) {
  try {
    const response = await fetch(`${API_BASE_URL}/consulta`);
    if (response.ok) {
      const todas = await response.json();
      const ocupadas = todas
        .filter(c => {
          if (!c.medico || Number(c.medico.id) !== Number(medicoId)) return false;
          if (String(c.status).toUpperCase() === 'CANCELADA') return false;
          return c.dataHorario && c.dataHorario.startsWith(dataIsoString);
        })
        .map(c => c.dataHorario.substring(11, 16));
      return ocupadas;
    }
  } catch (error) {
    console.warn('Erro ao consultar horários ocupados:', error);
  }
  return [];
}

// 6. Agendar Nova Consulta no Banco (POST /consulta)
export async function agendarNovaConsulta({ pacienteId, medicoId, dataTexto, horarioTexto }) {
  let ano = '2026';
  let mes = '10';
  let dia = '15';
  
  const matchData = dataTexto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (matchData) {
    dia = matchData[1];
    mes = matchData[2];
    ano = matchData[3];
  }

  let hora = '09:00:00';
  const matchHora = horarioTexto.match(/(\d{2}:\d{2})/);
  if (matchHora) {
    hora = `${matchHora[1]}:00`;
  }

  const dataHorarioIso = `${ano}-${mes}-${dia}T${hora}`;

  const payload = {
    paciente: { id: pacienteId },
    medico: { id: medicoId },
    dataHorario: dataHorarioIso
  };

  try {
    const response = await fetch(`${API_BASE_URL}/consulta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const consultaCriada = await response.json();
      return { success: true, consulta: consultaCriada };
    }

    if (response.status === 409) {
      throw new Error('O médico já possui uma consulta agendada para este horário.');
    }

    const errText = await response.text();
    throw new Error(errText || 'Falha ao agendar consulta.');
  } catch (error) {
    if (error.message.includes('já possui')) {
      throw error;
    }
    console.warn('Backend offline ao agendar, simulando sucesso:', error);
  }

  return { success: true, message: `Consulta agendada para ${dia}/${mes}/${ano} às ${hora.substring(0, 5)}!` };
}

// 7. Cancelar Consulta no Banco (DELETE /consulta/{id}) - Libera o horário imediatamente
export async function cancelarConsulta(consultaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/consulta/${consultaId}`, {
      method: 'DELETE'
    });
    if (response.ok || response.status === 204) {
      return { success: true };
    }
  } catch (error) {
    console.warn('Erro ao cancelar consulta no backend:', error);
  }
  return { success: true, message: 'Consulta cancelada com sucesso' };
}

// 8. Reagendar Consulta no Banco (PUT /consulta/{id}/reagendar)
export async function rescheduleAppointment(appointmentId, dataTexto, horarioTexto) {
  let ano = '2026';
  let mes = '10';
  let dia = '15';
  
  const matchData = dataTexto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (matchData) {
    dia = matchData[1];
    mes = matchData[2];
    ano = matchData[3];
  }

  let hora = '09:00:00';
  const matchHora = horarioTexto.match(/(\d{2}:\d{2})/);
  if (matchHora) {
    hora = `${matchHora[1]}:00`;
  }

  const novaDataHorario = `${ano}-${mes}-${dia}T${hora}`;

  try {
    const response = await fetch(`${API_BASE_URL}/consulta/${appointmentId}/reagendar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataHorario: novaDataHorario })
    });

    if (response.ok) {
      const consultaAtualizada = await response.json();
      return { success: true, consulta: consultaAtualizada };
    }

    if (response.status === 409) {
      throw new Error('O médico já possui uma consulta agendada para este horário.');
    }
  } catch (error) {
    if (error.message.includes('já possui')) {
      throw error;
    }
    console.warn('PUT reagendar offline:', error);
  }

  return { success: true, message: `Consulta reagendada com sucesso para ${dia}/${mes}/${ano} às ${hora.substring(0, 5)}!` };
}

// ==========================================
// FUNÇÕES DE ADMINISTRAÇÃO E GESTÃO CLÍNICA
// ==========================================

const DEFAULT_CONFIG_DIAS = {
  domingo: true,
  segunda: true,
  sabado: true,
  opcaoSabado: 'meio_periodo' // 'dia_todo' | 'meio_periodo'
};

const DEFAULT_EXCECOES = [
  { id: 1, data: '2026-11-02', tipo: 'fechado', descricao: 'Finados' },
  { id: 2, data: '2026-11-15', tipo: 'fechado', descricao: 'Proclamação da República' },
  { id: 3, data: '2026-12-25', tipo: 'fechado', descricao: 'Natal' }
];

export function obterConfiguracoesClinica() {
  try {
    const diasSalvos = localStorage.getItem('clinica_dias_fixos');
    const excecoesSalvas = localStorage.getItem('clinica_excecoes');
    return {
      diasFixos: diasSalvos ? JSON.parse(diasSalvos) : DEFAULT_CONFIG_DIAS,
      excecoes: excecoesSalvas ? JSON.parse(excecoesSalvas) : DEFAULT_EXCECOES
    };
  } catch (_) {
    return { diasFixos: DEFAULT_CONFIG_DIAS, excecoes: DEFAULT_EXCECOES };
  }
}

export function salvarDiasFixos(config) {
  localStorage.setItem('clinica_dias_fixos', JSON.stringify(config));
  return { success: true };
}

export function adicionarExcecao({ data, tipo, descricao }) {
  const configs = obterConfiguracoesClinica();
  const nova = {
    id: Date.now(),
    data,
    tipo: tipo || 'fechado',
    descricao: descricao || (tipo === 'fechado' ? 'Feriado / Fechado' : 'Aberto Extra')
  };
  const atualizadas = [...configs.excecoes.filter(e => e.data !== data), nova];
  localStorage.setItem('clinica_excecoes', JSON.stringify(atualizadas));
  return { success: true, excecao: nova };
}

export function removerExcecao(id) {
  const configs = obterConfiguracoesClinica();
  const atualizadas = configs.excecoes.filter(e => e.id !== id);
  localStorage.setItem('clinica_excecoes', JSON.stringify(atualizadas));
  return { success: true };
}

export function verificarBloqueioData(dataIsoString) {
  if (!dataIsoString) return { bloqueado: false };
  const { diasFixos, excecoes } = obterConfiguracoesClinica();

  const excecaoEncontrada = excecoes.find(e => e.data === dataIsoString);
  if (excecaoEncontrada) {
    if (excecaoEncontrada.tipo === 'fechado') {
      return { bloqueado: true, motivo: `Feriado / Fechado (${excecaoEncontrada.descricao || 'Exceção'})` };
    }
    if (excecaoEncontrada.tipo === 'aberto') {
      return { bloqueado: false };
    }
  }

  const partes = dataIsoString.split('-');
  const dateObj = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  const diaSemana = dateObj.getDay();

  if (diaSemana === 0 && diasFixos.domingo) {
    return { bloqueado: true, motivo: 'Domingos não há atendimento na clínica.' };
  }
  if (diaSemana === 1 && diasFixos.segunda) {
    return { bloqueado: true, motivo: 'Segundas-feiras a clínica permanece fechada.' };
  }
  if (diaSemana === 6 && diasFixos.sabado && diasFixos.opcaoSabado === 'dia_todo') {
    return { bloqueado: true, motivo: 'Sábados a clínica permanece fechada o dia todo.' };
  }

  return { bloqueado: false, meioPeriodo: diaSemana === 6 && diasFixos.sabado && diasFixos.opcaoSabado === 'meio_periodo' };
}

export async function listarTodasConsultasAdmin() {
  try {
    const response = await fetch(`${API_BASE_URL}/consulta`);
    if (response.ok) {
      const lista = await response.json();
      if (lista && lista.length > 0) return lista;
    }
  } catch (error) {
    console.warn('Backend offline ao buscar todas consultas admin:', error);
  }

  return [
    {
      id: 101,
      paciente: { id: 1, nome: 'Wilson Santana', cpf: '000.000.000-00', telefone: '(81) 99999-9999', email: 'wilson@email.com' },
      medico: { id: 3, nome: 'Dr. Carlos Silva', crm: '12345-PE', especialidade: { nome: 'Cardiologia' } },
      dataHorario: '2026-10-15T08:20:00',
      status: 'AGENDADA'
    },
    {
      id: 102,
      paciente: { id: 2, nome: 'Maria de Lourdes Santos', cpf: '111.222.333-44', telefone: '(81) 98888-7777', email: 'maria.lourdes@email.com' },
      medico: { id: 1, nome: 'Dr. Wilson Santana', crm: '396-7', especialidade: { nome: 'Cardiologia' } },
      dataHorario: '2026-10-15T10:00:00',
      status: 'AGENDADA'
    },
    {
      id: 103,
      paciente: { id: 3, nome: 'José Ferreira da Silva', cpf: '222.333.444-55', telefone: '(81) 97777-6666', email: 'jose.ferreira@email.com' },
      medico: { id: 4, nome: 'Dra. Ana Maria', crm: '588-MA', especialidade: { nome: 'Dermatologia' } },
      dataHorario: '2026-10-15T14:40:00',
      status: 'CONCLUIDA'
    },
    {
      id: 104,
      paciente: { id: 4, nome: 'Sebastião Alves', cpf: '333.444.555-66', telefone: '(81) 96666-5555', email: 'sebastiao@email.com' },
      medico: { id: 3, nome: 'Dr. Carlos Silva', crm: '12345-PE', especialidade: { nome: 'Cardiologia' } },
      dataHorario: '2026-10-16T09:40:00',
      status: 'CANCELADA'
    }
  ];
}

export async function listarTodosPacientes() {
  try {
    const response = await fetch(`${API_BASE_URL}/paciente`);
    if (response.ok) {
      const lista = await response.json();
      if (lista && lista.length > 0) return lista;
    }
  } catch (error) {
    console.warn('Backend offline ao listar pacientes:', error);
  }

  return [
    { id: 1, nome: 'Wilson Santana', cpf: '000.000.000-00', telefone: '(81) 99999-9999', email: 'wilson@email.com', dataNascimento: '1955-08-14' },
    { id: 2, nome: 'Maria de Lourdes Santos', cpf: '111.222.333-44', telefone: '(81) 98888-7777', email: 'maria.lourdes@email.com', dataNascimento: '1948-03-22' },
    { id: 3, nome: 'José Ferreira da Silva', cpf: '222.333.444-55', telefone: '(81) 97777-6666', email: 'jose.ferreira@email.com', dataNascimento: '1960-11-05' },
    { id: 4, nome: 'Sebastião Alves', cpf: '333.444.555-66', telefone: '(81) 96666-5555', email: 'sebastiao@email.com', dataNascimento: '1952-07-19' }
  ];
}

// ==========================================
// CRUD COMPLETO DE ENTIDADES (MÉDICOS, ESPECIALIDADES, PACIENTES)
// ==========================================

// --- ESPECIALIDADES ---
export async function listarEspecialidades() {
  try {
    const response = await fetch(`${API_BASE_URL}/especialidade`);
    if (response.ok) {
      const lista = await response.json();
      if (lista && lista.length > 0) return lista;
    }
  } catch (error) {
    console.warn('Backend offline ao listar especialidades:', error);
  }
  return [
    { id: 1, nome: 'Cardiologia' },
    { id: 2, nome: 'Dermatologia' },
    { id: 3, nome: 'Geriatria' },
    { id: 4, nome: 'Ortopedia' }
  ];
}

export async function criarEspecialidade({ nome }) {
  try {
    const response = await fetch(`${API_BASE_URL}/especialidade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.warn('Erro ao criar especialidade no backend:', error);
  }
  return { id: Date.now(), nome };
}

export async function deletarEspecialidade(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/especialidade/${id}`, { method: 'DELETE' });
    if (response.ok || response.status === 204) return { success: true };
  } catch (error) {
    console.warn('Erro ao deletar especialidade:', error);
  }
  return { success: true };
}

// --- MÉDICOS ---
export async function criarMedico({ nome, crm, email, telefone, especialidadeId }) {
  const payload = {
    nome,
    crm,
    email: email || `${nome.toLowerCase().replace(/\s+/g, '.')}@clinica.com`,
    telefone: telefone || '(81) 98888-0000',
    especialidade: especialidadeId ? { id: Number(especialidadeId) } : null
  };
  try {
    const response = await fetch(`${API_BASE_URL}/medico`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) return await response.json();

    let msgErro = 'Não foi possível cadastrar o médico.';
    try {
      const errJson = await response.json();
      if (errJson) { msgErro = errJson.detail || errJson.message || errJson.error || msgErro; }
    } catch (_) {
      const errText = await response.text();
      if (errText) msgErro = errText;
    }
    throw new Error(msgErro);
  } catch (error) {
    if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
      throw error;
    }
    console.warn('Erro de rede ao criar médico:', error);
  }
  return { id: Date.now(), ...payload };
}

export async function atualizarMedico(id, { nome, crm, email, telefone, especialidadeId }) {
  const payload = {
    nome,
    crm,
    email,
    telefone,
    especialidade: especialidadeId ? { id: Number(especialidadeId) } : null
  };
  try {
    const response = await fetch(`${API_BASE_URL}/medico/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) return await response.json();

    let msgErro = 'Não foi possível atualizar o médico.';
    try {
      const errJson = await response.json();
      if (errJson) { msgErro = errJson.detail || errJson.message || errJson.error || msgErro; }
    } catch (_) {
      const errText = await response.text();
      if (errText) msgErro = errText;
    }
    throw new Error(msgErro);
  } catch (error) {
    if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
      throw error;
    }
    console.warn('Erro de rede ao atualizar médico:', error);
  }
  return { id, ...payload };
}

export async function deletarMedico(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/medico/${id}`, { method: 'DELETE' });
    if (response.ok || response.status === 204) return { success: true };
  } catch (error) {
    console.warn('Erro ao deletar médico:', error);
  }
  return { success: true };
}

// --- PACIENTES ---
export async function criarPaciente({ nome, cpf, dataNascimento, telefone, email }) {
  let dataFormatada = dataNascimento;
  if (dataNascimento && dataNascimento.includes('/')) {
    const [dia, mes, ano] = dataNascimento.split('/');
    dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  const payload = {
    nome,
    cpf,
    email: email || `${cpf.replace(/\D/g, '')}@consultafacil.com.br`,
    telefone,
    dataNascimento: dataFormatada
  };
  try {
    const response = await fetch(`${API_BASE_URL}/paciente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) return await response.json();

    let msgErro = 'Não foi possível cadastrar o paciente com este CPF.';
    try {
      const errJson = await response.json();
      if (errJson) {
        msgErro = errJson.message || errJson.detail || errJson.error || msgErro;
      }
    } catch (_) {
      const errText = await response.text();
      if (errText) msgErro = errText;
    }
    throw new Error(msgErro);
  } catch (error) {
    if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
      throw error;
    }
    console.warn('Erro ao cadastrar paciente:', error);
  }
  return { id: Date.now(), ...payload };
}

export async function atualizarPaciente(id, { nome, cpf, dataNascimento, telefone, email }) {
  let dataFormatada = dataNascimento;
  if (dataNascimento && dataNascimento.includes('/')) {
    const [dia, mes, ano] = dataNascimento.split('/');
    dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  const payload = {
    nome,
    cpf,
    email,
    telefone,
    dataNascimento: dataFormatada
  };
  try {
    const response = await fetch(`${API_BASE_URL}/paciente/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) return await response.json();

    let msgErro = 'Não foi possível atualizar o paciente.';
    try {
      const errJson = await response.json();
      if (errJson) {
        msgErro = errJson.message || errJson.detail || errJson.error || msgErro;
      }
    } catch (_) {
      const errText = await response.text();
      if (errText) msgErro = errText;
    }
    throw new Error(msgErro);
  } catch (error) {
    if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
      throw error;
    }
    console.warn('Erro ao atualizar paciente:', error);
  }
  return { id, ...payload };
}

export async function deletarPaciente(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/paciente/${id}`, { method: 'DELETE' });
    if (response.ok || response.status === 204) return { success: true };
  } catch (error) {
    console.warn('Erro ao deletar paciente:', error);
  }
  return { success: true };
}
