import React, { useState } from 'react';
import InputText from '../components/common/InputText';
import PasswordInput from '../components/common/PasswordInput';
import Button from '../components/common/Button';
import { maskCPF, maskPhone, maskDate } from '../utils/masks';
import { registerUser } from '../services/api';

export default function RegisterModal({ isOpen, onClose, onOpenLogin }) {
  const [nome, setNome] = useState('João da Silva Santos');
  const [cpf, setCpf] = useState('123.456.789-00');
  const [nasc, setNasc] = useState('15/08/1958');
  const [telefone, setTelefone] = useState('(81) 98765-4321');
  const [senha, setSenha] = useState('senha2026');
  const [termos, setTermos] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termos) {
      alert('Por favor, aceite os termos de uso para continuar.');
      return;
    }

    const digitsCpf = (cpf || '').replace(/\D/g, '');
    if (digitsCpf.length !== 11) {
      alert('⚠️ CPF inválido!\nO CPF deve conter exatamente 11 dígitos numéricos.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ nome, cpf, dataNascimento: nasc, telefone, senha });
      alert('✓ Cadastro Realizado com Sucesso!\nAgora você pode entrar e agendar suas consultas.');
      onClose();
      onOpenLogin();
    } catch (err) {
      alert(`⚠️ Aviso: CPF inválido ou já cadastrado!\n${err.message || 'Já existe um paciente cadastrado com este CPF.'}\n\nPor favor, verifique os dados informados.`);
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
      aria-label="Modal de Novo Cadastro"
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
            Cadastro Simples
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de cadastro e voltar"
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
            Criar Minha Conta
          </h2>
          <p
            style={{
              fontSize: 'calc(16px * var(--font-scale))',
              color: 'var(--text-muted)'
            }}
          >
            Preencha seus dados para marcar suas consultas.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Passo 1: Dados Pessoais */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                fontSize: 'calc(13px * var(--font-scale))',
                fontWeight: '800',
                color: '#0F52BA',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}
            >
              Passo 1: Seus Dados Pessoais
            </div>

            <InputText
              id="cad-nome"
              label="Nome Completo"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria José da Silva"
            />

            <InputText
              id="cad-cpf"
              label="Seu CPF"
              required
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              hint="Campo com máscara automática"
            />

            <InputText
              id="cad-nasc"
              label="Data de Nascimento"
              required
              value={nasc}
              onChange={(e) => setNasc(maskDate(e.target.value))}
              placeholder="DD / MM / AAAA"
            />
          </div>

          {/* Passo 2: Contato & Senha */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                fontSize: 'calc(13px * var(--font-scale))',
                fontWeight: '800',
                color: '#0F52BA',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}
            >
              Passo 2: Contato &amp; Senha
            </div>

            <InputText
              id="cad-tel"
              label="Celular ou WhatsApp"
              type="tel"
              required
              value={telefone}
              onChange={(e) => setTelefone(maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              hint="Para enviarmos a confirmação da sua consulta"
            />

            <PasswordInput
              id="cad-pwd"
              label="Crie uma Senha Fácil"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              hint="✓ Senha boa e fácil de lembrar"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
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
                checked={termos}
                onChange={(e) => setTermos(e.target.checked)}
                required
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
                Concordo com os Termos de Uso e Privacidade
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? '⏳ Cadastrando...' : '✓ CONCLUIR MEU CADASTRO'}
            </Button>
            <Button type="button" variant="neutral" onClick={onClose}>
              Voltar ao Início
            </Button>
          </div>
        </form>

        <div
          style={{
            textAlign: 'center',
            paddingTop: '8px',
            fontSize: 'calc(14px * var(--font-scale))'
          }}
        >
          Já tem conta cadastrada?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLogin();
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
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
}
