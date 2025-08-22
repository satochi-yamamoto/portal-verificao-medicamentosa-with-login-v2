import { Link } from 'react-router-dom'
import { Pill, Shield, FileText, Heart, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-gray-100 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Pill className="h-7 w-7 text-primary-300" />
              <span className="text-lg font-bold text-white">Portal Medicamentoso</span>
            </div>
            <p className="text-sm text-primary-100 leading-relaxed">
              Sistema inteligente de análise de interações medicamentosas baseado em evidências científicas.
              Ferramenta profissional para farmacêuticos clínicos.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-primary-200 hover:text-primary-100 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-primary-200 hover:text-primary-100 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">Navegação</h3>
            <nav className="space-y-1">
              <Link to="/" className="block text-sm text-primary-100 hover:text-white transition-colors">
                Página Inicial
              </Link>
              <Link to="/drug-analysis" className="block text-sm text-primary-100 hover:text-white transition-colors">
                Análise de Medicamentos
              </Link>
              <Link to="/drug-interactions" className="block text-sm text-primary-100 hover:text-white transition-colors">
                Interações Medicamentosas
              </Link>
              <Link to="/drug-database" className="block text-sm text-primary-100 hover:text-white transition-colors">
                Base de Medicamentos
              </Link>
              <Link to="/reports" className="block text-sm text-primary-100 hover:text-white transition-colors">
                Relatórios
              </Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">Legal & Privacidade</h3>
            <nav className="space-y-1">
              <Link to="/privacidade" className="flex items-center gap-2 text-sm text-primary-100 hover:text-white transition-colors">
                <Shield className="h-3 w-3" />
                Política de Privacidade
              </Link>
              <Link to="/termos" className="flex items-center gap-2 text-sm text-primary-100 hover:text-white transition-colors">
                <FileText className="h-3 w-3" />
                Termos de Uso
              </Link>
              <button 
                onClick={() => localStorage.removeItem('cookie-consent') || window.location.reload()} 
                className="flex items-center gap-2 text-sm text-primary-100 hover:text-white transition-colors text-left"
              >
                🍪 Configurar Cookies
              </button>
              <a href="/privacidade#cookies" className="block text-sm text-primary-100 hover:text-white transition-colors">
                LGPD - Proteção de Dados
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">Contato</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-primary-100">
                <Mail className="h-3 w-3" />
                <span>contato@portal-medicamentoso.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-100">
                <Phone className="h-3 w-3" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-100">
                <MapPin className="h-3 w-3" />
                <span>São Paulo - SP, Brasil</span>
              </div>
            </div>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium text-white mb-1">Suporte Técnico</h4>
              <p className="text-xs text-primary-100">
                Segunda a Sexta: 9h às 18h<br/>
                Resposta em até 24h úteis
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-primary-800 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-sm text-primary-100">
              © 2025 Portal de Verificação Medicamentosa. Todos os direitos reservados.
            </div>

            {/* Professional notice */}
            <div className="flex items-center gap-2 text-xs text-primary-200 bg-primary-800 px-3 py-1 rounded-lg">
              <Heart className="h-3 w-3 text-red-300" />
              <span>Desenvolvido para farmacêuticos clínicos</span>
            </div>

            {/* Regulatory info */}
            <div className="text-xs text-primary-200 text-center">
              Conforme diretrizes do CFF<br/>
              LGPD e ISO 27001 compatível
            </div>
          </div>
        </div>

        {/* Important disclaimer */}
        <div className="border-t border-primary-800 py-4">
          <div className="bg-amber-900/30 border border-amber-700/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-300 mb-1">Aviso Profissional Importante</h4>
                <p className="text-xs text-amber-200 leading-relaxed">
                  Este sistema é uma ferramenta de apoio à decisão farmacêutica e não substitui o julgamento 
                  clínico profissional. Todas as análises devem ser validadas por farmacêutico qualificado. 
                  Uso restrito a profissionais de farmácia registrados no CRF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
