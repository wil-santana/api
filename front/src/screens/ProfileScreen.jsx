import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import { listarConsultasDoPaciente, cancelarConsulta } from '../services/api';

export default function ProfileScreen({ paciente, onReschedule, onNewAppointment, onLogout }) {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ open: false, consulta: null });
  const [canceling, setCanceling] = useState(false);

  // Controle de exibição do histórico oculto de consultas passadas
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Carrega consultas do paciente logado
  const carregarConsultas = async () => {
    setLoading(true);
    try {
      const lista = await listarConsultasDoPaciente(paciente?.id || 1);
      setConsultas(lista);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConsultas();
  }, [paciente]);

  // Abertura da confirmação segura de cancelamento
  const handleOpenCancel = (consulta) => {
    setCancelModal({ open: true, consulta });
  };

  // Execução do cancelamento no banco PostgreSQL via DELETE /consulta/{id}
  const handleConfirmCancel = async () => {
    if (!cancelModal.consulta) return;
    setCanceling(true);
    try {
      await cancelarConsulta(cancelModal.consulta.id);
      alert('✓ Consulta Cancelada com Sucesso!\nO horário foi liberado no banco para outros pacientes.');
      setCancelModal({ open: false, consulta: null });
      await carregarConsultas();
    } catch (err) {
      alert('Ocorreu um erro ao cancelar. Tente novamente.');
    } finally {
      setCanceling(false);
    }
  };

  const agora = new Date();

  // 1. Consultas Futuras e Ativas (com opções ativas de reagendamento e cancelamento)
  const consultasAtivasFuturas = consultas.filter((c) => {
    const isCancelada = String(c.status).toUpperCase() === 'CANCELADA';
    if (isCancelada) return false;
    if (!c.dataHorario) return true; // Se não tiver data, exibe na lista principal
    const dataObj = new Date(c.dataHorario);
    return dataObj >= agora;
  });

  // 2. Consultas Passadas (data anterior a hoje/agora) -> Ocultas no histórico, SEM opção de reagendar/cancelar
  const consultasPassadas = consultas.filter((c) => {
    if (!c.dataHorario) return false;
    const dataObj = new Date(c.dataHorario);
    return dataObj < agora;
  });

  // 3. Consultas canceladas futuras
  const consultasCanceladasFuturas = consultas.filter((c) => {
    const isCancelada = String(c.status).toUpperCase() === 'CANCELADA';
    if (!isCancelada) return false;
    if (!c.dataHorario) return true;
    const dataObj = new Date(c.dataHorario);
    return dataObj >= agora;
  });

  // Filtragem do histórico passado por período selecionado
  const consultasPassadasFiltradas = consultasPassadas.filter((c) => {
    if (!c.dataHorario) return false;
    const dataIso = c.dataHorario.substring(0, 10);
    if (dataInicio && dataIso < dataInicio) return false;
    if (dataFim && dataIso > dataFim) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '18px' }}>
      {/* Cabeçalho do Perfil com Boas-Vindas */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <div>
          <span
            style={{
              backgroundColor: '#E0F2FE',
              color: '#0369A1',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: 'calc(12px * var(--font-scale))',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}
          >
            Área do Paciente
          </span>
          <h2
            style={{
              fontSize: 'calc(22px * var(--font-scale))',
              fontWeight: '800',
              color: 'var(--text-main)',
              marginTop: '4px'
            }}
          >
            Olá, {paciente?.nome || 'Wilson'}!
          </h2>
          <p style={{ fontSize: 'calc(14px * var(--font-scale))', color: 'var(--text-muted)' }}>
            CPF: {paciente?.cpf || '000.000.000-00'}
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          style={{
            backgroundColor: '#F1F5F9',
            border: '1.5px solid var(--border-strong)',
            color: '#334155',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: 'calc(13px * var(--font-scale))',
            fontWeight: '700',
            cursor: 'pointer'
          }}
          aria-label="Sair da sua conta"
        >
          🚪 Sair
        </button>
      </div>

      {/* Botão de Destaque Primário: Agendar Nova Consulta */}
      <div>
        <Button
          variant="primary"
          onClick={onNewAppointment}
          ariaLabel="Marcar um novo agendamento de consulta médica"
        >
          ➕ AGENDAR NOVA CONSULTA
        </Button>
      </div>

      {/* Título da Seção de Agendamentos Futuros */}
      <div style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <h3
          style={{
            fontSize: 'calc(18px * var(--font-scale))',
            fontWeight: '800',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📅 Suas Próximas Consultas Agendadas
        </h3>
        <p style={{ fontSize: 'calc(13px * var(--font-scale))', color: 'var(--text-muted)' }}>
          Consultas futuras ativas. Toque em uma consulta para reagendar o horário ou cancelar.
        </p>
      </div>

      {/* Lista de Consultas Futuras */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          ⏳ Carregando suas consultas do banco...
        </div>
      ) : consultasAtivasFuturas.length === 0 ? (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '2px dashed var(--border-strong)',
            borderRadius: '14px',
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📋</span>
          <strong style={{ fontSize: 'calc(16px * var(--font-scale))', color: 'var(--text-main)', display: 'block' }}>
            Nenhuma consulta futura agendada no momento.
          </strong>
          <span style={{ fontSize: 'calc(14px * var(--font-scale))' }}>
            Toque no botão azul acima para marcar sua próxima consulta!
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {consultasAtivasFuturas.map((consulta) => {
            const dataObj = consulta.dataHorario ? new Date(consulta.dataHorario) : null;
            const dataFormatada = dataObj ? dataObj.toLocaleDateString('pt-BR') : '15/10/2026';
            const horaFormatada = consulta.dataHorario ? consulta.dataHorario.substring(11, 16) + 'h' : '13:30h';

            return (
              <div
                key={consulta.id}
                style={{
                  backgroundColor: 'var(--surface-white)',
                  border: '2px solid #BFDBFE',
                  borderLeft: '5px solid var(--primary)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(15, 82, 186, 0.08)'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        fontSize: 'calc(12px * var(--font-scale))',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      ✓ {consulta.status || 'AGENDADA'}
                    </span>
                    <span style={{ fontSize: 'calc(13px * var(--font-scale))', color: '#64748B', fontWeight: '600' }}>
                      Cód: #{consulta.id}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: 'calc(18px * var(--font-scale))',
                      fontWeight: '800',
                      color: 'var(--text-main)'
                    }}
                  >
                    {consulta.medico?.nome || 'Dr. Carlos Silva'}
                  </h4>
                  <div
                    style={{
                      fontSize: 'calc(14px * var(--font-scale))',
                      color: '#1E3A8A',
                      fontWeight: '700'
                    }}
                  >
                    {consulta.medico?.especialidade?.nome || 'Cardiologia'} • CRM {consulta.medico?.crm || '12345-PE'}
                  </div>
                  <div
                    style={{
                      fontSize: 'calc(15px * var(--font-scale))',
                      color: 'var(--text-main)',
                      marginTop: '6px',
                      backgroundColor: '#EFF6FF',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontWeight: '700'
                    }}
                  >
                    🗓️ <strong>{dataFormatada}</strong> às <strong>{horaFormatada}</strong>
                  </div>
                </div>

                {/* Botões de Ação para cada consulta futura */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <Button
                    variant="primary"
                    onClick={() => onReschedule(consulta)}
                    ariaLabel={`Reagendar consulta com ${consulta.medico?.nome}`}
                  >
                    🗓️ MUDAR DIA / REAGENDAR
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleOpenCancel(consulta)}
                    style={{
                      width: '100%',
                      minHeight: '48px',
                      backgroundColor: '#FEF2F2',
                      border: '1.5px solid #F87171',
                      borderRadius: 'var(--radius-md)',
                      color: '#991B1B',
                      fontSize: 'calc(15px * var(--font-scale))',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    ✕ Cancelar Consulta
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Histórico de Consultas Canceladas Futuras */}
      {consultasCanceladasFuturas.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h4
            style={{
              fontSize: 'calc(14px * var(--font-scale))',
              color: '#64748B',
              fontWeight: '700',
              marginBottom: '6px'
            }}
          >
            Consultas Canceladas ({consultasCanceladasFuturas.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {consultasCanceladasFuturas.map((c) => (
              <div
                key={c.id}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: 'calc(13px * var(--font-scale))',
                  color: '#64748B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{c.medico?.nome || 'Médico'}</span>
                <span style={{ color: '#DC2626', fontWeight: '700' }}>CANCELADA</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO: HISTÓRICO OCULTO DE CONSULTAS PASSADAS (COM CALENDÁRIO / PERÍODO) */}
      <div style={{ marginTop: '14px', borderTop: '2px solid var(--border-subtle)', paddingTop: '16px' }}>
        <button
          type="button"
          onClick={() => setHistoricoAberto((prev) => !prev)}
          style={{
            width: '100%',
            minHeight: '52px',
            backgroundColor: historicoAberto ? '#0284C7' : '#F1F5F9',
            color: historicoAberto ? '#FFFFFF' : '#0F172A',
            border: '2px solid #0284C7',
            borderRadius: '12px',
            fontSize: 'calc(15px * var(--font-scale))',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            boxShadow: historicoAberto ? '0 4px 14px rgba(2, 132, 199, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
          aria-expanded={historicoAberto}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            📜 {historicoAberto ? 'Ocultar Histórico de Consultas Passadas' : 'Ver Histórico de Consultas Passadas por Período'}
          </span>
          <span
            style={{
              backgroundColor: historicoAberto ? '#0369A1' : '#E2E8F0',
              color: historicoAberto ? '#FFFFFF' : '#334155',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: 'calc(13px * var(--font-scale))',
              fontWeight: '800'
            }}
          >
            {consultasPassadas.length} {consultasPassadas.length === 1 ? 'passada' : 'passadas'}
          </span>
        </button>

        {historicoAberto && (
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '2px solid #0284C7',
              borderTop: 'none',
              borderBottomLeftRadius: '14px',
              borderBottomRightRadius: '14px',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: 'calc(16px * var(--font-scale))',
                  fontWeight: '800',
                  color: 'var(--primary)',
                  margin: 0
                }}
              >
                🗓️ Selecione o Período no Calendário
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: 'calc(13px * var(--font-scale))', color: 'var(--text-muted)' }}>
                Filtre suas consultas anteriores definindo a data de início e de fim.
              </p>
            </div>

            {/* Calendário para Escolher o Período */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
                backgroundColor: '#FFFFFF',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-strong)'
              }}
            >
              <div>
                <label
                  htmlFor="hist-data-inicio"
                  style={{
                    display: 'block',
                    fontSize: 'calc(13px * var(--font-scale))',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                    marginBottom: '4px'
                  }}
                >
                  📅 Data Inicial:
                </label>
                <input
                  id="hist-data-inicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-strong)',
                    fontSize: 'calc(14px * var(--font-scale))',
                    fontWeight: '700',
                    color: '#0F172A',
                    backgroundColor: '#F8FAFC'
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="hist-data-fim"
                  style={{
                    display: 'block',
                    fontSize: 'calc(13px * var(--font-scale))',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                    marginBottom: '4px'
                  }}
                >
                  📅 Data Final:
                </label>
                <input
                  id="hist-data-fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-strong)',
                    fontSize: 'calc(14px * var(--font-scale))',
                    fontWeight: '700',
                    color: '#0F172A',
                    backgroundColor: '#F8FAFC'
                  }}
                />
              </div>
            </div>

            {/* Botão para Limpar Filtros de Data */}
            {(dataInicio || dataFim) && (
              <button
                type="button"
                onClick={() => {
                  setDataInicio('');
                  setDataFim('');
                }}
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#E2E8F0',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: 'calc(12px * var(--font-scale))',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ✕ Limpar Filtro de Período
              </button>
            )}

            {/* Lista das Consultas Passadas Filtradas */}
            {consultasPassadasFiltradas.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  border: '1.5px dashed var(--border-strong)'
                }}
              >
                <p style={{ margin: 0, fontSize: 'calc(14px * var(--font-scale))', fontWeight: '700' }}>
                  Nenhuma consulta passada encontrada neste período.
                </p>
                {(dataInicio || dataFim) && (
                  <small style={{ fontSize: 'calc(12px * var(--font-scale))' }}>
                    Tente selecionar um intervalo de datas maior.
                  </small>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {consultasPassadasFiltradas.map((c) => {
                  const dataObj = c.dataHorario ? new Date(c.dataHorario) : null;
                  const dataFormatada = dataObj ? dataObj.toLocaleDateString('pt-BR') : 'Data';
                  const horaFormatada = c.dataHorario ? c.dataHorario.substring(11, 16) + 'h' : '';
                  const foiCancelada = String(c.status).toUpperCase() === 'CANCELADA';

                  return (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderLeft: foiCancelada ? '5px solid #EF4444' : '5px solid #64748B',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            backgroundColor: foiCancelada ? '#FEE2E2' : '#E2E8F0',
                            color: foiCancelada ? '#991B1B' : '#334155',
                            fontSize: 'calc(12px * var(--font-scale))',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {foiCancelada ? '✕ CANCELADA' : '✓ CONSULTA REALIZADA'}
                        </span>
                        <span style={{ fontSize: 'calc(12px * var(--font-scale))', color: '#64748B', fontWeight: '600' }}>
                          Cód: #{c.id}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 'calc(16px * var(--font-scale))',
                          fontWeight: '800',
                          color: '#1E293B'
                        }}
                      >
                        {c.medico?.nome || 'Médico'}
                      </div>

                      <div style={{ fontSize: 'calc(13px * var(--font-scale))', color: '#475569', fontWeight: '600' }}>
                        {c.medico?.especialidade?.nome || 'Especialidade'} • CRM {c.medico?.crm || 'N/A'}
                      </div>

                      <div
                        style={{
                          fontSize: 'calc(14px * var(--font-scale))',
                          fontWeight: '700',
                          color: '#0F172A',
                          backgroundColor: '#F1F5F9',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          marginTop: '4px'
                        }}
                      >
                        🗓️ {dataFormatada} às {horaFormatada}
                      </div>

                      <div
                        style={{
                          fontSize: 'calc(12px * var(--font-scale))',
                          color: '#64748B',
                          fontStyle: 'italic',
                          marginTop: '2px'
                        }}
                      >
                        🔒 Consulta passada arquivada no histórico (sem opção de reagendamento ou cancelamento).
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refúgio telefônico de apoio */}
      <div
        style={{
          backgroundColor: '#FEF3C7',
          border: '1.5px solid #F59E0B',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          color: '#78350F',
          marginTop: '6px'
        }}
      >
        <span style={{ fontSize: '24px' }}>☎️</span>
        <div style={{ fontSize: 'calc(13px * var(--font-scale))' }}>
          Dúvidas sobre o agendamento? Ligue grátis: <strong>0800 700 8000</strong>
        </div>
      </div>

      {/* Modal Seguro de Confirmação de Cancelamento */}
      {cancelModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 120
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar cancelamento de consulta"
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px 20px',
              maxWidth: '380px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '42px', display: 'block', marginBottom: '8px' }}>⚠️</span>
              <h3
                style={{
                  fontSize: 'calc(20px * var(--font-scale))',
                  fontWeight: '800',
                  color: '#991B1B'
                }}
              >
                Deseja Cancelar a Consulta?
              </h3>
            </div>

            <p
              style={{
                fontSize: 'calc(15px * var(--font-scale))',
                color: 'var(--text-main)',
                lineHeight: 1.4,
                textAlign: 'center'
              }}
            >
              Você está cancelando a consulta com{' '}
              <strong>{cancelModal.consulta?.medico?.nome || 'o médico'}</strong>.
              <br />
              <span style={{ color: '#64748B', fontSize: 'calc(13px * var(--font-scale))' }}>
                O horário será liberado no banco para outros pacientes.
              </span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={canceling}
                style={{
                  minHeight: '52px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'calc(16px * var(--font-scale))',
                  fontWeight: '800',
                  cursor: canceling ? 'not-allowed' : 'pointer'
                }}
              >
                {canceling ? '⏳ Cancelando no Banco...' : 'SIM, CANCELAR CONSULTA'}
              </button>

              <button
                type="button"
                onClick={() => setCancelModal({ open: false, consulta: null })}
                style={{
                  minHeight: '50px',
                  backgroundColor: '#F1F5F9',
                  border: '1.5px solid var(--border-strong)',
                  borderRadius: '12px',
                  color: '#0F172A',
                  fontSize: 'calc(15px * var(--font-scale))',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Não, Manter Minha Consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
