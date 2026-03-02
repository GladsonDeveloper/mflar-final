import React from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

interface LogConsoleProps {
  logs: LogEntry[];
  clearLogs: () => void;
}

const typeClasses = {
  info: 'text-gray-400',
  error: 'text-red-500',
  success: 'text-green-500',
};

export default function LogConsole({ logs, clearLogs }: LogConsoleProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-gray-900">Console de Logs</h2>
        <button 
          onClick={clearLogs}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Limpar Logs
        </button>
      </div>
      <div className="bg-gray-800 text-white font-mono p-4 rounded-lg shadow-lg h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500">Nenhum log para exibir. Teste uma conexão para ver os resultados aqui.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`flex items-start ${typeClasses[log.type]}`}>
              <span className="mr-4 text-gray-500">{log.timestamp}</span>
              <p className="flex-1 whitespace-pre-wrap break-words">{log.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
