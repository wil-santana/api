import React from 'react';

export default function DoctorLogo({ size = 44, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logotipo Consulta Fácil: Silhueta de médico com máscara cirúrgica e estetoscópio"
      role="img"
    >
      <defs>
        <linearGradient id="doctorLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0F52BA" />
        </linearGradient>
      </defs>
      {/* Escudo com cantos arredondados */}
      <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#doctorLogoGrad)" />
      
      {/* Cabeça e Touca Cirúrgica */}
      <path
        d="M 33 39 C 33 25 40 18 50 18 C 60 18 67 25 67 39 C 67 44 65 48 62 50 C 58 49 42 49 38 50 C 35 48 33 44 33 39 Z"
        fill="#FFFFFF"
      />
      <path
        d="M 33 34 C 40 31 60 31 67 34"
        stroke="#0284C7"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Máscara Facial com Pregas */}
      <path
        d="M 36 43 C 36 43 50 44 64 43 C 65 50 63 57 50 58 C 37 57 35 50 36 43 Z"
        fill="#E0F2FE"
        stroke="#0284C7"
        strokeWidth="2"
      />
      <path d="M 40 48 C 47 49 53 49 60 48" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 42 52 C 47 53 53 53 58 52" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 36 44 C 31 45 30 50 35 52" fill="none" stroke="#E0F2FE" strokeWidth="2" />
      <path d="M 64 44 C 69 45 70 50 65 52" fill="none" stroke="#E0F2FE" strokeWidth="2" />
      
      {/* Corpo / Jaleco */}
      <path d="M 22 84 C 22 68 34 61 50 61 C 66 61 78 68 78 84 Z" fill="#FFFFFF" />
      
      {/* Estetoscópio anatômico */}
      <path
        d="M 40 59 C 35 62 33 69 33 74 C 33 78 37 81 42 81 C 47 81 49 77 49 74"
        fill="none"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 60 59 C 65 62 67 69 67 74 C 67 78 63 81 58 81 C 53 81 51 77 51 74"
        fill="none"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="80" r="5.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="2.5" />
      <circle cx="50" cy="80" r="2.2" fill="#FFFFFF" />
    </svg>
  );
}
