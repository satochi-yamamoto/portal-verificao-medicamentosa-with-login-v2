const InteractionCard = ({ interaction, severity }) => {
  const getSeverityColor = (level) => {
    switch (level) {
      case 'major':
      case 'alta':
        return 'bg-danger-50 border-danger-200 text-danger-800'
      case 'moderate':
      case 'moderada':
        return 'bg-warning-50 border-warning-200 text-warning-800'
      case 'minor':
      case 'baixa':
        return 'bg-success-50 border-success-200 text-success-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getSeverityIcon = (level) => {
    switch (level) {
      case 'major':
      case 'alta':
        return '🔴'
      case 'moderate':
      case 'moderada':
        return '🟡'
      case 'minor':
      case 'baixa':
        return '🟢'
      default:
        return '⚪'
    }
  }

  return (
    <div className={`card border-l-4 ${getSeverityColor(severity)}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {getSeverityIcon(severity)}
            {interaction.medications || 'Interação Medicamentosa'}
          </h3>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}>
            Severidade: {severity || 'Não especificada'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        {interaction.mechanism && (
          <div>
            <strong className="text-gray-700">Mecanismo:</strong>
            <p className="text-gray-600 mt-1">{interaction.mechanism}</p>
          </div>
        )}
        
        {interaction.clinicalEffect && (
          <div>
            <strong className="text-gray-700">Efeito Clínico:</strong>
            <p className="text-gray-600 mt-1">{interaction.clinicalEffect}</p>
          </div>
        )}
        
        {interaction.management && (
          <div>
            <strong className="text-gray-700">Manejo Recomendado:</strong>
            <p className="text-gray-600 mt-1">{interaction.management}</p>
          </div>
        )}
        
        {interaction.monitoring && (
          <div>
            <strong className="text-gray-700">Monitoramento:</strong>
            <p className="text-gray-600 mt-1">{interaction.monitoring}</p>
          </div>
        )}
        
        {interaction.evidenceLevel && (
          <div>
            <strong className="text-gray-700">Nível de Evidência:</strong>
            <span className="ml-2 text-gray-600">{interaction.evidenceLevel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default InteractionCard
