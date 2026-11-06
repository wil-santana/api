import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import TimeChips from '../components/common/TimeChips';
import MiniCalendar from '../components/common/MiniCalendar';
import {
  listarMedicos,
  agendarNovaConsulta,
  obterHorariosOcupados,
  SLOTS_MANHA,
  SLOTS_TARDE,
  verificarBloqueioData
} from '../services/api';

export default function NewAppointmentModal({ isOpen, onClose, pacienteId, onAppointmentSuccess }) {
  const [medicos, setMedicos] = useState([]);
  const [selectedMedicoId, setSelectedMedicoId] = useState('');
  const [selectedDate, setSelectedDate] = useState('Quinta-feira, 15/10/2026');
  const [selectedTurno, setSelectedTurno] = useState('manha'); // 'manha' | 'tarde'
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calHint, setCalHint] = useState('Toque acima para abrir o calendário');
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carrega médicos cadastrados no backend
  useEffect(() => {
    if (!isOpen) return;
    listarMedicos().then((lista) => {
      setMedicos(lista);
      if (lista.length > 0 && !selectedMedicoId) {
        setSelectedMedicoId(String(lista[0].id));
      }
    });
  }, [isOpen]);

  // Extrai data ISO "YYYY-MM-DD"
  const match = selectedDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const dataIso = match ? `${match[3]}-${match[2]}-${match[1]}` : '2026-10-15';

  // Verifica se o proprietário bloqueou este dia (dias fixos ou exceções)
  const statusBloqueio = verificarBloqueioData(dataIso);

  // Atualiza horários ocupados do médico selecionado para a data escolhida
  useEffect(() => {
    if (!isOpen || !selectedMedicoId) return;

    obterHorariosOcupados(selectedMedicoId, dataIso).then((ocupados) => {
      setOccupiedTimes(ocupados);

      // Slots do turno atual
      const slotsAtuais = selectedTurno === 'manha' ? SLOTS_MANHA : SLOTS_TARDE;
      const horaSimples = selectedTime.substring(0, 5);

      // Se o horário selecionado estiver ocupado ou não pertencer ao turno, seleciona o primeiro disponível
      if (ocupados.includes(horaSimples) || !slotsAtuais.includes(horaSimples)) {
        const primeiroLivre = slotsAtuais.find((s) => !ocupados.includes(s));
        if (primeiroLivre) {
          setSelectedTime(primeiroLivre);
        }
      }
    });
  }, [selectedMedicoId, dataIso, selectedTurno, isOpen]);

  if (!isOpen) return null;

  const medicoSelecionado = medicos.find((m) => String(m.id) === String(selectedMedicoId));
  const timeSlots = selectedTurno === 'manha' ? SLOTS_MANHA : SLOTS_TARDE;

  const handlePickDate = (fullDate) => {
    setSelectedDate(fullDate);
    setCalHint(`✓ Data selecionada: ${fullDate.split(', ')[1]}. Toque acima se quiser trocar.`);
  };

  const handleConfirm = async () => {
    if (statusBloqueio.bloqueado) {
      alert(`⚠️ Não é possível agendar nesta data.\nMotivo: ${statusBloqueio.motivo}`);
      return;
    }

    if (statusBloqueio.meioPeriodo && selectedTurno === 'tarde') {
      alert('⚠️ Aos sábados a clínica funciona apenas no turno da manhã (até as 13:00).');
      return;
    }

    if (!selectedMedicoId) {
      alert('Por favor, selecione um médico.');
      return;
    }

    if (!selectedTime) {
      alert('Por favor, escolha um horário disponível.');
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
            Escolha o especialista, o dia e o turno desejado.
          </p>
        </div>

        {/* 1. Escolha do Médico */}
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
            1. Escolha o Médico / Especialidade *
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
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} — {m.especialidade?.nome || 'Especialista'} (CRM: {m.crm || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Escolha do Dia */}
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
            2. Escolha o Dia da Consulta *
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

        {/* 3. Escolha do Turno e Horário Livre */}
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
              3. Escolha o Turno e Horário Livre *
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
                  padding: '12px 8px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: 'calc(15px * var(--font-scale))',
                  cursor: 'pointer',
                  border: selectedTurno === 'manha' ? '2px solid var(--primary-dark)' : '1.5px solid var(--border-strong)',
                  backgroundColor: selectedTurno === 'manha' ? 'var(--primary)' : '#F8FAFC',
                  color: selectedTurno === 'manha' ? '#FFFFFF' : 'var(--text-main)',
                  boxShadow: selectedTurno === 'manha' ? '0 4px 10px rgba(15,82,186,0.3)' : 'none'
                }}
              >
                🌅 Manhã (07h às 12h)
              </button>

              <button
                type="button"
                onClick={() => setSelectedTurno('tarde')}
                disabled={statusBloqueio.meioPeriodo}
                title={statusBloqueio.meioPeriodo ? 'Fechado à tarde aos sábados' : undefined}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: 'calc(15px * var(--font-scale))',
                  cursor: statusBloqueio.meioPeriodo ? 'not-allowed' : 'pointer',
                  opacity: statusBloqueio.meioPeriodo ? 0.5 : 1,
                  border: selectedTurno === 'tarde' ? '2px solid var(--primary-dark)' : '1.5px solid var(--border-strong)',
                  backgroundColor: selectedTurno === 'tarde' ? 'var(--primary)' : '#F8FAFC',
                  color: selectedTurno === 'tarde' ? '#FFFFFF' : 'var(--text-main)',
                  boxShadow: selectedTurno === 'tarde' ? '0 4px 10px rgba(15,82,186,0.3)' : 'none'
                }}
              >
                🌇 Tarde (13:20 às 18h)
              </button>
            </div>

            {/* Renderização dos horários (os ocupados simplesmente NÃO aparecem) */}
            <TimeChips
              options={timeSlots}
              selected={selectedTime}
              onSelect={(time) => setSelectedTime(time)}
              occupiedTimes={occupiedTimes}
              filterOccupied={true}
            />
          </div>
        )}

        {/* Botões de Ação */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <Button
            variant="success"
            onClick={handleConfirm}
            disabled={loading || statusBloqueio.bloqueado}
          >
            {loading ? '⏳ Gravando no Banco...' : '✓ CONFIRMAR AGENDAMENTO'}
          </Button>
          <Button variant="neutral" onClick={onClose}>
            Cancelar e Voltar ao Perfil
          </Button>
        </div>
      </div>
    </div>
  );
}
