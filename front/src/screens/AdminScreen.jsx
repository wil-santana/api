import React, { useState, useEffect } from 'react';
import {
  obterConfiguracoesClinica,
  salvarDiasFixos,
  adicionarExcecao,
  removerExcecao,
  listarTodasConsultasAdmin,
  listarTodosPacientes,
  listarMedicos,
  listarEspecialidades,
  criarEspecialidade,
  deletarEspecialidade,
  criarMedico,
  atualizarMedico,
  deletarMedico,
  criarPaciente,
  atualizarPaciente,
  deletarPaciente,
  cancelarConsulta
} from '../services/api';
import { maskCPF, maskPhone, maskDate } from '../utils/masks';

export default function AdminScreen({ onLogout }) {
  // Controle de Abas do Painel
  const [activeTab, setActiveTab] = useState('agenda'); // 'agenda' | 'medicos' | 'especialidades' | 'pacientes'

  // 1. Estados de Configurações de Agenda
  const [diasFixos, setDiasFixos] = useState({
    domingo: true,
    segunda: true,
    sabado: true,
    opcaoSabado: 'meio_periodo'
  });
  const [excecoes, setExcecoes] = useState([]);
  const [novaDataExcecao, setNovaDataExcecao] = useState('');
  const [novoTipoExcecao, setNovoTipoExcecao] = useState('fechado');
  const [novaDescricaoExcecao, setNovaDescricaoExcecao] = useState('');

  // 2. Estados de Consultas e Dados
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [buscaTermo, setBuscaTermo] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');

  // Controle do Histórico de Consultas Passadas
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [histDataInicio, setHistDataInicio] = useState('');
  const [histDataFim, setHistDataFim] = useState('');

  // 3. Modais
  const [pacienteFicha, setPacienteFicha] = useState(null); // visualização de ficha
  const [medicoModalOpen, setMedicoModalOpen] = useState(false);
  const [medicoEmEdicao, setMedicoEmEdicao] = useState(null);
  const [pacienteModalOpen, setPacienteModalOpen] = useState(false);
  const [pacienteEmEdicao, setPacienteEmEdicao] = useState(null);

  // Forms de Nova Especialidade
  const [nomeNovaEspecialidade, setNomeNovaEspecialidade] = useState('');

  // Formulário de Médico
  const [formMedico, setFormMedico] = useState({
    nome: '',
    crm: '',
    email: '',
    telefone: '',
    especialidadeId: ''
  });

  // Formulário de Paciente
  const [formPaciente, setFormPaciente] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    email: ''
  });

  // Carregar todos os dados ao montar
  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = () => {
    const config = obterConfiguracoesClinica();
    setDiasFixos(config.diasFixos);
    setExcecoes(config.excecoes);

    listarTodasConsultasAdmin().then(setConsultas);
    listarTodosPacientes().then(setPacientes);
    listarMedicos().then((meds) => {
      setMedicos(meds);
      if (meds.length > 0 && !formMedico.especialidadeId) {
        setFormMedico((prev) => ({ ...prev, especialidadeId: meds[0].especialidade?.id || '1' }));
      }
    });
    listarEspecialidades().then((esps) => {
      setEspecialidades(esps);
      if (esps.length > 0 && !formMedico.especialidadeId) {
        setFormMedico((prev) => ({ ...prev, especialidadeId: String(esps[0].id) }));
      }
    });
  };

  // Salvar Regras de Dias Fixos
  const handleSalvarDiasFixos = () => {
    salvarDiasFixos(diasFixos);
    alert('✓ Configurações de dias fixos salvas com sucesso!');
  };

  // Adicionar Nova Exceção / Feriado
  const handleAddExcecao = (e) => {
    e.preventDefault();
    if (!novaDataExcecao) {
      alert('Por favor, selecione uma data para a exceção.');
      return;
    }

    adicionarExcecao({
      data: novaDataExcecao,
      tipo: novoTipoExcecao,
      descricao: novaDescricaoExcecao || (novoTipoExcecao === 'fechado' ? 'Feriado / Recesso' : 'Atendimento Extra')
    });

    const config = obterConfiguracoesClinica();
    setExcecoes(config.excecoes);
    setNovaDataExcecao('');
    setNovaDescricaoExcecao('');
    alert('✓ Nova regra de feriado/exceção adicionada com sucesso!');
  };

  // Excluir Exceção
  const handleRemoverExcecao = (id) => {
    if (window.confirm('Deseja realmente remover esta regra?')) {
      removerExcecao(id);
      const config = obterConfiguracoesClinica();
      setExcecoes(config.excecoes);
    }
  };

  // Cancelar Consulta pela Administração
  const handleCancelarConsulta = async (consultaId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta? O horário será liberado no sistema.')) {
      await cancelarConsulta(consultaId);
      setConsultas((prev) =>
        prev.map((c) => (c.id === consultaId ? { ...c, status: 'CANCELADA' } : c))
      );
      alert('✓ Consulta cancelada com sucesso! O horário agora está liberado para outros agendamentos.');
    }
  };

  // Abrir Ficha Cadastral do Paciente ao clicar no nome
  const handleVerPaciente = (paciente) => {
    if (!paciente) return;
    const dadosCompletos = pacientes.find((p) => p.id === paciente.id || p.cpf === paciente.cpf) || paciente;
    setPacienteFicha(dadosCompletos);
  };

  // --- CRUD ESPECIALIDADES ---
  const handleCriarEspecialidade = async (e) => {
    e.preventDefault();
    if (!nomeNovaEspecialidade.trim()) return;
    const nova = await criarEspecialidade({ nome: nomeNovaEspecialidade.trim() });
    setEspecialidades((prev) => [...prev, nova]);
    setNomeNovaEspecialidade('');
    alert(`✓ Especialidade "${nova.nome}" cadastrada com sucesso!`);
  };

  const handleDeletarEspecialidade = async (id, nome) => {
    if (window.confirm(`Deseja realmente excluir a especialidade "${nome}"?`)) {
      await deletarEspecialidade(id);
      setEspecialidades((prev) => prev.filter((e) => e.id !== id));
      alert('✓ Especialidade excluída com sucesso!');
    }
  };

  // --- CRUD MÉDICOS ---
  const handleAbrirNovoMedico = () => {
    setMedicoEmEdicao(null);
    setFormMedico({
      nome: '',
      crm: '',
      email: '',
      telefone: '',
      especialidadeId: especialidades.length > 0 ? String(especialidades[0].id) : '1'
    });
    setMedicoModalOpen(true);
  };

  const handleAbrirEditarMedico = (medico) => {
    setMedicoEmEdicao(medico);
    setFormMedico({
      nome: medico.nome || '',
      crm: medico.crm || '',
      email: medico.email || '',
      telefone: medico.telefone || '',
      especialidadeId: medico.especialidade ? String(medico.especialidade.id) : (especialidades[0] ? String(especialidades[0].id) : '1')
    });
    setMedicoModalOpen(true);
  };

  const handleSalvarMedico = async (e) => {
    e.preventDefault();
    if (!formMedico.nome || !formMedico.crm) {
      alert('Preencha pelo menos Nome e CRM do médico.');
      return;
    }

    const espObj = especialidades.find((es) => String(es.id) === String(formMedico.especialidadeId));

    try {
      if (medicoEmEdicao) {
        const atualizado = await atualizarMedico(medicoEmEdicao.id, {
          ...formMedico,
          especialidadeId: formMedico.especialidadeId
        });
        setMedicos((prev) =>
          prev.map((m) =>
            m.id === medicoEmEdicao.id
              ? { ...m, ...atualizado, crm: formMedico.crm, especialidade: espObj || m.especialidade }
              : m
          )
        );
        listarMedicos().then(setMedicos);
        alert('✓ Médico atualizado com sucesso!');
      } else {
        const criado = await criarMedico({
          ...formMedico,
          especialidadeId: formMedico.especialidadeId
        });
        setMedicos((prev) => [...prev, { ...criado, especialidade: espObj }]);
        listarMedicos().then(setMedicos);
        alert('✓ Médico cadastrado com sucesso!');
      }
      setMedicoModalOpen(false);
    } catch (err) {
      alert(`⚠️ Não houve atualização do médico!\nMotivo: ${err.message || 'Erro de validação'}\n\nPor favor, digite o CRM correto para prosseguir.`);
      // O modal continua aberto para o usuário corrigir o CRM
    }
  };

  const handleDeletarMedico = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o médico ${nome}?`)) {
      await deletarMedico(id);
      setMedicos((prev) => prev.filter((m) => m.id !== id));
      alert('✓ Médico removido com sucesso!');
    }
  };

  // --- CRUD PACIENTES ---
  const handleAbrirNovoPaciente = () => {
    setPacienteEmEdicao(null);
    setFormPaciente({
      nome: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      email: ''
    });
    setPacienteModalOpen(true);
  };

  const handleAbrirEditarPaciente = (paciente) => {
    setPacienteEmEdicao(paciente);
    setFormPaciente({
      nome: paciente.nome || '',
      cpf: paciente.cpf || '',
      dataNascimento: paciente.dataNascimento
        ? (paciente.dataNascimento.includes('-')
            ? paciente.dataNascimento.split('-').reverse().join('/')
            : paciente.dataNascimento)
        : '',
      telefone: paciente.telefone || '',
      email: paciente.email || ''
    });
    setPacienteModalOpen(true);
  };

  const handleSalvarPaciente = async (e) => {
    e.preventDefault();
    if (!formPaciente.nome || !formPaciente.cpf) {
      alert('Preencha pelo menos o Nome e o CPF do paciente.');
      return;
    }

    try {
      if (pacienteEmEdicao) {
        const atualizado = await atualizarPaciente(pacienteEmEdicao.id, formPaciente);
        setPacientes((prev) =>
          prev.map((p) => (p.id === pacienteEmEdicao.id ? { ...p, ...atualizado } : p))
        );
        listarTodosPacientes().then(setPacientes);
        alert('✓ Paciente atualizado com sucesso!');
      } else {
        const criado = await criarPaciente(formPaciente);
        setPacientes((prev) => [...prev, criado]);
        listarTodosPacientes().then(setPacientes);
        alert('✓ Paciente cadastrado com sucesso!');
      }
      setPacienteModalOpen(false);
    } catch (err) {
      alert(`⚠️ Não foi possível salvar o paciente.\nMotivo: ${err.message || 'Erro de validação'}\n\nPor favor, verifique os dados informados.`);
    }
  };

  const handleDeletarPaciente = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cadastro de ${nome}?`)) {
      await deletarPaciente(id);
      setPacientes((prev) => prev.filter((p) => p.id !== id));
      alert('✓ Paciente removido com sucesso!');
    }
  };

  const agora = new Date();

  // Filtragem de Consultas Gerais
  const consultasFiltradas = consultas.filter((c) => {
    const matchStatus = filtroStatus === 'TODOS' || (c.status && c.status.toUpperCase() === filtroStatus);
    const termo = buscaTermo.toLowerCase();
    const matchTermo =
      !termo ||
      c.paciente?.nome?.toLowerCase().includes(termo) ||
      c.paciente?.cpf?.includes(termo) ||
      c.medico?.nome?.toLowerCase().includes(termo);
    return matchStatus && matchTermo;
  });

  // 1. Consultas Futuras / Próximas (exibidas na tabela principal da agenda)
  const consultasFuturas = consultasFiltradas.filter((c) => {
    if (!c.dataHorario) return true;
    const dataObj = new Date(c.dataHorario);
    return dataObj >= agora;
  });

  // 2. Consultas Passadas (arquivadas no histórico por período, SEM botão de cancelamento)
  const consultasPassadas = consultasFiltradas.filter((c) => {
    if (!c.dataHorario) return false;
    const dataObj = new Date(c.dataHorario);
    return dataObj < agora;
  });

  // Filtragem das consultas passadas por período selecionado no calendário
  const consultasPassadasFiltradas = consultasPassadas.filter((c) => {
    if (!c.dataHorario) return false;
    const dataIso = c.dataHorario.substring(0, 10);
    if (histDataInicio && dataIso < histDataInicio) return false;
    if (histDataFim && dataIso > histDataFim) return false;
    return true;
  });

  // Filtragem de Pacientes
  const pacientesFiltrados = pacientes.filter((p) => {
    const t = buscaPaciente.toLowerCase();
    return (
      !t ||
      p.nome?.toLowerCase().includes(t) ||
      p.cpf?.includes(t) ||
      p.telefone?.includes(t) ||
      p.email?.toLowerCase().includes(t)
    );
  });

  return (
    <div
      style={{
        backgroundColor: '#0F172A',
        minHeight: '100vh',
        color: '#F8FAFC',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Cabeçalho do Painel Administrativo */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1E293B',
            padding: '16px 24px',
            borderRadius: '16px',
            border: '1px solid #334155',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>⚙️</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                Painel de Controle da Clínica
              </h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
                Acesso do Proprietário • Gestão Geral e Cadastros
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            style={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🚪 Sair do Painel
          </button>
        </header>

        {/* Barra de Navegação por Abas */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {[
            { id: 'agenda', label: '📅 Agenda & Regras', count: consultasFuturas.length },
            { id: 'medicos', label: '🩺 Médicos', count: medicos.length },
            { id: 'especialidades', label: '🏷️ Especialidades', count: especialidades.length },
            { id: 'pacientes', label: '👥 Pacientes', count: pacientes.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  backgroundColor: isActive ? '#0284C7' : '#1E293B',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  border: isActive ? '1px solid #38BDF8' : '1px solid #334155',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 12px rgba(2,132,199,0.35)' : 'none'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? '#0369A1' : '#0F172A',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '900'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ABA 1: AGENDA E REGRAS */}
        {activeTab === 'agenda' && (
          <div>
            {/* Grid de Configurações (Cartão 1 e Cartão 2) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}
            >
              {/* Cartão 1: Dias Fixos Fechados */}
              <div
                style={{
                  backgroundColor: '#1E293B',
                  borderRadius: '16px',
                  padding: '22px',
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#38BDF8' }}>
                    📅 Dias Fixos Fechados
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                    Defina os dias da semana em que a clínica não abre.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      backgroundColor: '#0F172A',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={diasFixos.domingo}
                      onChange={(e) => setDiasFixos({ ...diasFixos, domingo: e.target.checked })}
                      style={{ width: '20px', height: '20px', accentColor: '#0284C7' }}
                    />
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>Domingo (Fechado)</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      backgroundColor: '#0F172A',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={diasFixos.segunda}
                      onChange={(e) => setDiasFixos({ ...diasFixos, segunda: e.target.checked })}
                      style={{ width: '20px', height: '20px', accentColor: '#0284C7' }}
                    />
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>Segunda-feira (Fechado)</span>
                  </label>

                  {/* Sábado com Regra Especial */}
                  <div
                    style={{
                      backgroundColor: '#0F172A',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={diasFixos.sabado}
                        onChange={(e) => setDiasFixos({ ...diasFixos, sabado: e.target.checked })}
                        style={{ width: '20px', height: '20px', accentColor: '#0284C7' }}
                      />
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>Sábado com Regra Especial</span>
                    </label>

                    {diasFixos.sabado && (
                      <select
                        value={diasFixos.opcaoSabado}
                        onChange={(e) => setDiasFixos({ ...diasFixos, opcaoSabado: e.target.value })}
                        style={{
                          backgroundColor: '#1E293B',
                          color: '#F8FAFC',
                          border: '1.5px solid #0284C7',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontSize: '14px',
                          fontWeight: '700',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="dia_todo">🔴 Fechado o dia todo</option>
                        <option value="meio_periodo">🟡 Aberto só até as 13:00 (Meio período)</option>
                      </select>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSalvarDiasFixos}
                  style={{
                    marginTop: 'auto',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Salvar Dias de Atendimento
                </button>
              </div>

              {/* Cartão 2: Feriados e Exceções */}
              <div
                style={{
                  backgroundColor: '#1E293B',
                  borderRadius: '16px',
                  padding: '22px',
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#FBBF24' }}>
                    ⚡ Feriados e Exceções
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                    Bloqueie feriados ou abra dias extras no calendário.
                  </p>
                </div>

                <form onSubmit={handleAddExcecao} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="date"
                      value={novaDataExcecao}
                      onChange={(e) => setNovaDataExcecao(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        backgroundColor: '#0F172A',
                        color: '#F8FAFC',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '14px',
                        fontWeight: '700',
                        outline: 'none'
                      }}
                    />

                    <select
                      value={novoTipoExcecao}
                      onChange={(e) => setNovoTipoExcecao(e.target.value)}
                      style={{
                        backgroundColor: '#0F172A',
                        color: '#F8FAFC',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '14px',
                        fontWeight: '700',
                        outline: 'none'
                      }}
                    >
                      <option value="fechado">🔴 Fechado (Feriado)</option>
                      <option value="aberto">🟢 Aberto (Extra)</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Motivo (Ex: Finados, Natal, Reforma)"
                    value={novaDescricaoExcecao}
                    onChange={(e) => setNovaDescricaoExcecao(e.target.value)}
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#F8FAFC',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />

                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontWeight: '800',
                      fontSize: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    + Adicionar Regra no Calendário
                  </button>
                </form>

                {/* Lista de Exceções Cadastradas */}
                <div
                  style={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    padding: '10px',
                    border: '1px solid #334155',
                    maxHeight: '160px',
                    overflowY: 'auto'
                  }}
                >
                  {excecoes.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748B', fontSize: '13px', padding: '10px' }}>
                      Nenhuma exceção cadastrada.
                    </div>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {excecoes.map((exc) => {
                        const dataFormatada = exc.data.includes('-')
                          ? exc.data.split('-').reverse().join('/')
                          : exc.data;
                        return (
                          <li
                            key={exc.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: '#1E293B',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '13px'
                            }}
                          >
                            <div>
                              <strong style={{ color: exc.tipo === 'fechado' ? '#F87171' : '#34D399' }}>
                                {exc.tipo === 'fechado' ? '🔴 Fechado' : '🟢 Aberto'}:
                              </strong>{' '}
                              <span>{dataFormatada}</span> — <small style={{ color: '#94A3B8' }}>{exc.descricao}</small>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoverExcecao(exc.id)}
                              title="Excluir regra"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                fontSize: '16px'
                              }}
                            >
                              ✕
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Cartão 3: Tabela de Gestão de Agendamentos */}
            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid #334155',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderBottom: '1px solid #334155',
                  paddingBottom: '16px',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
                    📋 Gestão de Agendamentos Futuros
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                    Próximas consultas ativas. Toque no nome do paciente para abrir sua ficha cadastral.
                  </p>
                </div>

                {/* Filtros e Busca */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="🔍 Buscar paciente ou médico..."
                    value={buscaTermo}
                    onChange={(e) => setBuscaTermo(e.target.value)}
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />

                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="TODOS">Todos os Status</option>
                    <option value="AGENDADA">Agendada</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>

                  <button
                    type="button"
                    onClick={carregarTudo}
                    title="Atualizar lista"
                    style={{
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Atualizar
                  </button>
                </div>
              </div>

              {/* Tabela de Agendamentos */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155', color: '#94A3B8', fontSize: '13px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 8px' }}>Paciente (Ficha)</th>
                      <th style={{ padding: '12px 8px' }}>Médico / Especialidade</th>
                      <th style={{ padding: '12px 8px' }}>Data / Horário</th>
                      <th style={{ padding: '12px 8px' }}>Status</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultasFuturas.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                          Nenhum agendamento futuro encontrado com os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      consultasFuturas.map((c) => {
                        const statusUpper = (c.status || '').toUpperCase();
                        const isAgendada = statusUpper === 'AGENDADA';
                        const isCancelada = statusUpper === 'CANCELADA';

                        const dataFormatada = c.dataHorario
                          ? new Date(c.dataHorario).toLocaleDateString('pt-BR')
                          : 'Data N/D';
                        const horaFormatada = c.dataHorario
                          ? c.dataHorario.substring(11, 16)
                          : 'Horário N/D';

                        return (
                          <tr
                            key={c.id}
                            style={{
                              borderBottom: '1px solid #334155',
                              transition: 'background-color 0.15s'
                            }}
                          >
                            <td style={{ padding: '12px 8px' }}>
                              <button
                                type="button"
                                onClick={() => handleVerPaciente(c.paciente)}
                                title="Clique para ver os dados cadastrais deste paciente"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#38BDF8',
                                  fontWeight: '800',
                                  fontSize: '15px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  textDecoration: 'underline'
                                }}
                              >
                                <span>{c.paciente?.nome || 'Paciente Sem Nome'}</span>
                                <span style={{ fontSize: '14px', textDecoration: 'none' }}>👤</span>
                              </button>
                              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                                Tel: {c.paciente?.telefone || '(81) 99999-9999'}
                              </div>
                            </td>

                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ fontWeight: '700', color: '#F8FAFC' }}>
                                {c.medico?.nome || 'Médico Geral'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                                {c.medico?.especialidade?.nome || 'Especialista'} (CRM: {c.medico?.crm || 'N/A'})
                              </div>
                            </td>

                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ fontSize: '13px', color: '#CBD5E1' }}>{dataFormatada}</div>
                              <div style={{ fontSize: '16px', fontWeight: '800', color: '#38BDF8' }}>
                                ⏰ {horaFormatada}
                              </div>
                            </td>

                            <td style={{ padding: '12px 8px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  backgroundColor: isAgendada
                                    ? '#065F46'
                                    : isCancelada
                                    ? '#991B1B'
                                    : '#374151',
                                  color: isAgendada
                                    ? '#6EE7B7'
                                    : isCancelada
                                    ? '#FCA5A5'
                                    : '#D1D5DB'
                                }}
                              >
                                {statusUpper}
                              </span>
                            </td>

                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              {isAgendada ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelarConsulta(c.id)}
                                  style={{
                                    backgroundColor: '#7F1D1D',
                                    color: '#FECACA',
                                    border: '1px solid #DC2626',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancelar
                                </button>
                              ) : (
                                <span style={{ color: '#64748B' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEÇÃO: HISTÓRICO OCULTO DE AGENDAMENTOS PASSADOS (COM CALENDÁRIO / PERÍODO) */}
            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: '16px',
                border: '1px solid #334155',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                marginBottom: '24px',
                overflow: 'hidden'
              }}
            >
              <button
                type="button"
                onClick={() => setHistoricoAberto((prev) => !prev)}
                style={{
                  width: '100%',
                  backgroundColor: historicoAberto ? '#0369A1' : '#1E293B',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '18px 22px',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  borderBottom: historicoAberto ? '1px solid #38BDF8' : 'none'
                }}
                aria-expanded={historicoAberto}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>📜</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                      {historicoAberto
                        ? '▲ Ocultar Histórico de Agendamentos Passados'
                        : '📜 Ver Histórico de Agendamentos Passados por Período'}
                    </div>
                    <div style={{ fontSize: '12px', color: historicoAberto ? '#E0F2FE' : '#94A3B8', fontWeight: '500' }}>
                      Consultas anteriores arquivadas no sistema (sem opção de cancelamento)
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: historicoAberto ? '#0284C7' : '#0F172A',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '900',
                    border: '1px solid #334155'
                  }}
                >
                  {consultasPassadas.length} {consultasPassadas.length === 1 ? 'passada' : 'passadas'}
                </span>
              </button>

              {historicoAberto && (
                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Filtros de Período (Calendário) */}
                  <div
                    style={{
                      backgroundColor: '#0F172A',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#38BDF8' }}>
                        📅 Selecione o Período no Calendário
                      </h4>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                        Filtre o histórico de consultas passadas definindo a data de início e de fim.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label
                          htmlFor="hist-admin-inicio"
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#CBD5E1',
                            marginBottom: '4px'
                          }}
                        >
                          📅 Data Inicial:
                        </label>
                        <input
                          id="hist-admin-inicio"
                          type="date"
                          value={histDataInicio}
                          onChange={(e) => setHistDataInicio(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#1E293B',
                            color: '#F8FAFC',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            padding: '9px 12px',
                            fontSize: '14px',
                            fontWeight: '700',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label
                          htmlFor="hist-admin-fim"
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#CBD5E1',
                            marginBottom: '4px'
                          }}
                        >
                          📅 Data Final:
                        </label>
                        <input
                          id="hist-admin-fim"
                          type="date"
                          value={histDataFim}
                          onChange={(e) => setHistDataFim(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: '#1E293B',
                            color: '#F8FAFC',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            padding: '9px 12px',
                            fontSize: '14px',
                            fontWeight: '700',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {(histDataInicio || histDataFim) && (
                        <button
                          type="button"
                          onClick={() => {
                            setHistDataInicio('');
                            setHistDataFim('');
                          }}
                          style={{
                            backgroundColor: '#334155',
                            color: '#F8FAFC',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            height: '40px'
                          }}
                        >
                          ✕ Limpar Período
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tabela do Histórico */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #334155', color: '#94A3B8', fontSize: '13px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 8px' }}>Paciente (Ficha)</th>
                          <th style={{ padding: '12px 8px' }}>Médico / Especialidade</th>
                          <th style={{ padding: '12px 8px' }}>Data / Horário</th>
                          <th style={{ padding: '12px 8px' }}>Status</th>
                          <th style={{ padding: '12px 8px', textAlign: 'center' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consultasPassadasFiltradas.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                              Nenhum agendamento passado encontrado no período selecionado.
                            </td>
                          </tr>
                        ) : (
                          consultasPassadasFiltradas.map((c) => {
                            const statusUpper = (c.status || '').toUpperCase();
                            const isCancelada = statusUpper === 'CANCELADA';

                            const dataFormatada = c.dataHorario
                              ? new Date(c.dataHorario).toLocaleDateString('pt-BR')
                              : 'Data N/D';
                            const horaFormatada = c.dataHorario
                              ? c.dataHorario.substring(11, 16)
                              : 'Horário N/D';

                            return (
                              <tr
                                key={c.id}
                                style={{
                                  borderBottom: '1px solid #334155',
                                  opacity: 0.95
                                }}
                              >
                                <td style={{ padding: '12px 8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleVerPaciente(c.paciente)}
                                    title="Clique para ver os dados cadastrais deste paciente"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#38BDF8',
                                      fontWeight: '800',
                                      fontSize: '15px',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    <span>{c.paciente?.nome || 'Paciente Sem Nome'}</span>
                                    <span style={{ fontSize: '14px', textDecoration: 'none' }}>👤</span>
                                  </button>
                                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                                    Tel: {c.paciente?.telefone || '(81) 99999-9999'}
                                  </div>
                                </td>

                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: '700', color: '#F8FAFC' }}>
                                    {c.medico?.nome || 'Médico Geral'}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                                    {c.medico?.especialidade?.nome || 'Especialista'} (CRM: {c.medico?.crm || 'N/A'})
                                  </div>
                                </td>

                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontSize: '13px', color: '#CBD5E1' }}>{dataFormatada}</div>
                                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#94A3B8' }}>
                                    🕒 {horaFormatada}
                                  </div>
                                </td>

                                <td style={{ padding: '12px 8px' }}>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '800',
                                      backgroundColor: isCancelada ? '#991B1B' : '#334155',
                                      color: isCancelada ? '#FCA5A5' : '#CBD5E1'
                                    }}
                                  >
                                    {isCancelada ? '✕ CANCELADA' : '✓ CONCLUÍDA / REALIZADA'}
                                  </span>
                                </td>

                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                  <span
                                    title="Consulta passada arquivada no histórico (sem opção de cancelamento)"
                                    style={{
                                      color: '#64748B',
                                      fontSize: '12px',
                                      fontStyle: 'italic',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    🔒 Arquivada
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 2: GESTÃO DE MÉDICOS */}
        {activeTab === 'medicos' && (
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #334155',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: '1px solid #334155',
                paddingBottom: '16px',
                marginBottom: '16px'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
                  🩺 Gestão do Corpo Clínico (Médicos)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                  Cadastre, edite e remova médicos e vincule suas especialidades.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAbrirNovoMedico}
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                + Novo Médico
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#94A3B8', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 8px' }}>Nome do Médico</th>
                    <th style={{ padding: '12px 8px' }}>CRM</th>
                    <th style={{ padding: '12px 8px' }}>Especialidade</th>
                    <th style={{ padding: '12px 8px' }}>Contato</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {medicos.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                        Nenhum médico cadastrado ainda.
                      </td>
                    </tr>
                  ) : (
                    medicos.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '800', color: '#FFFFFF', fontSize: '15px' }}>
                          👨‍⚕️ {m.nome}
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: '700', color: '#38BDF8' }}>
                          {m.crm || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#CBD5E1' }}>
                          <span
                            style={{
                              backgroundColor: '#0F172A',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid #334155',
                              fontWeight: '700',
                              fontSize: '13px'
                            }}
                          >
                            {m.especialidade?.nome || 'Geral'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '13px', color: '#94A3B8' }}>
                          <div>{m.telefone || 'Sem tel'}</div>
                          <div>{m.email || 'Sem email'}</div>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleAbrirEditarMedico(m)}
                              style={{
                                backgroundColor: '#0284C7',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletarMedico(m.id, m.nome)}
                              style={{
                                backgroundColor: '#7F1D1D',
                                color: '#FECACA',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: GESTÃO DE ESPECIALIDADES */}
        {activeTab === 'especialidades' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}
          >
            {/* Formulário de Cadastro de Especialidade */}
            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid #334155'
              }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800', color: '#38BDF8' }}>
                🏷️ Cadastrar Especialidade
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94A3B8' }}>
                Insira especialidades atendidas pela clínica (ex: Cardiologia, Pediatria).
              </p>

              <form onSubmit={handleCriarEspecialidade} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Nome da Especialidade (ex: Ortopedia)"
                  value={nomeNovaEspecialidade}
                  onChange={(e) => setNomeNovaEspecialidade(e.target.value)}
                  required
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                />

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  + Salvar Especialidade
                </button>
              </form>
            </div>

            {/* Listagem de Especialidades */}
            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid #334155'
              }}
            >
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>
                Especialidades Ativas ({especialidades.length})
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {especialidades.map((esp) => (
                  <li
                    key={esp.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#0F172A',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #334155'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '15px', color: '#FFFFFF' }}>{esp.nome}</strong>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>Código ID: #{esp.id}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletarEspecialidade(esp.id, esp.nome)}
                      title="Excluir especialidade"
                      style={{
                        backgroundColor: '#7F1D1D',
                        color: '#FECACA',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ABA 4: GESTÃO DE PACIENTES */}
        {activeTab === 'pacientes' && (
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '16px',
              padding: '22px',
              border: '1px solid #334155',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: '1px solid #334155',
                paddingBottom: '16px',
                marginBottom: '16px'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
                  👥 Gestão de Pacientes Cadastrados
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                  Visualize, cadastre e edite as informações cadastrais dos pacientes.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar por Nome, CPF ou Telefone..."
                  value={buscaPaciente}
                  onChange={(e) => setBuscaPaciente(e.target.value)}
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    outline: 'none',
                    minWidth: '240px'
                  }}
                />

                <button
                  type="button"
                  onClick={handleAbrirNovoPaciente}
                  style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  + Novo Paciente
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155', color: '#94A3B8', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 8px' }}>Nome Completo</th>
                    <th style={{ padding: '12px 8px' }}>CPF</th>
                    <th style={{ padding: '12px 8px' }}>Telefone / WhatsApp</th>
                    <th style={{ padding: '12px 8px' }}>E-mail</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                        Nenhum paciente encontrado.
                      </td>
                    </tr>
                  ) : (
                    pacientesFiltrados.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <button
                            type="button"
                            onClick={() => handleVerPaciente(p)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#38BDF8',
                              fontWeight: '800',
                              fontSize: '15px',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            👤 {p.nome}
                          </button>
                          <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                            Nascimento: {p.dataNascimento ? p.dataNascimento.split('-').reverse().join('/') : 'N/D'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: '700' }}>{p.cpf || 'N/A'}</td>
                        <td style={{ padding: '12px 8px', color: '#34D399', fontWeight: '700' }}>
                          {p.telefone || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '13px', color: '#CBD5E1' }}>
                          {p.email || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleAbrirEditarPaciente(p)}
                              style={{
                                backgroundColor: '#0284C7',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletarPaciente(p.id, p.nome)}
                              style={{
                                backgroundColor: '#7F1D1D',
                                color: '#FECACA',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: FORMULÁRIO DE MÉDICO (CRIAR / EDITAR) */}
      {medicoModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 200
          }}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              border: '2px solid #0284C7',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#38BDF8' }}>
                {medicoEmEdicao ? '✏️ Editar Médico' : '👨‍⚕️ Cadastrar Novo Médico'}
              </h3>
              <button
                type="button"
                onClick={() => setMedicoModalOpen(false)}
                style={{ background: '#334155', color: '#FFF', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarMedico} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Roberto Guimarães"
                  value={formMedico.nome}
                  onChange={(e) => setFormMedico({ ...formMedico, nome: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>CRM / Registro Profissional *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 54321-PE"
                  value={formMedico.crm}
                  onChange={(e) => setFormMedico({ ...formMedico, crm: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>Especialidade Médica *</label>
                <select
                  value={formMedico.especialidadeId}
                  onChange={(e) => setFormMedico({ ...formMedico, especialidadeId: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                >
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={esp.id}>
                      {esp.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>Telefone</label>
                  <input
                    type="text"
                    placeholder="(81) 98888-0000"
                    value={formMedico.telefone}
                    onChange={(e) => setFormMedico({ ...formMedico, telefone: maskPhone(e.target.value) })}
                    style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>E-mail</label>
                  <input
                    type="email"
                    placeholder="medico@clinica.com"
                    value={formMedico.email}
                    onChange={(e) => setFormMedico({ ...formMedico, email: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  {medicoEmEdicao ? 'Salvar Alterações' : 'Cadastrar Médico'}
                </button>
                <button
                  type="button"
                  onClick={() => setMedicoModalOpen(false)}
                  style={{ backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px 18px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORMULÁRIO DE PACIENTE (CRIAR / EDITAR) */}
      {pacienteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 200
          }}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              border: '2px solid #0284C7',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#38BDF8' }}>
                {pacienteEmEdicao ? '✏️ Editar Paciente' : '👤 Novo Paciente'}
              </h3>
              <button
                type="button"
                onClick={() => setPacienteModalOpen(false)}
                style={{ background: '#334155', color: '#FFF', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarPaciente} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Carlos de Oliveira"
                  value={formPaciente.nome}
                  onChange={(e) => setFormPaciente({ ...formPaciente, nome: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={formPaciente.cpf}
                    onChange={(e) => setFormPaciente({ ...formPaciente, cpf: maskCPF(e.target.value) })}
                    style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>Nascimento (DD/MM/AAAA)</label>
                  <input
                    type="text"
                    placeholder="15/08/1955"
                    value={formPaciente.dataNascimento}
                    onChange={(e) => setFormPaciente({ ...formPaciente, dataNascimento: maskDate(e.target.value) })}
                    style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(81) 99999-9999"
                  value={formPaciente.telefone}
                  onChange={(e) => setFormPaciente({ ...formPaciente, telefone: maskPhone(e.target.value) })}
                  style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8' }}>E-mail</label>
                <input
                  type="email"
                  placeholder="paciente@email.com"
                  value={formPaciente.email}
                  onChange={(e) => setFormPaciente({ ...formPaciente, email: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0F172A', color: '#FFF', border: '1px solid #334155', borderRadius: '8px', padding: '10px', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  {pacienteEmEdicao ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                </button>
                <button
                  type="button"
                  onClick={() => setPacienteModalOpen(false)}
                  style={{ backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '10px', padding: '12px 18px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FICHA CADASTRAL DO PACIENTE (AO CLICAR NO NOME) */}
      {pacienteFicha && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 200
          }}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              border: '2px solid #0284C7',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              color: '#FFFFFF',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>👤</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#38BDF8' }}>
                  Ficha Cadastral do Paciente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPacienteFicha(null)}
                style={{
                  backgroundColor: '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700' }}>NOME COMPLETO:</div>
                <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF' }}>
                  {pacienteFicha.nome || 'Não informado'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700' }}>CPF:</div>
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>
                    {pacienteFicha.cpf || 'Não informado'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700' }}>NASCIMENTO:</div>
                  <div style={{ fontSize: '15px', fontWeight: '700' }}>
                    {pacienteFicha.dataNascimento
                      ? (pacienteFicha.dataNascimento.includes('-')
                          ? pacienteFicha.dataNascimento.split('-').reverse().join('/')
                          : pacienteFicha.dataNascimento)
                      : 'Não informado'}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700' }}>TELEFONE / WHATSAPP:</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#34D399' }}>
                  {pacienteFicha.telefone || 'Não informado'}
                </div>
              </div>

              <div style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700' }}>E-MAIL:</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#CBD5E1' }}>
                  {pacienteFicha.email || 'Não informado'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const pac = pacienteFicha;
                    setPacienteFicha(null);
                    handleAbrirEditarPaciente(pac);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Editar Cadastro
                </button>
                <button
                  type="button"
                  onClick={() => setPacienteFicha(null)}
                  style={{
                    backgroundColor: '#334155',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
