import { FileText, Shield, Users, AlertTriangle, Check, X, Scale, UserCheck } from 'lucide-react'
import SEO from '../components/SEO'

const TermsOfService = () => {
  return (
    <>
      <SEO 
        title="Termos de Uso - Portal de Verificação Medicamentosa"
        description="Termos de Uso do Portal de Verificação Medicamentosa. Conheça as condições para utilização de nossos serviços farmacêuticos e sistema de análise de interações."
        keywords="termos de uso, condições de uso, regulamento, políticas do site, uso responsável, farmácia clínica, CFF"
        canonicalUrl="https://portal-verificacao-medicamentosa.vercel.app/terms-of-service"
      />
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <FileText className="h-12 w-12 text-blue-200" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
            <p className="text-blue-100">
              Portal de Verificação Medicamentosa - Condições de Utilização do Sistema
            </p>
          </div>
        </div>
      </div>

      {/* Última atualização */}
      <div className="card border-green-200 bg-green-50">
        <div className="flex items-center gap-3 mb-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Última atualização: 14 de agosto de 2025</span>
        </div>
        <p className="text-sm text-green-700">
          Ao utilizar o Portal de Verificação Medicamentosa, você concorda com estes termos de uso.
          Leia atentamente antes de usar nossos serviços.
        </p>
      </div>

      {/* Seções dos termos */}
      <div className="space-y-6">
        
        {/* 1. Definições e Escopo */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">1. Definições e Escopo do Serviço</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">O que é o Portal de Verificação Medicamentosa</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sistema digital de apoio à decisão farmacêutica que utiliza inteligência artificial
                para análise de interações medicamentosas, baseado em evidências científicas documentadas.
                Destina-se exclusivamente a profissionais farmacêuticos e estudantes de farmácia.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Funcionalidades Incluídas:</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Análise de interações medicamentosas</li>
                  <li>• Geração de relatórios farmacêuticos</li>
                  <li>• Base de dados de medicamentos</li>
                  <li>• Histórico de consultas</li>
                  <li>• Exportação de dados</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">Limitações do Serviço:</h4>
                <ul className="text-amber-700 space-y-1 text-sm">
                  <li>• Não substitui julgamento profissional</li>
                  <li>• Não armazena dados de pacientes</li>
                  <li>• Requer validação por farmacêutico</li>
                  <li>• Baseado em evidências disponíveis</li>
                  <li>• Sujeito a atualizações constantes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Elegibilidade e Cadastro */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">2. Elegibilidade e Condições de Uso</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Usuários Autorizados:</h3>
              <ul className="text-green-700 space-y-1 text-sm">
                <li>• <strong>Farmacêuticos registrados:</strong> Com CRF ativo e em dia</li>
                <li>• <strong>Estudantes de Farmácia:</strong> Com comprovação de matrícula</li>
                <li>• <strong>Residentes em Farmácia:</strong> Com programa reconhecido</li>
                <li>• <strong>Pesquisadores acadêmicos:</strong> Em farmacologia/farmácia clínica</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">Uso Proibido para:</h3>
              <ul className="text-red-700 space-y-1 text-sm">
                <li>• Prescrição direta a pacientes sem supervisão</li>
                <li>• Substituição de consulta farmacêutica presencial</li>
                <li>• Diagnóstico ou tratamento de doenças</li>
                <li>• Orientação direta a pacientes leigos</li>
                <li>• Fins comerciais não autorizados</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Responsabilidades do Usuário */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">3. Responsabilidades do Usuário</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Compromissos Profissionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">Usar informações precisas e atualizadas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">Validar resultados com conhecimento clínico</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">Manter sigilo profissional quando aplicável</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">Atualizar-se sobre limitações do sistema</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-sm text-gray-700">Não substituir julgamento profissional</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-sm text-gray-700">Não compartilhar credenciais de acesso</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-sm text-gray-700">Não usar para fins não farmacêuticos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-sm text-gray-700">Não ignorar contraindicações conhecidas</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Uso Ético e Responsável</h3>
              <p className="text-yellow-700 text-sm">
                O usuário compromete-se a utilizar o sistema sempre de forma ética, seguindo
                as diretrizes do Conselho Federal de Farmácia (CFF) e demais órgãos reguladores,
                priorizando sempre a segurança e bem-estar dos pacientes.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Limitações e Disclaimers */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">4. Limitações e Avisos Importantes</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">⚠️ AVISO CRÍTICO DE RESPONSABILIDADE</h3>
              <p className="text-red-700 text-sm font-medium leading-relaxed">
                Este sistema é uma FERRAMENTA DE APOIO e não substitui o conhecimento, experiência
                e julgamento clínico do farmacêutico. Todas as análises devem ser interpretadas
                por profissional qualificado antes de qualquer tomada de decisão clínica.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Limitações Técnicas:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• IA baseada em dados disponíveis até a data</li>
                  <li>• Possibilidade de falsos positivos/negativos</li>
                  <li>• Dependência da qualidade dos dados inseridos</li>
                  <li>• Atualizações periódicas podem alterar resultados</li>
                  <li>• Nem todas as interações podem estar catalogadas</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Limitações Clínicas:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Não considera condições individuais do paciente</li>
                  <li>• Não avalia aderência ao tratamento</li>
                  <li>• Não substitui monitoramento clínico</li>
                  <li>• Não considera fatores genéticos específicos</li>
                  <li>• Requer correlação com exames laboratoriais</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Propriedade Intelectual */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">5. Propriedade Intelectual e Uso de Conteúdo</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Direitos do Portal</h3>
              <p className="text-gray-600 text-sm mb-3">
                Todo o conteúdo, algoritmos, interface e funcionalidades são protegidos por direitos autorais.
                O uso é limitado aos fins profissionais farmacêuticos permitidos nestes termos.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-1">Uso Permitido:</h4>
                  <ul className="text-green-700 space-y-1 text-xs">
                    <li>• Consultas farmacêuticas profissionais</li>
                    <li>• Geração de relatórios para trabalho</li>
                    <li>• Estudos acadêmicos com atribuição</li>
                    <li>• Ensino em farmácia clínica</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-1">Uso Proibido:</h4>
                  <ul className="text-red-700 space-y-1 text-xs">
                    <li>• Reprodução ou distribuição comercial</li>
                    <li>• Engenharia reversa dos algoritmos</li>
                    <li>• Criação de sistemas concorrentes</li>
                    <li>• Venda de relatórios ou análises</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Fontes Científicas</h3>
              <p className="text-gray-600 text-sm">
                As informações farmacológicas são baseadas em literatura científica peer-reviewed.
                Sempre que possível, as fontes são citadas nos relatórios gerados.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Disponibilidade e Suporte */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Check className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">6. Disponibilidade do Serviço e Suporte</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Disponibilidade</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Meta: 99,9% de uptime</li>
                  <li>• Manutenções programadas</li>
                  <li>• Notificação prévia de interrupções</li>
                  <li>• Backup e recuperação automática</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Suporte Técnico</h4>
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• Email: suporte@portal.com.br</li>
                  <li>• Resposta em até 24h úteis</li>
                  <li>• Chat online em horário comercial</li>
                  <li>• FAQ e documentação online</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">Atualizações</h4>
                <ul className="text-purple-700 space-y-1 text-sm">
                  <li>• Base de dados atualizada mensalmente</li>
                  <li>• Melhorias de IA contínuas</li>
                  <li>• Notificações de mudanças importantes</li>
                  <li>• Feedback dos usuários considerado</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-2">Interrupções e Limitações</h3>
              <p className="text-amber-700 text-sm">
                Nos reservamos o direito de interromper temporariamente o serviço para manutenção,
                atualizações de segurança ou questões técnicas. Sempre que possível, notificaremos
                com antecedência e minimizaremos o tempo de inatividade.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Responsabilidade e Limitação de Responsabilidade */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">7. Limitação de Responsabilidade</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">Limitações Expressas</h3>
              <p className="text-red-700 text-sm leading-relaxed">
                O Portal de Verificação Medicamentosa não se responsabiliza por decisões clínicas
                tomadas com base exclusivamente nas informações fornecidas pelo sistema.
                A responsabilidade final por qualquer decisão farmacoterapêutica é sempre
                do profissional farmacêutico qualificado.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Exclusões de Responsabilidade:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Erro humano na interpretação dos resultados</li>
                  <li>• Informações incompletas fornecidas pelo usuário</li>
                  <li>• Falhas temporárias do sistema ou conectividade</li>
                  <li>• Atualizações na literatura científica não incorporadas</li>
                  <li>• Casos clínicos complexos não cobertos pela base</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Responsabilidade do Usuário:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Validação independente dos resultados</li>
                  <li>• Consideração do contexto clínico completo</li>
                  <li>• Atualização contínua do conhecimento</li>
                  <li>• Seguimento das diretrizes profissionais</li>
                  <li>• Comunicação adequada com pacientes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Modificação dos Termos */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">8. Modificação dos Termos</h2>
          </div>
          
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Estes termos podem ser modificados para refletir mudanças no serviço, regulamentações
              ou melhores práticas. Quando houver alterações substanciais:
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Notificação por email ou no sistema com 30 dias de antecedência</li>
                <li>• Destaque das principais mudanças</li>
                <li>• Período para revisão e questionamentos</li>
                <li>• Opção de descontinuar uso se não concordar</li>
                <li>• Versões anteriores disponíveis para consulta histórica</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contato e Jurisdição */}
        <section className="card border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-blue-800">Contato e Jurisdição</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Contato Legal</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p>📧 juridico@portal-medicamentoso.com.br</p>
                <p>📞 (11) 99999-9999</p>
                <p>📍 São Paulo - SP, Brasil</p>
                <p>🕒 Segunda a Sexta: 9h às 18h</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Jurisdição e Lei Aplicável</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p>🏛️ Foro: São Paulo - SP</p>
                <p>⚖️ Lei brasileira aplicável</p>
                <p>🏥 Regulamentação: CFF/ANVISA</p>
                <p>🛡️ LGPD em vigor</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer Final */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Disclaimer Farmacêutico Final</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                <strong>IMPORTANTE:</strong> Este sistema é destinado exclusivamente para apoio à prática
                farmacêutica profissional. Não é um dispositivo médico, não realiza diagnósticos
                e não substitui a consulta, avaliação ou supervisão de farmacêutico clínico qualificado.
                Sempre priorize a segurança do paciente e siga as diretrizes éticas da profissão.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default TermsOfService
