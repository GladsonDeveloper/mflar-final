import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PaperPlaneIcon } from '@radix-ui/react-icons'; // Usando um ícone diferente para variedade

export default function AISimulator() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastReply, setLastReply] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !message) {
      toast.error('Por favor, preencha o telefone e a mensagem.');
      return;
    }

    setIsLoading(true);
    setLastReply('');
    const toastId = toast.loading('Simulando envio e processamento...');

    try {
      const response = await fetch('/api/ai/qualify', { // Reutilizando o endpoint de qualificação
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message, isSimulation: true }), // Adiciona um flag de simulação
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Simulação concluída! Resposta da IA recebida.', { id: toastId });
        setLastReply(data.reply);
      } else {
        throw new Error(data.error || 'Falha na simulação');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Erro na simulação: ${errorMessage}`, { id: toastId });
      setLastReply(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">Área de Teste e Simulação da IA</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4 text-gray-600">
          Use esta ferramenta para enviar mensagens diretamente para o motor de qualificação da IA. O sistema processará a mensagem como se tivesse vindo do WhatsApp e enviará a resposta para o número de telefone especificado.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone do Cliente (com código do país, ex: 553199...)
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5531996902361"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem do Cliente
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Olá, gostaria de saber mais sobre o financiamento."
            />
          </div>
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PaperPlaneIcon className="mr-2" />
              {isLoading ? 'Processando...' : 'Enviar Mensagem de Teste'}
            </motion.button>
          </div>
        </form>

        {lastReply && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800">Última Resposta da IA:</h3>
            <div className="mt-2 p-4 bg-gray-100 rounded-lg whitespace-pre-wrap font-mono text-sm text-gray-700">
              {lastReply}
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            Build ID: VERSAO-1.1.0-PRODUCAO-ESTAVEL
          </span>
        </div>
      </div>
    </div>
  );
}
