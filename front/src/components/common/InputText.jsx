import React from 'react';

export default function InputText({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  hint,
  readOnly = false,
  onClick,
  rightElement,
  autoComplete = 'off'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
      {label && (
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
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onClick={onClick}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            minHeight: '54px',
            backgroundColor: 'var(--surface-white)',
            border: '2px solid var(--border-strong)',
            borderRadius: '10px',
            padding: rightElement ? '12px 48px 12px 14px' : '12px 14px',
            fontSize: 'calc(17px * var(--font-scale))',
            color: 'var(--text-main)',
            fontWeight: '600',
            outline: 'none',
            cursor: readOnly ? 'pointer' : 'text'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(15, 82, 186, 0.25)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-strong)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '14px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            {rightElement}
          </div>
        )}
      </div>

      {hint && (
        <span
          style={{
            fontSize: 'calc(13px * var(--font-scale))',
            color: 'var(--text-muted)',
            fontWeight: '600'
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
