import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import TimeChips from '../components/common/TimeChips';
import MiniCalendar from '../components/common/MiniCalendar';
import {
  listarEspecialidades,
  listarMedicos,
  agendarNovaConsulta,
  obterHorariosOcupados,
  SLOTS_MANHA,
  SLOTS_TARDE,
  verificarBloqueioData
} from '../services/api';

const dayFullName = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function getInitialDateString() {
  const d = new Date();
  const diaSemana = dayFullName[d.getDay()];
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${diaSemana}, ${dia}/${mes}/${ano}`;
}

export default function NewAppointmentModal({ isOpen, onClose, pacienteId, onAppointmentSuccess }) {
  const [especialidades, setEspecialidades] = useState([]);
  const [selectedEspecialidadeId, setSelectedEspecialidadeId] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [selectedMedicoId, setSelectedMedicoId] = useState('');
  const [selectedDate, setSelectedDate] = useState(getInitialDateString);
  const [selectedTurno, setSelectedTurno] = useState('manha'); // 'manha' | 'tarde'
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calHint, setCalHint] = useState('Toque acima para abrir o calendário');
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carrega especialidades e médicos cadastrados no backend
  useEffect(() => {
    if (!isOpen) return;

    Promise.all([listarEspecialidades(), listarMedicos()]).then(([espList, medList]) => {
      const espArr = espList || [];
      const medArr = medList || [];
      setEspecialidades(espArr);
      setMedicos(medArr);

      let currentEspId = selectedEspecialidadeId;
      if (!currentEspId && espArr.length > 0) {
        currentEspId = String(espArr[0].id);
        setSelectedEspecialidadeId(currentEspId);
      }

      // Filtra médicos da especialidade selecionada
      const medicosDaEsp = medArr.filter(
        (m) =>
          String(m.especialidade?.id) === String(currentEspId) ||
          m.especialidade?.nome?.toLowerCase() ===
            espArr.find((e) => String(e.id) === String(currentEspId))?.nome?.toLowerCase()
      );

      if (medicosDaEsp.length > 0) {
        setSelectedMedicoId(String(medicosDaEsp[0].id));
      } else if (medArr.length > 0) {
        setSelectedMedicoId(String(medArr[0].id));
      }
    });
  }, [isOpen]);

  // Ao trocar a especialidade, atualiza o médico selecionado
  const handleEspecialidadeChange = (espId) => {
    setSelectedEspecialidadeId(espId);

    const medicosDaEsp = medicos.filter(
      (m) =>
        String(m.especialidade?.id) === String(espId) ||
        m.especialidade?.nome?.toLowerCase() ===
          especialidades.find((e) => String(e.id) === String(espId))?.nome?.toLowerCase()
    );

    if (medicosDaEsp.length > 0) {
      setSelectedMedicoId(String(medicosDaEsp[0].id));
    } else {
      setSelectedMedicoId('');
    }
  };

  // Médicos filtrados para exibição
  const medicosFiltrados = medicos.filter(
    (m) =>
      String(m.especialidade?.id) === String(selectedEspecialidadeId) ||
      m.especialidade?.nome?.toLowerCase() ===
        especialidades.find((e) => String(e.id) === String(selectedEspecialidadeId))?.nome?.toLowerCase()
  );

  // Extrai data ISO "YYYY-MM-DD" e valida se é data de hoje
  const match = selectedDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const now = new Date();
  const hojeIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dataIso = match ? `${match[3]}-${match[2]}-${match[1]}` : hojeIso;

  const isToday = dataIso === hojeIso;
  const currentHourMinutes = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Verifica bloqueio de clínicas (domingos, feriados, etc.)
  const statusBloqueio = verificarBloqueioData(dataIso);

  const timeSlots = selectedTurno === 'manha' ? SLOTS_MANHA : SLOTS_TARDE;

  // Horários passados no dia de hoje
  const pastTimes = isToday ? timeSlots.filter((slot) => slot <= currentHourMinutes) : [];

  // Atualiza horários ocupados do médico selecionado para a data escolhida
  useEffect(() => {
    if (!isOpen || !selectedMedicoId) return;

    obterHorariosOcupados(selectedMedicoId, dataIso).then((ocupados) => {
      setOccupiedTimes(ocupados);

      const slotsAtuais = selectedTurno === 'manha' ? SLOTS_MANHA : SLOTS_TARDE;
      const horaSimples = selectedTime.substring(0, 5);

      const isUnavailable = (s) => {
        if (ocupados.includes(s)) return true;
        if (isToday && s <= currentHourMinutes) return true;
        return false;
      };

      if (isUnavailable(horaSimples) || !slotsAtuais.includes(horaSimples)) {
        const primeiroLivre = slotsAtuais.find((s) => !isUnavailable(s));
        if (primeiroLivre) {
          setSelectedTime(primeiroLivre);
        } else {
          setSelectedTime('');
        }
      }
    });
  }, [selectedMedicoId, dataIso, selectedTurno, isOpen, isToday, currentHourMinutes]);

  if (!isOpen) return null;

  const medicoSelecionado = medicos.find((m) => String(m.id) === String(selectedMedicoId));

  const handlePickDate = (fullDate) => {
    setSelectedDate(fullDate);
    setCalHint(`✓ Data selecionada: ${fullDate.split(', ')[1]}. Toque acima se quiser trocar.`);
  };

  const handleConfirm = async () => {
    if (statusBloqueio.bloqueado) {
      alert(`⚠️ Não é possível agendar nesta data.\nMotivo: ${statusBloqueio.motivo}`);
      return;
    }

    if (dataIso < hojeIso) {
      alert('⚠️ Não é possível agendar em datas passadas. Por favor, escolha uma data futura.');
      return;
    }

    if (isToday && selectedTime <= currentHourMinutes) {
      alert('⚠️ Este horário já passou no dia de hoje. Por favor, escolha um horário futuro.');
      return;
    }

    if (statusBloqueio.meioPeriodo && selectedTurno === 'tarde') {
      alert('⚠️ Aos sábados a clínica funciona apenas no turno da manhã (até as 13:00).');
      return;
    }

    if (!selectedEspecialidadeId) {
      alert('Por favor, selecione uma especialidade.');
      return;
    }

    if (!selectedMedicoId) {
      alert('Por favor, selecione um médico disponível para a especialidade escolhida.');
      return;
    }

    if (!selectedTime) {
      alert('Por favor, escolha um horário livre disponível.');
      return;
    }

    setLoading(true);
    try {
      await agendarNovaConsulta({
        pacienteId: pacienteId || 1,
        medicoId: Number(selectedMedicoId),
        dataTexto: selectedDate,
        horarioTexto: selectedTime
      });

      alert(
        `✓ Consulta Agendada com Sucesso!\nSua consulta com ${medicoSelecionado?.nome || 'o médico'} foi marcada para ${selectedDate} às ${selectedTime}.\nRetornando ao seu perfil.`
      );
      if (onAppointmentSuccess) onAppointmentSuccess();
      onClose();
    } catch (err) {
      alert(`⚠️ ${err.message || 'Erro ao agendar consulta.'}\nPor favor, escolha outro horário livre.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 100
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Modal de Agendamento de Consulta"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--surface-white)',
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '22px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: 'calc(12px * var(--font-scale))',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}
          >
            Novo Agendamento
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela e voltar"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              border: '1.5px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '900',
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div>
          <h2
            style={{
              fontSize: 'calc(24px * var(--font-scale))',
              fontWeight: '800',
              color: 'var(--text-main)'
            }}
          >
            Marcar Nova Consulta
          </h2>
          <p
            style={{
              fontSize: 'calc(15px * var(--font-scale))',
              color: 'var(--text-muted)'
            }}
          >
            Escolha a especialidade, o médico, o dia e o turno desejado.
          </p>
        </div>

        {/* 1. Escolha da Especialidade */}
        <div>
          <label
            htmlFor="select-especialidade"
            style={{
              fontSize: 'calc(16px * var(--font-scale))',
              fontWeight: '800',
              color: 'var(--text-main)',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            1. Escolha a Especialidade *
          </label>
          <select
            id="select-especialidade"
            value={selectedEspecialidadeId}
            onChange={(e) => handleEspecialidadeChange(e.target.value)}
            style={{
              width: '100%',
              minHeight: '54px',
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: 'calc(16px * var(--font-scale))',
              fontWeight: '700',
              color: 'var(--text-main)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {especialidades.map((esp) => (
              <option key={esp.id} value={esp.id}>
                🩺 {esp.nome}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Escolha do Médico */}
        <div>
          <label
            htmlFor="select-medico"
            style={{
              fontSize: 'calc(16px * var(--font-scale))',
              fontWeight: '800',
              color: 'var(--text-main)',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            2. Escolha o Médico *
          </label>
          <select
            id="select-medico"
            value={selectedMedicoId}
            onChange={(e) => setSelectedMedicoId(e.target.value)}
            style={{
              width: '100%',
              minHeight: '54px',
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: 'calc(16px * var(--font-scale))',
              fontWeight: '700',
              color: 'var(--text-main)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {medicosFiltrados.length === 0 ? (
              <option value="">Nenhum médico disponível para esta especialidade</option>
            ) : (
              medicosFiltrados.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} (CRM: {m.crm || 'N/A'})
                </option>
              ))
            )}
          </select>
        </div>

        {/* 3. Escolha do Dia */}
        <div>
          <label
            htmlFor="agend-data"
            style={{
              fontSize: 'calc(16px * var(--font-scale))',
              fontWeight: '800',
              color: 'var(--text-main)',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            3. Escolha o Dia da Consulta *
          </label>
          <div
            style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setCalendarOpen((prev) => !prev)}
          >
            <input
              id="agend-data"
              type="text"
              value={selectedDate}
              readOnly
              style={{
                width: '100%',
                minHeight: '54px',
                backgroundColor: '#FFFFFF',
                border: statusBloqueio.bloqueado ? '2px solid #EF4444' : '2px solid #0284C7',
                borderRadius: '10px',
                padding: '12px 48px 12px 14px',
                fontSize: 'calc(17px * var(--font-scale))',
                fontWeight: '700',
                color: statusBloqueio.bloqueado ? '#DC2626' : 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none'
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: '14px',
                fontSize: '22px',
                pointerEvents: 'none'
              }}
            >
              📅
            </span>
          </div>

          {statusBloqueio.bloqueado ? (
            <div
              style={{
                marginTop: '6px',
                padding: '8px 12px',
                backgroundColor: '#FEE2E2',
                border: '1.5px solid #FCA5A5',
                borderRadius: '8px',
                color: '#991B1B',
                fontSize: 'calc(13px * var(--font-scale))',
                fontWeight: '700'
              }}
            >
              🚫 {statusBloqueio.motivo}
            </div>
          ) : (
            <span
              style={{
                display: 'block',
                marginTop: '6px',
                fontSize: 'calc(13px * var(--font-scale))',
                color: 'var(--text-muted)',
                fontWeight: '600'
              }}
            >
              {calHint}
            </span>
          )}

          <MiniCalendar
            isOpen={calendarOpen}
            onSelectDate={handlePickDate}
            onClose={() => setCalendarOpen(false)}
          />
        </div>

        {/* 4. Escolha do Turno e Horário Livre */}
        {!statusBloqueio.bloqueado && (
          <div>
            <label
              style={{
                fontSize: 'calc(16px * var(--font-scale))',
                fontWeight: '800',
                color: 'var(--text-main)',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              4. Escolha o Turno e Horário Livre *
            </label>

            {/* Alternância de Turno: Manhã e Tarde */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedTurno('manha')}
                style={{
                  flex: 1,
                  minHeight: '48px',
                  backgroundColor: selectedTurno === 'manha' ? '#0F52BA' : '#F1F5F9',
                  color: selectedTurno === 'manha' ? '#FFFFFF' : '#0F172A',
                  border: selectedTurno === 'manha' ? '2px solid #0A3A85' : '1.5px solid var(--border-strong)',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: 'calc(14px * var(--font-scale))',
                  cursor: 'pointer'
                }}
              >
                ☀️ Turno Manhã (07h às 12h)
              </button>

              <button
                type="button"
                onClick={() => setSelectedTurno('tarde')}
                disabled={statusBloqueio.meioPeriodo}
                title={statusBloqueio.meioPeriodo ? 'Aos sábados a clínica funciona apenas pela manhã' : undefined}
                style={{
                  flex: 1,
                  minHeight: '48px',
                  backgroundColor:
                    statusBloqueio.meioPeriodo
                      ? '#E2E8F0'
                      : selectedTurno === 'tarde'
                      ? '#0F52BA'
                      : '#F1F5F9',
                  color: statusBloqueio.meioPeriodo
                    ? '#94A3B8'
                    : selectedTurno === 'tarde'
                    ? '#FFFFFF'
                    : '#0F172A',
                  border:
                    statusBloqueio.meioPeriodo
                      ? '1.5px solid #CBD5E1'
                      : selectedTurno === 'tarde'
                      ? '2px solid #0A3A85'
                      : '1.5px solid var(--border-strong)',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: 'calc(14px * var(--font-scale))',
                  cursor: statusBloqueio.meioPeriodo ? 'not-allowed' : 'pointer',
                  opacity: statusBloqueio.meioPeriodo ? 0.6 : 1
                }}
              >
                ⛅ Turno Tarde (13h às 18h)
              </button>
            </div>

            <TimeChips
              options={timeSlots}
              selected={selectedTime}
              onSelect={setSelectedTime}
              occupiedTimes={occupiedTimes}
              pastTimes={pastTimes}
            />
          </div>
        )}

        {/* Resumo da Escolha */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: 'calc(14px * var(--font-scale))',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            📋 Resumo do Agendamento:
          </div>
          <div>
            <strong>Especialidade:</strong>{' '}
            {especialidades.find((e) => String(e.id) === String(selectedEspecialidadeId))?.nome || 'Não definida'}
          </div>
          <div>
            <strong>Médico:</strong> {medicoSelecionado?.nome || 'Não selecionado'} (
            {medicoSelecionado?.especialidade?.nome || 'Geral'})
          </div>
          <div>
            <strong>Data &amp; Horário:</strong> {selectedDate} às {selectedTime || '--:--'}
          </div>
        </div>

        {/* Botões de Ação na Zona do Polegar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={loading || statusBloqueio.bloqueado || !selectedTime || !selectedMedicoId}
          >
            {loading ? '⏳ Confirmando...' : '✓ CONFIRMAR AGENDAMENTO'}
          </Button>
          <Button variant="neutral" onClick={onClose}>
            Cancelar e Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
