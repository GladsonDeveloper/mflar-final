import { useState, useEffect } from 'react';

interface Client {
  id: number;
  user_type: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  status: string;
  estimated_value: number;
  income: number;
  notes: string;
  created_at: string;
}

export default function ClientDatabase() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error('Falha ao buscar clientes');
        }
        const data = await response.json();
        setClients(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClients();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Carregando clientes...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Erro ao carregar clientes: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">Base de Clientes</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Estimado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renda</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.user_type || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.document || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.estimated_value || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.income || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'qualified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(client.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
