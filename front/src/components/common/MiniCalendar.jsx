import React, { useState } from 'react';
import { verificarBloqueioData } from '../../services/api';

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const dayFullName = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function MiniCalendar({ isOpen, onSelectDate, onClose }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mês e ano exibidos no calendário (inicia dinamicamente no mês atual)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  if (!isOpen) return null;

  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  // Impede navegação para meses anteriores ao mês corrente
  const isPastMonth =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const handlePrevMonth = () => {
    if (isPastMonth) return;
    setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Montagem dinâmica dos dias do mês
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const days = [];
  // Células vazias para alinhamento com o primeiro dia da semana
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ day: null, empty: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(viewYear, viewMonth, d);
    thisDate.setHours(0, 0, 0, 0);
    const dayOfWeek = thisDate.getDay();

    const isPast = thisDate < today;
    const isoString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const status = verificarBloqueioData(isoString);

    const isDisabled = isPast || status.bloqueado;

    let reason = undefined;
    if (isPast) {
      reason = 'Data passada indisponível';
    } else if (status.bloqueado) {
      reason = status.motivo;
    }

    days.push({
      day: d,
      dayOfWeek,
      dateObj: thisDate,
      isoString,
      disabled: isDisabled,
      title: reason
    });
  }

  const handlePickDay = (item) => {
    if (item.disabled || item.empty) return;
    setSelectedDay(item.day);
    const dayPadded = String(item.day).padStart(2, '0');
    const mesPadded = String(viewMonth + 1).padStart(2, '0');
    const fullDate = `${dayFullName[item.dayOfWeek]}, ${dayPadded}/${mesPadded}/${viewYear}`;
    onSelectDate(fullDate);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-white)',
        border: '2px solid #BFDBFE',
        borderRadius: '14px',
        padding: '12px',
        marginTop: '8px',
        boxShadow: '0 8px 20px rgba(15, 82, 186, 0.12)'
      }}
      role="dialog"
      aria-label="Calendário para escolha de nova data"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          paddingBottom: '6px',
          borderBottom: '1.5px solid var(--border-subtle)'
        }}
      >
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={isPastMonth}
          style={{
            backgroundColor: '#F1F5F9',
            border: '1.5px solid var(--border-strong)',
            borderRadius: '8px',
            width: '34px',
            height: '34px',
            cursor: isPastMonth ? 'not-allowed' : 'pointer',
            opacity: isPastMonth ? 0.4 : 1,
            fontWeight: '800'
          }}
          aria-label="Mês anterior"
        >
          ◀
        </button>

        <span
          style={{
            fontSize: 'calc(15px * var(--font-scale))',
            fontWeight: '800',
            color: 'var(--primary)'
          }}
        >
          📅 {monthNames[viewMonth]} de {viewYear}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          style={{
            backgroundColor: '#F1F5F9',
            border: '1.5px solid var(--border-strong)',
            borderRadius: '8px',
            width: '34px',
            height: '34px',
            cursor: 'pointer',
            fontWeight: '800'
          }}
          aria-label="Próximo mês"
        >
          ▶
        </button>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          fontSize: 'calc(11px * var(--font-scale))',
          fontWeight: '800',
          color: '#475569',
          marginBottom: '4px'
        }}
      >
        {dayNames.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>

      {/* Grade de dias */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px'
        }}
      >
        {days.map((item, idx) => {
          if (item.empty) {
            return <span key={`empty-${idx}`} style={{ height: '36px' }} />;
          }

          const isSelected = selectedDay === item.day && !item.disabled;
          return (
            <button
              key={`day-${item.day}`}
              type="button"
              disabled={item.disabled}
              title={item.title}
              onClick={() => handlePickDay(item)}
              style={{
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: isSelected ? '1.5px solid var(--primary-dark)' : '1.5px solid transparent',
                backgroundColor: isSelected ? 'var(--primary)' : item.disabled ? '#F1F5F9' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : item.disabled ? '#94A3B8' : 'var(--text-main)',
                fontSize: 'calc(14px * var(--font-scale))',
                fontWeight: isSelected ? '800' : '700',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.45 : 1,
                boxShadow: isSelected ? '0 2px 6px rgba(15, 82, 186, 0.4)' : 'none'
              }}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
