import React from 'react';

export default function TimeChips({
  options = [],
  selected,
  onSelect,
  occupiedTimes = [],
  filterOccupied = true
}) {
  // Se filterOccupied for true, os horários ocupados NÃO aparecem na tela (regra pedida)
  const availableSlots = filterOccupied
    ? options.filter((time) => {
        const horaSimples = time.substring(0, 5);
        return !occupiedTimes.includes(horaSimples);
      })
    : options;

  if (availableSlots.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: '#F8FAFC',
          border: '1.5px dashed #CBD5E1',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#64748B',
          fontSize: 'calc(14px * var(--font-scale))',
          fontWeight: '700'
        }}
      >
        ❌ Nenhum horário disponível neste turno para a data selecionada.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
        gap: '8px'
      }}
    >
      {availableSlots.map((time) => {
        const isSelected = selected === time || selected?.startsWith(time);

        return (
          <button
            key={time}
            type="button"
            onClick={() => onSelect(time)}
            aria-pressed={isSelected}
            style={{
              backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
              color: isSelected ? '#FFFFFF' : 'var(--text-main)',
              border: isSelected ? '2px solid var(--primary-dark)' : '1.5px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '10px 4px',
              fontSize: 'calc(15px * var(--font-scale))',
              fontWeight: '800',
              textAlign: 'center',
              cursor: 'pointer',
              minHeight: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isSelected ? '0 4px 10px rgba(15, 82, 186, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease'
            }}
          >
            {isSelected ? `✓ ${time}` : time}
          </button>
        );
      })}
    </div>
  );
}
