/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import WhatsappSettings from './components/WhatsappSettings';
import Manual from './components/Manual';
import LogConsole from './components/LogConsole';
import Login from './components/Login';
import ClientDatabase from './components/ClientDatabase';
import AISimulator from './components/AISimulator';

// Dashboard component to keep the main view clean
function Dashboard() {
  return (
    <>
      <header className="flex justify-between items-center pb-6 border-b border-gray-200">
        <h2 className="text-3xl font-semibold text-gray-900">Painel de Controle</h2>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Olá, Gladson!</span>
          <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="mt-6 mb-6">
        <input
          type="text"
          placeholder="Pesquisar clientes..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Alerts and Process Overview */}
      <section className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800">Alertas de Prioridade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Example Alert Card */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Urgente: Análise de Caixa</p>
            <p className="font-semibold text-gray-800">Cliente: João Silva</p>
            <p className="text-xs text-gray-600">Prazo: 2 dias restantes</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-sm text-gray-500">Formulários Pendentes</p>
            <p className="font-semibold text-gray-800">Cliente: Maria Inês</p>
            <p className="text-xs text-gray-600">Prazo: 5 dias restantes</p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800">Visão Geral</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Example Overview Cards */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-500">Processos Ativos</p>
            <p className="text-2xl font-bold text-gray-800">12</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-500">Valor Simulado do Mês</p>
            <p className="text-2xl font-bold text-gray-800">R$ 1.500.000</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-500">Aprovados do Mês</p>
            <p className="text-2xl font-bold text-gray-800">3</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-500">Processos em Alerta</p>
            <p className="text-2xl font-bold text-red-500">2</p>
          </div>
        </div>
      </section>

      {/* Sections Overview */}
      <section className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800">Setores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Example Sector Card */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="font-semibold text-gray-800">Engenharia</p>
            <p className="text-sm text-gray-500">5 clientes</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="font-semibold text-gray-800">Cadastro</p>
            <p className="text-sm text-gray-500">8 clientes</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="font-semibold text-gray-800">Avaliação de Crédito</p>
            <p className="text-sm text-gray-500">3 clientes</p>
          </div>
        </div>
      </section>
    </>
  );
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: LogEntry['type']) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, { timestamp, message, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
    toast.success('Logs limpos!');
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      // Salva o estado de autenticação no sessionStorage para persistir entre recarregamentos da página
      sessionStorage.setItem('isAuthenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    toast.success('Você saiu com sucesso!');
  };

  useEffect(() => {
    // Verifica se o usuário já está autenticado ao carregar a página
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }

    // Adiciona um timestamp para evitar cache da Vercel
    fetch(`/api/health?t=${Date.now()}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        if (data.status === 'ok') {
          console.log('Server Version:', data.version);
          toast.success(`Conectado: ${data.version || 'v1.1.0'}`);
        } else {
          toast.error('O servidor respondeu, mas com um status inesperado.');
        }
      })
      .catch(() => {
        toast.error('Falha ao conectar ao servidor.');
      });
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'whatsapp':
        return <WhatsappSettings addLog={addLog} />;
      case 'logs':
        return <LogConsole logs={logs} clearLogs={clearLogs} />;
      case 'manual':
        return <Manual />;
      case 'clients':
        return <ClientDatabase />;
      case 'simulator':
        return <AISimulator />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Toaster position="top-right" />
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">MF-LAR</h1>
          <p className="text-sm text-gray-500">DASHBOARD</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Navigation Items */}
          <a href="#" onClick={() => setActiveView('dashboard')} className={`flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200 ${activeView === 'dashboard' ? 'bg-blue-100 text-blue-700' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 001 1h3M9 10v10a1 1 0 001 1h4a1 1 0 001-1v-10"></path></svg>
            <span>Painel de Controle</span>
          </a>
          <a href="#" className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span>Fazer Simulação</span>
          </a>
          <a href="#" className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span>Monitoramento ao Vivo</span>
          </a>
          <a href="#" className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 3-3M3 21h18M5 10V7a2 2 0 012-2h10a2 2 0 012 2v3"></path></svg>
            <span>Relatórios de Giro</span>
          </a>
          <a href="#" onClick={() => setActiveView('simulator')} className={`flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200 ${activeView === 'simulator' ? 'bg-blue-100 text-blue-700' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 7h2m10 0h2M5 17h2m10 0h2M3 12h2m14 0h2M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"></path></svg>
            <span>Área de Teste IA</span>
          </a>
          <a href="#" onClick={() => setActiveView('whatsapp')} className={`flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200 ${activeView === 'whatsapp' ? 'bg-blue-100 text-blue-700' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span>Conexão WhatsApp</span>
          </a>
          <a href="#" className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.192-1.267-.547-1.783A2.923 2.923 0 0015 14c-1.472 0-2.802.603-3.753 1.57A2.923 2.923 0 009 14c-.851 0-1.701.182-2.5.548A2.923 2.923 0 005 16v2H3m14 0h-12M3 20h5.356A4.924 4.924 0 019 16c0-.653.192-1.267.547-1.783A2.923 2.923 0 0012 14c1.472 0 2.802.603 3.753 1.57A2.923 2.923 0 0017 16v2h-5.356"></path></svg>
            <span>Base de Clientes</span>
          </a>
          <a href="#" className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <span>Estúdio de Criação</span>
          </a>
          <a href="#" onClick={() => setActiveView('manual')} className={`flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200 ${activeView === 'manual' ? 'bg-blue-100 text-blue-700' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10"></path></svg>
            <span>Manual de Operação</span>
          </a>
          <a href="#" className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>Configurações</span>
          </a>
          <a href="#" className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>Fábrica de Robôs</span>
          </a>
          <a href="#" onClick={() => setActiveView('clients')} className={`flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200 ${activeView === 'clients' ? 'bg-blue-100 text-blue-700' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.192-1.267-.547-1.783A2.923 2.923 0 0015 14c-1.472 0-2.802.603-3.753 1.57A2.923 2.923 0 009 14c-.851 0-1.701.182-2.5.548A2.923 2.923 0 005 16v2H3m14 0h-12M3 20h5.356A4.924 4.924 0 019 16c0-.653.192-1.267.547-1.783A2.923 2.923 0 0012 14c1.472 0 2.802.603 3.753 1.57A2.923 2.923 0 0017 16v2h-5.356"></path></svg>
            <span>Base de Clientes</span>
          </a>
          <a href="#" onClick={() => setActiveView('logs')} className={`flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-200 ${activeView === 'logs' ? 'bg-blue-100 text-blue-700' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span>Console de Logs</span>
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Sair</span>
          </button>
          <div className="mt-4 text-center">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
              Build ID: VERSAO-1.2.0-RESET-TOTAL
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
