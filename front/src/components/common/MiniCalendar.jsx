import React, { useState } from 'react';

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const dayFullName = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function MiniCalendar({ isOpen, onSelectDate, onClose }) {
  const [selectedDay, setSelectedDay] = useState(15);

  if (!isOpen) return null;

  // Dias de Outubro 2026: 1 de Outubro começou em uma Quinta-feira (índice 4)
  const days = [];
  // 4 células vazias para alinhar com Quinta-feira
  for (let i = 0; i < 4; i++) {
    days.push({ day: null, empty: true });
  }

  // 31 dias de Outubro
  for (let d = 1; d <= 31; d++) {
    const dayOfWeek = (4 + d - 1) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = d === 12; // 12 de Outubro
    const isDisabled = isWeekend || isHoliday;
    days.push({
      day: d,
      dayOfWeek,
      disabled: isDisabled,
      title: isHoliday ? 'Feriado Nacional' : isWeekend ? 'Fim de semana sem atendimento' : undefined
    });
  }

  const handlePickDay = (item) => {
    if (item.disabled || item.empty) return;
    setSelectedDay(item.day);
    const dayPadded = item.day < 10 ? `0${item.day}` : item.day;
    const fullDate = `${dayFullName[item.dayOfWeek]}, ${dayPadded}/10/2026`;
    onSelectDate(fullDate);
    // Fechamento automático suave
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
          onClick={() => alert('Exibindo início do período de agendamento em Outubro de 2026.')}
          style={{
            backgroundColor: '#F1F5F9',
            border: '1.5px solid var(--border-strong)',
            borderRadius: '8px',
            width: '34px',
            height: '34px',
            cursor: 'pointer',
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
          📅 Outubro de 2026
        </span>

        <button
          type="button"
          onClick={() => alert('Vagas para Novembro de 2026 estarão disponíveis a partir de 25/10.')}
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

          const isSelected = selectedDay === item.day;
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
                backgroundColor: isSelected ? 'var(--primary)' : item.disabled ? 'transparent' : '#F8FAFC',
                color: isSelected ? '#FFFFFF' : item.disabled ? '#94A3B8' : 'var(--text-main)',
                fontSize: 'calc(14px * var(--font-scale))',
                fontWeight: isSelected ? '800' : '700',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.6 : 1,
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
