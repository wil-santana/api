import React, { useState } from 'react';

export default function PasswordInput({
  id,
  label = 'Sua Senha',
  value,
  onChange,
  required = true,
  hint,
  placeholder = 'Digite sua senha'
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 'calc(16px * var(--font-scale))',
          fontWeight: '800',
          color: 'var(--text-main)',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <span>
          {label} {required && <strong style={{ color: '#DC2626' }}>*</strong>}
        </span>
      </label>

      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--surface-white)',
          border: '2px solid var(--border-strong)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            padding: '12px 14px',
            fontSize: 'calc(17px * var(--font-scale))',
            color: 'var(--text-main)',
            fontWeight: '600',
            outline: 'none',
            minHeight: '52px'
          }}
          onFocus={(e) => {
            const parent = e.target.parentElement;
            if (parent) {
              parent.style.borderColor = 'var(--primary)';
              parent.style.boxShadow = '0 0 0 3px rgba(15, 82, 186, 0.25)';
            }
          }}
          onBlur={(e) => {
            const parent = e.target.parentElement;
            if (parent) {
              parent.style.borderColor = 'var(--border-strong)';
              parent.style.boxShadow = 'none';
            }
          }}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Ocultar senha' : 'Ver senha em texto claro'}
          style={{
            backgroundColor: '#F1F5F9',
            border: 'none',
            borderLeft: '1.5px solid var(--border-subtle)',
            color: '#1E293B',
            padding: '0 14px',
            fontWeight: '800',
            fontSize: 'calc(14px * var(--font-scale))',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {showPassword ? '🙈 Ocultar' : '👁️ Mostrar'}
        </button>
      </div>

      {hint && (
        <span
          style={{
            fontSize: 'calc(13px * var(--font-scale))',
            color: '#16A34A',
            fontWeight: '700'
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
