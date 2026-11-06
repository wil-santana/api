import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import TimeChips from '../components/common/TimeChips';
import MiniCalendar from '../components/common/MiniCalendar';
import {
  rescheduleAppointment,
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

export default function RescheduleModal({ isOpen, onClose, appointment, onRescheduleSuccess }) {
  const [selectedDate, setSelectedDate] = useState(getInitialDateString);
  const [selectedTurno, setSelectedTurno] = useState('manha');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calHint, setCalHint] = useState('Toque acima para abrir o calendário');
  const [loading, setLoading] = useState(false);
  const [occupiedTimes, setOccupiedTimes] = useState([]);

  // Médico e dados da consulta sendo alterada
  const medicoId = appointment?.medico?.id || 1;
  const medicoNome = appointment?.medico?.nome || 'Dr. Carlos Silva';
  const especialidade = appointment?.medico?.especialidade?.nome || 'Cardiologista';
  const crm = appointment?.medico?.crm || '12345-PE';

  // Formata data e hora atual da consulta
  const dataAtualFormatada = appointment?.dataHorario
    ? new Date(appointment.dataHorario).toLocaleDateString('pt-BR')
    : 'Data a definir';
  const horaAtualFormatada = appointment?.dataHorario
    ? appointment.dataHorario.substring(11, 16) + 'h'
    : '--:--h';

  // Extrai data ISO "YYYY-MM-DD"
  const match = selectedDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const now = new Date();
  const hojeIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dataIso = match ? `${match[3]}-${match[2]}-${match[1]}` : hojeIso;

  const isToday = dataIso === hojeIso;
  const currentHourMinutes = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Verifica bloqueio de data pelo proprietário
  const statusBloqueio = verificarBloqueioData(dataIso);

  const timeSlots = selectedTurno === 'manha' ? SLOTS_MANHA : SLOTS_TARDE;
  const pastTimes = isToday ? timeSlots.filter((slot) => slot <= currentHourMinutes) : [];

  // Ao trocar a data/turno, busca no banco quais horários já estão ocupados
  useEffect(() => {
    if (!isOpen) return;

    obterHorariosOcupados(medicoId, dataIso).then((ocupados) => {
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
        if (primeiroLivre) setSelectedTime(primeiroLivre);
      }
    });
  }, [selectedDate, selectedTurno, isOpen, medicoId, dataIso, isToday, currentHourMinutes]);

  if (!isOpen) return null;

  const handlePickDate = (fullDate) => {
    setSelectedDate(fullDate);
    setCalHint(`✓ Data selecionada: ${fullDate.split(', ')[1]}. Toque acima se quiser trocar.`);
  };

  const handleConfirm = async () => {
    if (statusBloqueio.bloqueado) {
      alert(`⚠️ Não é possível reagendar nesta data.\nMotivo: ${statusBloqueio.motivo}`);
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

    if (!selectedTime) {
      alert('Por favor, escolha um horário disponível.');
      return;
    }

    setLoading(true);
    try {
      await rescheduleAppointment(appointment?.id || 1, selectedDate, selectedTime);
      alert(
        `✓ Consulta Reagendada com Sucesso!\nSua consulta com ${medicoNome} foi confirmada para ${selectedDate} às ${selectedTime}.\nO horário antigo foi liberado no banco para outros pacientes.`
      );
      if (onRescheduleSuccess) onRescheduleSuccess();
      onClose();
    } catch (err) {
      alert(`⚠️ ${err.message || 'Não foi possível reagendar para este horário.'}\nPor favor, escolha outro horário disponível.`);
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
      aria-label="Modal de Reagendamento de Consulta"
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
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: 'calc(12px * var(--font-scale))',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}
          >
            Reagendamento Guiado
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela e manter consulta como está"
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
            Trocar Dia ou Horário
          </h2>
          <p
            style={{
              fontSize: 'calc(15px * var(--font-scale))',
              color: 'var(--text-muted)'
            }}
          >
            Selecione uma nova data para sua consulta.
          </p>
        </div>

        {/* Card Contextual Fixo da Consulta Atual */}
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '2px solid #BFDBFE',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <span
            style={{
              fontSize: 'calc(12px * var(--font-scale))',
              fontWeight: '800',
              color: '#1D4ED8',
              textTransform: 'uppercase'
            }}
          >
            📅 Consulta que você quer mudar:
          </span>
          <div
            style={{
              fontSize: 'calc(18px * var(--font-scale))',
              fontWeight: '800',
              color: '#0F172A'
            }}
          >
            {medicoNome}
          </div>
          <div
            style={{
              fontSize: 'calc(15px * var(--font-scale))',
              color: '#1E3A8A',
              fontWeight: '700'
            }}
          >
            {especialidade} • CRM {crm}
          </div>
          <div
            style={{
              fontSize: 'calc(14px * var(--font-scale))',
              color: '#334155',
              marginTop: '2px'
            }}
          >
            Horário agendado: <strong>{dataAtualFormatada} às {horaAtualFormatada}</strong>
            <br />
            Local: Consultório 402 - Unidade Central
          </div>
        </div>

        {/* 1. Escolha da Nova Data */}
        <div>
          <label
            htmlFor="reagend-data"
            style={{
              fontSize: 'calc(16px * var(--font-scale))',
              fontWeight: '800',
              color: 'var(--text-main)',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            1. Escolha a Nova Data *
          </label>
          <div
            style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setCalendarOpen((prev) => !prev)}
          >
            <input
              id="reagend-data"
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

        {/* Chips de Horários com Turnos */}
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
              2. Escolha o Turno e Horário Livre *
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

            <TimeChips
              options={timeSlots}
              selected={selectedTime}
              onSelect={(time) => setSelectedTime(time)}
              occupiedTimes={occupiedTimes}
              pastTimes={pastTimes}
            />
          </div>
        )}

        {/* Ações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <Button
            variant="success"
            onClick={handleConfirm}
            disabled={loading || statusBloqueio.bloqueado}
          >
            {loading ? '⏳ Gravando no Banco...' : '✓ CONFIRMAR NOVO HORÁRIO'}
          </Button>
          <Button variant="neutral" onClick={onClose}>
            Não mudar nada (Manter consulta atual)
          </Button>
        </div>
      </div>
    </div>
  );
}
