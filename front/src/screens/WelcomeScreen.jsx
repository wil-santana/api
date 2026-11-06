import React from 'react';
import Button from '../components/common/Button';

export default function WelcomeScreen({ onOpenLogin, onOpenRegister }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px' }}>
      <span
        style={{
          display: 'inline-block',
          alignSelf: 'flex-start',
          backgroundColor: '#E0F2FE',
          color: '#0369A1',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: 'calc(12px * var(--font-scale))',
          fontWeight: '800',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}
      >
        Saúde sem Complicação
      </span>

      <h2
        style={{
          fontSize: 'calc(24px * var(--font-scale))',
          fontWeight: '800',
          lineHeight: 1.25,
          color: 'var(--text-main)'
        }}
      >
        Suas consultas médicas na hora certa.
      </h2>

      {/* Ações Primárias na Zona do Polegar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
        <Button variant="primary" onClick={onOpenLogin}>
          👉 ENTRAR NA MINHA CONTA
        </Button>
        <Button variant="secondary" onClick={onOpenRegister}>
          ➕ Criar Novo Cadastro
        </Button>
      </div>

      {/* Cartão de Benefício 1 */}
      <div
        style={{
          backgroundColor: 'var(--surface-white)',
          border: '1.5px solid var(--border-subtle)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <span style={{ fontSize: '28px', flexShrink: 0 }}>🩺</span>
        <div>
          <h4
            style={{
              fontSize: 'calc(16px * var(--font-scale))',
              fontWeight: '800',
              color: 'var(--text-main)',
              marginBottom: '2px'
            }}
          >
            Médicos de Confiança
          </h4>
          <p
            style={{
              fontSize: 'calc(14px * var(--font-scale))',
              color: 'var(--text-muted)',
              lineHeight: 1.35
            }}
          >
            Mais de 20 especialidades para você cuidar da sua saúde.
          </p>
        </div>
      </div>

      {/* Cartão de Benefício 2 */}
      <div
        style={{
          backgroundColor: 'var(--surface-white)',
          border: '1.5px solid var(--border-subtle)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <span style={{ fontSize: '28px', flexShrink: 0 }}>📱</span>
        <div>
          <h4
            style={{
              fontSize: 'calc(16px * var(--font-scale))',
              fontWeight: '800',
              color: 'var(--text-main)',
              marginBottom: '2px'
            }}
          >
            Aviso no seu WhatsApp
          </h4>
          <p
            style={{
              fontSize: 'calc(14px * var(--font-scale))',
              color: 'var(--text-muted)',
              lineHeight: 1.35
            }}
          >
            Lembretes do dia e hora da consulta direto no seu celular.
          </p>
        </div>
      </div>

      {/* Refúgio Psicológico: Apoio Telefônico 0800 */}
      <div
        style={{
          backgroundColor: '#FEF3C7',
          border: '2px solid #F59E0B',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          color: '#78350F'
        }}
      >
        <span style={{ fontSize: '32px', flexShrink: 0 }}>☎️</span>
        <div style={{ fontSize: 'calc(14px * var(--font-scale))', lineHeight: 1.4 }}>
          <strong style={{ fontSize: 'calc(16px * var(--font-scale))', color: '#92400E', display: 'block' }}>
            Tem dificuldade com o celular?
          </strong>
          Toque para ligar grátis:{' '}
          <a
            href="tel:08007008000"
            style={{ color: '#92400E', fontWeight: '800', textDecoration: 'underline' }}
          >
            0800 700 8000
          </a>
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          fontSize: 'calc(12px * var(--font-scale))',
          color: '#64748B',
          padding: '8px 0'
        }}
      >
        🔒 Sistema seguro e certificado padrão CFM / SUS
      </div>
    </div>
  );
}
