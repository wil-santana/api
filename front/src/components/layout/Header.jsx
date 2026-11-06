import React from 'react';
import DoctorLogo from '../common/DoctorLogo';
import { useSenior } from '../../context/SeniorContext';

export default function Header() {
  const { seniorMode, toggleSeniorMode } = useSenior();

  return (
    <header
      style={{
        backgroundColor: '#1E293B',
        borderBottom: '2px solid #334155',
        padding: '14px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <DoctorLogo size={42} />
        <div>
          <h1
            style={{
              fontSize: 'calc(20px * var(--font-scale))',
              fontWeight: '800',
              color: '#FFFFFF',
              letterSpacing: '-0.3px'
            }}
          >
            Consulta Fácil
          </h1>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            Agendamento Médico
          </p>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={toggleSeniorMode}
          aria-pressed={seniorMode}
          style={{
            backgroundColor: seniorMode ? '#0284C7' : '#334155',
            border: seniorMode ? '2px solid #BAE6FD' : '2px solid #38BDF8',
            color: '#F8FAFC',
            padding: '10px 16px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: seniorMode ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'
          }}
        >
          {seniorMode ? '✓ Modo Sênior Ativado (Fontes +20%)' : '🔍 Modo Sênior (Fontes Ampliadas)'}
        </button>
      </div>
    </header>
  );
}
