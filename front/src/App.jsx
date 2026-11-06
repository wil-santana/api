import React, { useState } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginModal from './screens/LoginModal';
import RegisterModal from './screens/RegisterModal';
import RescheduleModal from './screens/RescheduleModal';
import NewAppointmentModal from './screens/NewAppointmentModal';
import ProfileScreen from './screens/ProfileScreen';
import AdminScreen from './screens/AdminScreen';
import DoctorLogo from './components/common/DoctorLogo';
import { useSenior } from './context/SeniorContext';

export default function App() {
  const { seniorMode, toggleSeniorMode } = useSenior();

  // Usuário autenticado
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const salvo = localStorage.getItem('consulta_facil_paciente');
      return salvo ? JSON.parse(salvo) : null;
    } catch (_) {
      return null;
    }
  });

  // Controle de modais ('login' | 'register' | null)
  const [modalOpen, setModalOpen] = useState(null);

  // Consulta selecionada para reagendamento
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Controle do modal de novo agendamento
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);

  // Chave para forçar recarregamento das consultas após agendar/reagendar
  const [refreshKey, setRefreshKey] = useState(0);

  // Sucesso no login
  const handleLoginSuccess = (usuarioLogado) => {
    try {
      if (usuarioLogado) {
        setCurrentUser(usuarioLogado);
      } else {
        const salvo = localStorage.getItem('consulta_facil_paciente');
        if (salvo) setCurrentUser(JSON.parse(salvo));
      }
    } catch (_) {}
    setModalOpen(null);
  };

  // Logout do paciente ou administrador
  const handleLogout = () => {
    localStorage.removeItem('consulta_facil_paciente');
    setCurrentUser(null);
  };

  // Se o usuário logado for o Administrador da Clínica, exibe o Painel de Controle Admin
  if (currentUser?.role === 'ADMIN') {
    return <AdminScreen onLogout={handleLogout} />;
  }

  return (
    <div className="app-container">
      {/* Área Central Responsiva (Mobile-First) */}
      <main style={{ flex: 1, padding: '16px' }}>
        <div className="viewport-container">
          {/* Barra Superior / Status do Aplicativo */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 22px 6px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DoctorLogo size={28} />
              <span style={{ fontWeight: '800', color: 'var(--primary)' }}>Consulta Fácil</span>
            </div>
            <button
              type="button"
              onClick={toggleSeniorMode}
              aria-pressed={seniorMode}
              title={seniorMode ? 'Modo Sênior Ativado (Fontes +20%)' : 'Modo Sênior (Fontes Ampliadas)'}
              style={{
                backgroundColor: seniorMode ? '#0284C7' : '#F1F5F9',
                color: seniorMode ? '#FFFFFF' : '#0F172A',
                border: seniorMode ? '2px solid #BAE6FD' : '1.5px solid var(--border-strong)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: 'calc(13px * var(--font-scale))',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: seniorMode ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none'
              }}
            >
              {seniorMode ? '✓ Modo Sênior' : '🔍 Modo Sênior'}
            </button>
          </div>

          {/* Fluxo Orgânico: Se não estiver logado, exibe Home */}
          {!currentUser ? (
            <WelcomeScreen
              onOpenLogin={() => setModalOpen('login')}
              onOpenRegister={() => setModalOpen('register')}
            />
          ) : (
            /* Se estiver logado como Paciente, exibe o Perfil com consultas e botão de agendar */
            <ProfileScreen
              key={refreshKey}
              paciente={currentUser}
              onReschedule={(consulta) => setSelectedAppointment(consulta)}
              onNewAppointment={() => setNewAppointmentOpen(true)}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>

      {/* Modal de Login (Tela 02) */}
      <LoginModal
        isOpen={modalOpen === 'login'}
        onClose={() => setModalOpen(null)}
        onOpenRegister={() => setModalOpen('register')}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal de Novo Cadastro (Tela 03) */}
      <RegisterModal
        isOpen={modalOpen === 'register'}
        onClose={() => setModalOpen(null)}
        onOpenLogin={() => setModalOpen('login')}
      />

      {/* Modal de Reagendamento Guiado (Tela 04) */}
      <RescheduleModal
        isOpen={!!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onRescheduleSuccess={() => setRefreshKey((k) => k + 1)}
      />

      {/* Modal de Agendamento de Nova Consulta */}
      <NewAppointmentModal
        isOpen={newAppointmentOpen}
        pacienteId={currentUser?.id}
        onClose={() => setNewAppointmentOpen(false)}
        onAppointmentSuccess={() => setRefreshKey((k) => k + 1)}
      />

      {/* Rodapé Acessível do Sistema */}
      <footer
        style={{
          backgroundColor: '#1E293B',
          borderTop: '1px solid #334155',
          padding: '20px',
          textAlign: 'center',
          color: '#94A3B8',
          fontSize: '14px'
        }}
      >
        <p>
          <strong>Consulta Fácil</strong> — Sistema de Agendamento Médico com Acessibilidade Sênior (WCAG 2.1 AAA).
        </p>
      </footer>
    </div>
  );
}
