import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertTriangle, Cookie, BarChart3 } from 'lucide-react'
import SEO from '../components/SEO'

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Política de Privacidade"
        description="Política de privacidade do Portal de Verificação Medicamentosa em conformidade com a LGPD e políticas de Analytics/ADS"
        keywords="política de privacidade, proteção de dados, LGPD, privacidade online, dados pessoais, farmácia clínica, segurança de dados, cookies, analytics"
        canonicalUrl="https://portal-verificacao-medicamentosa.vercel.app/privacidade"
        enableAnalytics={true}
        enableAds={false}
      />
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <Shield className="h-12 w-12 text-primary-200" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-primary-100">
              Portal de Verificação Medicamentosa - Proteção de Dados e Privacidade
            </p>
          </div>
        </div>
      </div>

      {/* Última atualização */}
      <div className="card border-blue-200 bg-blue-50">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800">Última atualização: 14 de agosto de 2025</span>
        </div>
        <p className="text-sm text-blue-700">
          Esta política de privacidade descreve como coletamos, usamos e protegemos suas informações
          ao utilizar o Portal de Verificação Medicamentosa.
        </p>
      </div>

      {/* Seções da política */}
      <div className="space-y-6">
        
        {/* 1. Informações que Coletamos */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">1. Informações que Coletamos</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Dados de Consultas Farmacêuticas</h3>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Medicamentos consultados e suas dosagens</li>
                <li>• Resultados de análises de interações medicamentosas</li>
                <li>• Relatórios gerados pelo sistema</li>
                <li>• Histórico de consultas realizadas</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Dados Técnicos</h3>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Endereço IP e informações de navegador</li>
                <li>• Dados de uso da aplicação e navegação</li>
                <li>• Logs de sistema para monitoramento de qualidade</li>
                <li>• Cookies técnicos necessários para funcionamento</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Dados Profissionais (Quando Aplicável)</h3>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Identificação profissional (CRF, quando fornecido)</li>
                <li>• Instituição de trabalho (quando informado)</li>
                <li>• Especializações e áreas de atuação</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Como Usamos suas Informações */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">2. Como Usamos suas Informações</h2>
          </div>
          
          <div className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Finalidades Principais:</h3>
              <ul className="text-green-700 space-y-1 ml-4">
                <li>• Fornecer análises de interações medicamentosas</li>
                <li>• Gerar relatórios farmacêuticos detalhados</li>
                <li>• Manter histórico de consultas para referência</li>
                <li>• Melhorar a qualidade das análises através de IA</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Finalidades Secundárias:</h3>
              <ul className="text-blue-700 space-y-1 ml-4">
                <li>• Análise estatística para melhoria do sistema</li>
                <li>• Monitoramento de performance e qualidade</li>
                <li>• Desenvolvimento de novas funcionalidades</li>
                <li>• Suporte técnico e resolução de problemas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Proteção de Dados */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">3. Proteção e Segurança dos Dados</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Medidas Técnicas</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>• Armazenamento seguro no Supabase (PostgreSQL)</li>
                <li>• Controle de acesso baseado em roles (RLS)</li>
                <li>• Backup automático e redundância</li>
                <li>• Monitoramento contínuo de segurança</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Medidas Organizacionais</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Acesso restrito por necessidade</li>
                <li>• Auditoria regular de acessos</li>
                <li>• Treinamento em proteção de dados</li>
                <li>• Políticas internas de segurança</li>
                <li>• Resposta rápida a incidentes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Compartilhamento de Dados */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">4. Compartilhamento de Informações</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">Não Compartilhamos:</h3>
              <p className="text-red-700 text-sm">
                Seus dados de consultas farmacêuticas e medicamentos NUNCA são compartilhados com terceiros
                para fins comerciais, publicitários ou não relacionados ao funcionamento do sistema.
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Serviços Técnicos Essenciais:</h3>
              <ul className="text-yellow-700 space-y-1 text-sm ml-4">
                <li>• <strong>OpenAI:</strong> Para análises de interações (dados anonimizados)</li>
                <li>• <strong>Supabase:</strong> Para armazenamento seguro de dados</li>
                <li>• <strong>Vercel:</strong> Para hospedagem da aplicação</li>
                <li>• <strong>Google Analytics:</strong> Para métricas de uso (dados agregados)</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Situações Legais:</h3>
              <p className="text-gray-600 text-sm">
                Podemos compartilhar informações apenas quando legalmente obrigatório ou para proteger
                direitos, propriedade ou segurança dos usuários.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Seus Direitos */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">5. Seus Direitos (LGPD)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Direitos Garantidos:</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• <strong>Acesso:</strong> Saber quais dados temos sobre você</li>
                <li>• <strong>Correção:</strong> Corrigir dados incorretos</li>
                <li>• <strong>Exclusão:</strong> Solicitar remoção de dados</li>
                <li>• <strong>Portabilidade:</strong> Exportar seus dados</li>
                <li>• <strong>Oposição:</strong> Contestar o tratamento</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Como Exercer:</h3>
              <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                <p className="text-primary-700 text-sm mb-2">
                  Para exercer seus direitos, entre em contato:
                </p>
                <p className="text-primary-800 text-sm font-medium">
                  📧 privacidade@portal-medicamentoso.com.br<br/>
                  📞 (11) 99999-9999<br/>
                  ⏱️ Resposta em até 15 dias úteis
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Retenção de Dados */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">6. Retenção de Dados</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Consultas farmacêuticas</span>
              <span className="text-sm text-gray-600">5 anos (fins científicos e histórico)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Relatórios gerados</span>
              <span className="text-sm text-gray-600">3 anos (referência profissional)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Logs técnicos</span>
              <span className="text-sm text-gray-600">1 ano (monitoramento e segurança)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Dados de uso</span>
              <span className="text-sm text-gray-600">2 anos (melhoria do sistema)</span>
            </div>
          </div>
        </section>

        {/* 7. Cookies e Tecnologias */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">7. Cookies e Tecnologias Similares</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Cookies Essenciais (Sempre Ativos)</h3>
              <p className="text-gray-600 text-sm mb-2">
                Necessários para o funcionamento básico da aplicação:
              </p>
              <ul className="text-gray-600 space-y-1 text-sm ml-4">
                <li>• Autenticação e sessão do usuário</li>
                <li>• Preferências de interface e configurações</li>
                <li>• Segurança e prevenção de ataques</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Cookies Analíticos (Opcional - Requer Consentimento)</h3>
              <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-2">
                <p className="text-blue-800 text-sm font-medium">🔍 Google Analytics 4 - Configuração LGPD</p>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Para entender como o sistema é usado e melhorar a experiência (somente com seu consentimento):
              </p>
              <ul className="text-gray-600 space-y-1 text-sm ml-4">
                <li>• Google Analytics com anonimização de IP (art. 12, LGPD)</li>
                <li>• Desativação de sinais de publicidade personalizada</li>
                <li>• Dados agregados e não identificáveis individualmente</li>
                <li>• Métricas de performance da aplicação</li>
                <li>• Análise de funcionalidades mais utilizadas</li>
                <li>• Retenção máxima: 24 meses (configurável)</li>
              </ul>
              
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">
                  <strong>✓ Proteções LGPD Implementadas:</strong><br/>
                  • IP anonimizado | • Consentimento explícito | • Dados não compartilhados | • Opt-out disponível
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Política para Publicidade (ADS)</h3>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>🚫 Marketing Desabilitado:</strong> Para conteúdo médico/farmacêutico, 
                  não utilizamos cookies de marketing, remarketing ou publicidade direcionada, 
                  conforme boas práticas para aplicações de saúde.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7.1. Controle de Cookies e Consentimento LGPD */}
        <section className="card border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-blue-800">7.1. Controle de Cookies e Consentimento LGPD</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Seu Controle Total</h3>
              <ul className="text-blue-700 space-y-1 text-sm ml-4">
                <li>• <strong>Consentimento Granular:</strong> Escolha quais tipos de cookies aceitar</li>
                <li>• <strong>Alteração a Qualquer Momento:</strong> Modifique suas preferências</li>
                <li>• <strong>Transparência Total:</strong> Saiba exatamente o que cada cookie faz</li>
                <li>• <strong>Revogação Simples:</strong> Retire consentimento com um clique</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Como Gerenciar Cookies</h3>
              <ol className="text-gray-600 space-y-2 text-sm ml-4 list-decimal">
                <li><strong>Banner de Consentimento:</strong> Aparece na primeira visita</li>
                <li><strong>Configurações do Site:</strong> Acesse "Preferências de Cookie" no rodapé</li>
                <li><strong>Navegador:</strong> Configure diretamente nas configurações do browser</li>
                <li><strong>Política de Opt-out:</strong> Desative Google Analytics individualmente</li>
              </ol>
            </div>
          </div>
        </section>

        {/* 7.2. Analytics e Conformidade */}
        <section className="card border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-green-800">7.2. Analytics e Conformidade com LGPD</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800 mb-2">✓ Garantias de Privacidade</h3>
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• Anonimização de IP obrigatória</li>
                  <li>• Dados agregados e não identificáveis</li>
                  <li>• Sem compartilhamento com terceiros para marketing</li>
                  <li>• Consentimento explícito e documentado</li>
                  <li>• Retenção limitada e configurável</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">📊 Dados Coletados (com consentimento)</h3>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Páginas visitadas (sem dados pessoais)</li>
                  <li>• Tempo de permanência nas seções</li>
                  <li>• Funcionalidades mais utilizadas</li>
                  <li>• Performance e erros técnicos</li>
                  <li>• Origem geográfica (país/região)</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">⚠️ Importante - Dados Médicos</h3>
              <p className="text-yellow-700 text-sm">
                <strong>Nenhum dado de consulta medicamentosa é enviado para o Google Analytics.</strong> 
                As informações sobre medicamentos, dosagens, interações e relatórios permanecem 
                estritamente em nossos servidores seguros e nunca são compartilhadas com serviços de analytics.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Mudanças na Política */}
        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">8. Alterações nesta Política</h2>
          </div>
          
          <div className="space-y-3">
            <p className="text-gray-600">
              Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas
              ou por exigências legais. Quando isso acontecer:
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Notificaremos sobre mudanças significativas</li>
                <li>• A data de "Última atualização" será modificada</li>
                <li>• Versões anteriores ficarão disponíveis para consulta</li>
                <li>• Usuários terão prazo para revisar as alterações</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="card border-primary-200 bg-primary-50">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-primary-800">Contato - Proteção de Dados</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-primary-800 mb-2">Encarregado de Dados (DPO)</h3>
              <div className="space-y-1 text-sm text-primary-700">
                <p>📧 dpo@portal-medicamentoso.com.br</p>
                <p>📞 (11) 99999-9999</p>
                <p>📱 WhatsApp: (11) 98888-8888</p>
                <p>🕒 Seg-Sex: 9h às 18h</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-800 mb-2">Suporte Técnico</h3>
              <div className="space-y-1 text-sm text-primary-700">
                <p>📧 suporte@portal-medicamentoso.com.br</p>
                <p>💬 Chat online: portal-medicamentoso.com.br</p>
                <p>🎫 Sistema de tickets disponível</p>
                <p>⚡ Resposta em até 24h úteis</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Aviso Importante sobre Dados Médicos</h4>
              <p className="text-sm text-amber-700">
                Este sistema não armazena dados de pacientes ou informações médicas sensíveis. 
                Focamos apenas em análises de medicamentos para fins de consulta farmacêutica profissional. 
                Sempre consulte um farmacêutico clínico qualificado para decisões clínicas.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default PrivacyPolicy
