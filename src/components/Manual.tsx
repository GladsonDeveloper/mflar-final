import React from 'react';

export default function Manual() {
  const apiUrl = window.location.origin;

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">Manual de Operação: Make.com & IA</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Configurando o Cenário de Captura de Clientes</h3>
        <p className="text-gray-600 mb-6">
          Siga este tutorial para ajustar seu cenário no Make.com e usar nossa nova IA de classificação, que fornecerá respostas mais precisas e diretas.
        </p>

        <div className="space-y-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Módulo 1: Webhook (Z-API)</h4>
            <p className="text-gray-600">Este módulo permanece o mesmo. Ele é o gatilho que inicia o cenário sempre que uma nova mensagem do WhatsApp é recebida.</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Módulo 2: Data Store (Get a record)</h4>
            <p className="text-gray-600">Este módulo também permanece o mesmo. Ele busca o histórico da conversa para dar contexto à IA.</p>
          </div>

          <div className="border-t border-blue-200 pt-6">
            <h4 className="text-lg font-semibold text-blue-700 mb-2">Módulo 3: HTTP - A Grande Mudança!</h4>
            <p className="text-gray-600 mb-4">
              Aqui está a principal alteração. Em vez de usar o módulo "Google Gemini AI", você usará o módulo "HTTP" para fazer uma requisição para o nosso sistema.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 bg-gray-50 p-4 rounded-md">
              <li><strong>URL:</strong> Cole a URL abaixo. Ela aponta para o nosso novo endpoint de IA.</li>
              <li className="font-mono bg-gray-200 p-2 rounded text-sm break-words">{`${apiUrl}/api/ai/classify`}</li>
              <li><strong>Method:</strong> <code>POST</code></li>
              <li><strong>Body type:</strong> <code>Raw</code></li>
              <li><strong>Content type:</strong> <code>JSON (application/json)</code></li>
              <li>
                <strong>Body content:</strong> Cole o JSON abaixo. Ele envia a mensagem atual e o histórico para a nossa IA.
                <pre className="bg-gray-800 text-white p-3 rounded-md mt-2 text-sm overflow-x-auto">
                  <code>
                    {`{
  "message": "{{2.text.message}}",
  "history": "{{4.Historico}}"
}`}
                  </code>
                </pre>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Módulo 4: Router</h4>
            <p className="text-gray-600 mb-4">
              O Router irá direcionar o fluxo com base na resposta da nossa IA. A resposta estará em <code>{`{{10.data.classification}}`}</code>.
            </p>
            <p className="font-semibold">Crie duas rotas:</p>
            <ul className="list-decimal list-inside space-y-2 mt-2 text-gray-700">
              <li>
                <strong>Rota 1 (Cliente Classificado):</strong> Continua o fluxo para salvar no Google Sheets e enviar a mensagem de boas-vindas.
                <br />
                <strong>Condição:</strong> <code>{`{{10.data.classification}}`}</code> <span className="font-mono bg-gray-200 px-1 rounded">Text operators: Equal to</span> <code>Corretor</code>
                <br />
                <em>(Adicione outra condição com OR para <code>Pessoa Física</code>)</em>
              </li>
              <li>
                <strong>Rota 2 (Precisa de Esclarecimento):</strong> Envia a pergunta da IA de volta para o cliente.
                <br />
                <strong>Condição (Fallback):</strong> Deixe esta rota como o caminho de fallback (sem condição).
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Fluxo Final</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Rota 1:</strong> Conecte ao módulo do Google Sheets para salvar o cliente e, em seguida, ao Z-API para enviar a mensagem de boas-vindas.</li>
              <li><strong>Rota 2:</strong> Conecte ao módulo Z-API para enviar a pergunta retornada em <code>{`{{10.data.classification}}`}</code> ao cliente. Atualize o Data Store com a pergunta feita para evitar repetição.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
