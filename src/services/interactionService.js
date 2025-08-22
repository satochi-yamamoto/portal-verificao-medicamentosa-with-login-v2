import { supabase } from '../lib/supabase.js';

// Serviço para interações medicamentosas baseado em dados reais
const interactionService = {
  // Buscar todas as interações baseadas nos medicamentos do banco
  async getAllInteractions() {
    try {
      console.log('🔍 Buscando medicamentos com interações...');
      
      // Primeiro, buscar medicamentos que têm informações de interações
      const { data: medications, error: medError } = await supabase
        .from('medications')
        .select('id, name, important_interactions, contraindications, side_effects')
        .not('important_interactions', 'is', null)
        .order('name');

      if (medError) {
        console.error('❌ Erro ao buscar medicamentos:', medError);
        throw medError;
      }

      console.log(`✅ Encontrados ${medications?.length || 0} medicamentos com dados de interações`);

      if (!medications || medications.length === 0) {
        console.log('⚠️ Nenhum medicamento com interações encontrado');
        return [];
      }

      // Converter as informações de interações em um formato estruturado
      const interactions = [];
      
      for (let i = 0; i < medications.length; i++) {
        const medA = medications[i];
        
        // Procurar por outros medicamentos que possam interagir
        for (let j = i + 1; j < medications.length; j++) {
          const medB = medications[j];
          
          // Verificar se há menção de interação entre os medicamentos
          const interactionFound = this.findInteractionBetween(medA, medB);
          
          if (interactionFound) {
            interactions.push({
              id: `${medA.id}_${medB.id}`,
              medication_a: medA.name,
              medication_b: medB.name,
              medication_a_id: medA.id,
              medication_b_id: medB.id,
              severity_level: interactionFound.severity,
              description: interactionFound.description,
              clinical_significance: interactionFound.clinical_significance,
              mechanism: interactionFound.mechanism,
              management: interactionFound.management,
              created_at: new Date().toISOString()
            });
          }
        }
      }

      console.log(`🔗 Identificadas ${interactions.length} interações potenciais`);
      return interactions;
      
    } catch (error) {
      console.error('❌ Erro geral no getAllInteractions:', error);
      throw error;
    }
  },

  // Buscar interações de medicamentos específicos
  async getInteractionsForMedications(medicationNames) {
    try {
      const allInteractions = await this.getAllInteractions();
      
      return allInteractions.filter(interaction => 
        medicationNames.some(name => 
          interaction.medication_a.toLowerCase().includes(name.toLowerCase()) ||
          interaction.medication_b.toLowerCase().includes(name.toLowerCase())
        )
      );
    } catch (error) {
      console.error('Erro ao buscar interações específicas:', error);
      throw error;
    }
  },

  // Buscar estatísticas de interações
  async getInteractionStats() {
    try {
      console.log('📊 Calculando estatísticas de interações...');
      const interactions = await this.getAllInteractions();
      
      const stats = {
        total: interactions.length,
        severe: interactions.filter(i => i.severity_level === 'alta' || i.severity_level === 'grave').length,
        moderate: interactions.filter(i => i.severity_level === 'moderada' || i.severity_level === 'média').length,
        mild: interactions.filter(i => i.severity_level === 'leve' || i.severity_level === 'baixa').length,
        mostCommonMedications: this.getMostCommonMedications(interactions)
      };

      console.log(`📈 Estatísticas calculadas: Total: ${stats.total}, Graves: ${stats.severe}, Moderadas: ${stats.moderate}, Leves: ${stats.mild}`);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      // Retornar estatísticas vazias em caso de erro
      return {
        total: 0,
        severe: 0,
        moderate: 0,
        mild: 0,
        mostCommonMedications: []
      };
    }
  },

  // Função auxiliar para encontrar interações entre dois medicamentos
  findInteractionBetween(medA, medB) {
    // Tratar os dados de interações que podem ser arrays ou strings
    let medAInteractions = [];
    let medBInteractions = [];
    
    // Processar interações do medicamento A
    if (Array.isArray(medA.important_interactions)) {
      medAInteractions = medA.important_interactions.map(i => i.toLowerCase());
    } else if (typeof medA.important_interactions === 'string') {
      medAInteractions = [medA.important_interactions.toLowerCase()];
    }
    
    // Processar interações do medicamento B
    if (Array.isArray(medB.important_interactions)) {
      medBInteractions = medB.important_interactions.map(i => i.toLowerCase());
    } else if (typeof medB.important_interactions === 'string') {
      medBInteractions = [medB.important_interactions.toLowerCase()];
    }

    const medAName = medA.name.toLowerCase();
    const medBName = medB.name.toLowerCase();

    // Verificar se há interações comuns ou se um medicamento menciona categorias do outro
    const commonInteractions = medAInteractions.filter(intA => 
      medBInteractions.some(intB => 
        intA.includes(intB) || intB.includes(intA) || 
        intA === intB
      )
    );

    // Verificar se um medicamento menciona especificamente o outro
    const directMention = medAInteractions.some(int => int.includes(medBName)) ||
                         medBInteractions.some(int => int.includes(medAName));

    if (commonInteractions.length > 0 || directMention) {
      // Determinar severidade baseada no tipo de interação
      let severity = 'moderada';
      let description = `Possível interação entre ${medA.name} e ${medB.name}`;
      let mechanism = 'Interação identificada através de categorias farmacológicas comuns';
      let clinical_significance = 'Monitoramento recomendado';
      let management = 'Consulte um profissional de saúde';

      // Análise de severidade baseada nas categorias de interação
      const highRiskCategories = ['anticoagulantes', 'lítio', 'digoxina', 'varfarina'];
      const moderateRiskCategories = ['anti-inflamatórios', 'diuréticos', 'álcool'];
      
      const allInteractions = [...medAInteractions, ...medBInteractions, ...commonInteractions];
      const interactionText = allInteractions.join(' ').toLowerCase();
      
      if (highRiskCategories.some(cat => interactionText.includes(cat))) {
        severity = 'alta';
        clinical_significance = 'Interação clinicamente significativa - monitoramento rigoroso necessário';
        management = 'Monitorar parâmetros específicos e ajustar doses conforme necessário';
        
        if (interactionText.includes('anticoagulantes')) {
          description = `Ambos ${medA.name} e ${medB.name} podem afetar a coagulação sanguínea`;
          mechanism = 'Potencialização dos efeitos anticoagulantes';
        } else if (interactionText.includes('lítio')) {
          description = `Possível alteração dos níveis séricos de lítio com ${medA.name} e ${medB.name}`;
          mechanism = 'Alteração da excreção renal ou ligação proteica';
        }
      } else if (moderateRiskCategories.some(cat => interactionText.includes(cat))) {
        severity = 'moderada';
        clinical_significance = 'Interação requer monitoramento';
        management = 'Monitorar sinais e sintomas, ajustar dose se necessário';
        
        if (interactionText.includes('anti-inflamatórios')) {
          description = `${medA.name} e ${medB.name} são anti-inflamatórios - risco de potencialização de efeitos`;
          mechanism = 'Somatório de efeitos anti-inflamatórios e possível toxicidade gastrointestinal';
        } else if (interactionText.includes('álcool')) {
          description = `${medA.name} e ${medB.name} podem ter interação com álcool`;
          mechanism = 'Potencialização de efeitos depressores ou hepatotóxicos';
        }
      } else {
        severity = 'leve';
        clinical_significance = 'Interação de baixo risco clínico';
        management = 'Monitoramento básico recomendado';
      }

      // Descrição mais específica baseada nas interações comuns
      if (commonInteractions.length > 0) {
        description = `${medA.name} e ${medB.name} compartilham interações com: ${commonInteractions.join(', ')}`;
      }

      return {
        severity,
        description,
        mechanism,
        clinical_significance,
        management
      };
    }

    return null;
  },

  // Extrair contexto da interação
  extractContext(text, medicationName) {
    const sentences = text.split(/[.!?]+/);
    const relevantSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(medicationName.toLowerCase())
    );
    
    return relevantSentence ? relevantSentence.trim() : null;
  },

  // Obter medicamentos mais comuns nas interações
  getMostCommonMedications(interactions) {
    const medicationCount = {};
    
    interactions.forEach(interaction => {
      medicationCount[interaction.medication_a] = (medicationCount[interaction.medication_a] || 0) + 1;
      medicationCount[interaction.medication_b] = (medicationCount[interaction.medication_b] || 0) + 1;
    });

    return Object.entries(medicationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  },

  // Buscar medicamentos com mais interações
  async getMedicationsWithMostInteractions() {
    try {
      const { data: medications, error } = await supabase
        .from('medications')
        .select('name, important_interactions')
        .not('important_interactions', 'is', null)
        .order('name');

      if (error) throw error;

      // Calcular score de interações para cada medicamento
      const medicationScores = medications.map(med => {
        const interactionText = med.important_interactions || '';
        const interactionCount = (interactionText.match(/,/g) || []).length + 1;
        const highRiskScore = (interactionText.match(/grave|severa|perigosa|contraindicado/gi) || []).length * 3;
        const moderateRiskScore = (interactionText.match(/cuidado|atenção|monitorar/gi) || []).length * 2;
        
        return {
          name: med.name,
          interactionScore: interactionCount + highRiskScore + moderateRiskScore,
          interactionText: interactionText.substring(0, 100) + '...'
        };
      });

      return medicationScores
        .sort((a, b) => b.interactionScore - a.interactionScore)
        .slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar medicamentos com mais interações:', error);
      throw error;
    }
  }
};

export default interactionService;
