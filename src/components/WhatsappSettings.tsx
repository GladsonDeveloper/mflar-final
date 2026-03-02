import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface WhatsappSettingsProps {
  addLog: (message: string, type: 'info' | 'error' | 'success') => void;
}

export default function WhatsappSettings({ addLog }: WhatsappSettingsProps) {
  const [masterPhone, setMasterPhone] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const savedMasterPhone = localStorage.getItem('masterPhone');
    if (savedMasterPhone) setMasterPhone(savedMasterPhone);
    const savedWebhookUrl = localStorage.getItem('webhookUrl');
    if (savedWebhookUrl) setWebhookUrl(savedWebhookUrl);
  }, []);

  const handleTestConnectionOnly = async () => {
    setButtonState('loading');
    setConnectionError(null);





    try {
      const response = await fetch('/api/zapi/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Não precisa mais enviar dados, o servidor já tem
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Conexão com a Z-API estabelecida com sucesso!');
        setConnectionError(null); // Limpa qualquer erro anterior da tela
        setButtonState('success');
      } else {
        const detailedError = data.details || data.message;
        toast.error(`Falha na conexão: ${data.message}`);
        setConnectionError(detailedError);
        setButtonState('error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Erro crítico ao tentar conectar. Verifique o console de logs.');
      addLog(`Falha na conexão com a Z-API: ${errorMessage}`, 'error');
      console.error('Z-API connection test error:', error);
      setButtonState('error');
    }

    // Reset button state after 2 seconds
    setTimeout(() => setButtonState('idle'), 2000);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Por favor, insira a URL do Webhook para testar.');
      return;
    }
    
    const toastId = toast.loading('Enviando webhook de teste...');

    try {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Webhook de teste enviado! Verifique o Make.com.', { id: toastId });
        addLog('Webhook de teste enviado com sucesso.', 'success');
      } else {
        const detailedError = data.details || data.message;
        toast.error(`Falha ao enviar webhook: ${data.message}`, { id: toastId });
        addLog(`Falha no webhook de teste: ${detailedError}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Erro crítico ao enviar webhook.', { id: toastId });
      addLog(`Erro crítico no teste de webhook: ${errorMessage}`, 'error');
    }
  };

  const handleSaveAndTest = async () => {
    // 1. Save settings to localStorage
    localStorage.setItem('masterPhone', masterPhone);
    localStorage.setItem('webhookUrl', webhookUrl);
    toast.success('Configurações salvas localmente!');

    // 2. Test connection
    await handleTestConnectionOnly();
  };

  const buttonVariants = {
    idle: { backgroundColor: '#2563EB', width: '220px' },
    loading: { backgroundColor: '#60A5FA', width: '50px' },
    success: { backgroundColor: '#22C55E', width: '50px' },
    error: { backgroundColor: '#EF4444', width: '50px' },
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">Conexão WhatsApp & Z-API</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {connectionError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-bold">Erro de Conexão:</p>
            <p className="text-sm">{connectionError}</p>
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Configurações da Integração</h3>

        {/* Webhook */}
        <div className="mb-4">
          <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-1">
            URL do Webhook (Make.com)
          </label>
          <div className="flex">
            <input
              type="text"
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://hook.us2.make.com/..."
            />
            <button 
              onClick={handleTestWebhook}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Testar Webhook
            </button>
          </div>
           <p className="text-xs text-gray-500 mt-1">Use esta URL no módulo HTTP do Make para centralizar a inteligência.</p>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Credenciais Z-API (WhatsApp)</h4>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
            <p className="font-semibold">As credenciais da Z-API agora estão seguras!</p>
            <p className="text-sm">Elas foram movidas para as variáveis de ambiente no servidor e não são mais necessárias aqui.</p>
          </div>
        </div>

        {/* Master Phone */}
        <div className="border-t border-gray-200 pt-4 mt-4">
           <h4 className="text-lg font-semibold text-gray-700 mb-2">Telefone Mestre do Agente</h4>
            <div>
                <label htmlFor="master-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Seu WhatsApp (Admin)
                </label>
                <input
                    type="text"
                    id="master-phone"
                    value={masterPhone}
                    onChange={(e) => setMasterPhone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5531996902361"
                />
            </div>
        </div>


        {/* Action Buttons */}
        <div className="mt-6 flex justify-end items-center space-x-4">
          <button 
            onClick={handleTestConnectionOnly}
            disabled={buttonState === 'loading'}
            className="px-6 h-10 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Testar Conexão Z-API
          </button>
          <motion.button 
            onClick={handleSaveAndTest}
            variants={buttonVariants}
            animate={buttonState}
            disabled={buttonState === 'loading'}
            className="h-10 flex items-center justify-center text-white rounded-lg font-semibold overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{ minWidth: '50px' }}
          >
            {buttonState === 'idle' && <span>Salvar & Testar</span>}
            {buttonState === 'loading' && <Loader2 className="animate-spin" />}
            {buttonState === 'success' && <Check />}
            {buttonState === 'error' && <X />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
