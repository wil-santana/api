import React, { useState } from 'react';
import InputText from '../components/common/InputText';
import PasswordInput from '../components/common/PasswordInput';
import Button from '../components/common/Button';
import { maskCPF } from '../utils/masks';
import { loginUser } from '../services/api';

export default function LoginModal({ isOpen, onClose, onOpenRegister, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    // Se começar com números, formata como CPF; se tiver letras/@, aceita como e-mail/usuário
    if (/^\d/.test(val)) {
      setIdentifier(maskCPF(val));
    } else {
      setIdentifier(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(identifier, password);
      if (res?.role === 'ADMIN') {
        alert('✓ Acesso Autorizado!\nBem-vindo ao Painel Administrativo da Clínica.');
      } else {
        alert('✓ Login Realizado com Sucesso!\nSeja bem-vindo(a) ao Consulta Fácil.');
      }

      if (onLoginSuccess) {
        onLoginSuccess(res?.paciente);
      } else {
        onClose();
      }
    } catch (err) {
      alert(`⚠️ Falha no Acesso!\n${err.message || 'Login ou senha incorretos.'}\n\nPor favor, confira suas credenciais.`);
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
      aria-label="Modal de Login Seguro"
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
              backgroundColor: '#E0F2FE',
              color: '#0369A1',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: 'calc(12px * var(--font-scale))',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}
          >
            Acesso Seguro
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de login e voltar"
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
            Entrar na Conta
          </h2>
          <p
            style={{
              fontSize: 'calc(16px * var(--font-scale))',
              color: 'var(--text-muted)'
            }}
          >
            Acesse seus agendamentos.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputText
            id="login-user"
            label="Seu CPF ou Usuário"
            required
            value={identifier}
            onChange={handleIdentifierChange}
            placeholder="Ex: 123.456.789-00 ou admin"
            //hint="Dica: Pacientes digitam o CPF. Gestores digitam 'admin'."
          />

          <PasswordInput
            id="login-pwd"
            label="Sua Senha"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0 14px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '6px 0'
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '26px',
                  height: '26px',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer'
                }}
              />
              <span
                style={{
                  fontSize: 'calc(16px * var(--font-scale))',
                  fontWeight: '700',
                  color: 'var(--text-main)'
                }}
              >
                Lembrar de mim neste dispositivo
              </span>
            </label>

            <button
              type="button"
              onClick={() => alert('Enviaremos um código SMS com 4 dígitos para o seu celular cadastrado.')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0F52BA',
                fontSize: 'calc(15px * var(--font-scale))',
                fontWeight: '700',
                textDecoration: 'underline',
                padding: '4px 0',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              Esqueci minha senha? (Recuperar por SMS)
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? '⏳ Entrando...' : 'ENTRAR NO SISTEMA'}
            </Button>
            <Button type="button" variant="neutral" onClick={onClose}>
              Voltar ao Início
            </Button>
          </div>
        </form>

        <div
          style={{
            textAlign: 'center',
            paddingTop: '6px',
            fontSize: 'calc(14px * var(--font-scale))',
            color: '#475569'
          }}
        >
          Ainda não tem cadastro?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0F52BA',
              fontWeight: '800',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Cadastre-se grátis
          </button>
        </div>
      </div>
    </div>
  );
}
