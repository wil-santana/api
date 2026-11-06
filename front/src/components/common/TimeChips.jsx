import React from 'react';

export default function TimeChips({
  options = [],
  selected,
  onSelect,
  occupiedTimes = [],
  pastTimes = []
}) {
  const isSlotDisabled = (time) => {
    const horaSimples = time.substring(0, 5);
    return occupiedTimes.includes(horaSimples) || pastTimes.includes(horaSimples);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
        gap: '8px'
      }}
    >
      {options.map((time) => {
        const isSelected = selected === time || selected?.startsWith(time);
        const disabled = isSlotDisabled(time);
        const horaSimples = time.substring(0, 5);
        const isOccupied = occupiedTimes.includes(horaSimples);
        const isPast = pastTimes.includes(horaSimples);

        return (
          <button
            key={time}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onSelect(time)}
            aria-pressed={isSelected}
            title={isOccupied ? 'Horário já reservado' : isPast ? 'Horário já passado' : undefined}
            style={{
              backgroundColor: isSelected
                ? 'var(--primary)'
                : disabled
                ? '#F1F5F9'
                : '#FFFFFF',
              color: isSelected
                ? '#FFFFFF'
                : disabled
                ? '#94A3B8'
                : 'var(--text-main)',
              border: isSelected
                ? '2px solid var(--primary-dark)'
                : disabled
                ? '1.5px solid #E2E8F0'
                : '1.5px solid var(--border-strong)',
              borderRadius: '10px',
              padding: '10px 4px',
              fontSize: 'calc(15px * var(--font-scale))',
              fontWeight: '800',
              textAlign: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.45 : 1,
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
