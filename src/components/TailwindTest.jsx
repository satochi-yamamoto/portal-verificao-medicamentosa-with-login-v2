export default function TailwindTest() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red-600 bg-blue-100 p-6 rounded-lg shadow-lg mb-4">
          🎨 Teste Tailwind CSS - DIAGNÓSTICO COMPLETO
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Esta página testa se o Tailwind CSS está funcionando corretamente após a migração
        </p>
      </div>

      {/* Basic Colors Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">✅ Teste de Cores Básicas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-500 text-white p-4 rounded-lg text-center font-medium">Red</div>
          <div className="bg-green-500 text-white p-4 rounded-lg text-center font-medium">Green</div>
          <div className="bg-blue-500 text-white p-4 rounded-lg text-center font-medium">Blue</div>
          <div className="bg-yellow-500 text-white p-4 rounded-lg text-center font-medium">Yellow</div>
        </div>
      </div>

      {/* Primary Colors Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🎯 Cores Customizadas do Portal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary-500 text-white p-6 rounded-lg text-center font-medium">
            Primary 500
          </div>
          <div className="bg-primary-600 text-white p-6 rounded-lg text-center font-medium">
            Primary 600
          </div>
          <div className="bg-success-500 text-white p-6 rounded-lg text-center font-medium">
            Success 500
          </div>
          <div className="bg-danger-500 text-white p-6 rounded-lg text-center font-medium">
            Danger 500
          </div>
        </div>
      </div>

      {/* Custom Components Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🧩 Componentes Customizados</h2>
        <div className="card mb-4">
          <h3 className="text-xl font-semibold mb-2">Card Component</h3>
          <p className="text-gray-600">Se este card tem bordas arredondadas, sombra e padding, o CSS customizado está funcionando.</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-danger">Danger Button</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label mb-2 block">Input Test</label>
            <input className="input" placeholder="Se este input tem bordas, está funcionando..." />
          </div>
          <div>
            <label className="label mb-2 block">Select Test</label>
            <select className="select">
              <option>Opção de teste</option>
            </select>
          </div>
        </div>
      </div>

      {/* Portal-specific Classes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">💊 Classes Específicas do Portal</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="interaction-high p-4 rounded-lg border-2">
            <h4 className="font-semibold">Interação Alta</h4>
            <p className="text-sm">Fundo vermelho claro se funcionando</p>
          </div>
          <div className="interaction-medium p-4 rounded-lg border-2">
            <h4 className="font-semibold">Interação Média</h4>
            <p className="text-sm">Fundo amarelo claro se funcionando</p>
          </div>
          <div className="interaction-low p-4 rounded-lg border-2">
            <h4 className="font-semibold">Interação Baixa</h4>
            <p className="text-sm">Fundo verde claro se funcionando</p>
          </div>
        </div>
      </div>

      {/* Status Classes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">📊 Classes de Status</h2>
        <div className="flex flex-wrap gap-4">
          <span className="status-active px-4 py-2 rounded-full text-sm font-medium">Status Ativo</span>
          <span className="status-inactive px-4 py-2 rounded-full text-sm font-medium">Status Inativo</span>
          <span className="status-pending px-4 py-2 rounded-full text-sm font-medium">Status Pendente</span>
        </div>
      </div>

      {/* Responsive Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">📱 Teste Responsivo</h2>
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6 rounded-lg">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium">
            Redimensione a tela: texto cresce de SM → BASE → LG → XL
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
            <div className="bg-white bg-opacity-20 p-2 rounded text-center">1 col</div>
            <div className="bg-white bg-opacity-20 p-2 rounded text-center">2 cols SM+</div>
            <div className="bg-white bg-opacity-20 p-2 rounded text-center">3 cols MD+</div>
            <div className="bg-white bg-opacity-20 p-2 rounded text-center">4 cols LG+</div>
          </div>
        </div>
      </div>

      {/* Animation Test */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🎬 Teste de Animações</h2>
        <div className="flex gap-4 justify-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full animate-bounce" title="Bounce"></div>
          <div className="w-12 h-12 bg-green-500 rounded-full animate-pulse" title="Pulse"></div>
          <div className="w-12 h-12 bg-yellow-500 rounded-full animate-spin" title="Spin"></div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">Se as formas estão animadas, as animações funcionam</p>
      </div>

      {/* Final Status */}
      <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-2xl">✅</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Status do Tailwind CSS</h3>
        <p className="text-lg text-gray-600 mb-4">
          Se você vê cores, espaçamentos, bordas arredondadas e animações, 
          <br />
          <strong className="text-green-600">o Tailwind CSS está funcionando perfeitamente!</strong>
        </p>
        <div className="flex justify-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Cores ✅
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Layout ✅
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            Componentes ✅
          </span>
        </div>
      </div>
    </div>
  )
}