import { useState, useEffect } from 'react'
import { Database, Search, Plus, Edit, Trash2, Clock, TrendingUp } from 'lucide-react'
import medicationCaptureService from '../services/medicationCaptureEnhanced'
import toast from 'react-hot-toast'

const DrugDatabase = () => {
  const [medications, setMedications] = useState([])
  const [filteredMedications, setFilteredMedications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState(null)
  const [captureStats, setCaptureStats] = useState(null)

  // Carregar medicamentos reais do banco de dados
  const loadMedications = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Carregando medicamentos do banco de dados...')
      
      // Carregar medicamentos detalhados
      const detailedResult = await medicationCaptureService.getDetailedMedications()
      
      // Carregar estatísticas
      const statsResult = await medicationCaptureService.getCaptureStats()
      
      if (detailedResult.success) {
        const medicationsWithFormattedData = detailedResult.medications.map(med => ({
          ...med,
          // Manter compatibilidade com o formato antigo
          contraindications: med.contraindications || [],
          side_effects: med.common_side_effects || [],
          interactions: med.important_interactions || [],
          dosage_form: med.dosage_forms?.[0] || 'Não especificado'
        }))
        
        setMedications(medicationsWithFormattedData)
        setFilteredMedications(medicationsWithFormattedData)
        console.log(`✅ ${medicationsWithFormattedData.length} medicamentos carregados`)
        
        if (medicationsWithFormattedData.length === 0) {
          toast.info('Nenhum medicamento capturado ainda. Faça algumas análises primeiro!')
        } else {
          toast.success(`${medicationsWithFormattedData.length} medicamentos carregados`)
        }
      } else {
        console.warn('⚠️ Erro ao carregar medicamentos:', detailedResult.message)
        setMedications([])
        setFilteredMedications([])
        toast.error('Erro ao carregar medicamentos do banco')
      }
      
      if (statsResult.success) {
        setCaptureStats(statsResult.stats)
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar medicamentos:', error)
      toast.error('Erro ao conectar com o banco de dados')
      setMedications([])
      setFilteredMedications([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMedications()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.active_ingredient && med.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (med.therapeutic_class && med.therapeutic_class.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredMedications(filtered)
    } else {
      setFilteredMedications(medications)
    }
  }, [searchTerm, medications])

  const handleAddMedication = () => {
    setShowAddForm(true)
    setEditingMedication(null)
  }

  const handleEditMedication = (medication) => {
    setEditingMedication(medication)
    setShowAddForm(true)
  }

  const handleDeleteMedication = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este medicamento?')) {
      setMedications(prev => prev.filter(med => med.id !== id))
      toast.success('Medicamento excluído com sucesso')
    }
  }

  const handleSaveMedication = (medicationData) => {
    if (editingMedication) {
      setMedications(prev => prev.map(med => 
        med.id === editingMedication.id ? { ...medicationData, id: editingMedication.id } : med
      ))
      toast.success('Medicamento atualizado com sucesso')
    } else {
      setMedications(prev => [...prev, { ...medicationData, id: Date.now() }])
      toast.success('Medicamento adicionado com sucesso')
    }
    setShowAddForm(false)
    setEditingMedication(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando medicamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Base de Medicamentos</h1>
            <p className="text-gray-600">
              Medicamentos capturados automaticamente das consultas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadMedications}
            className="btn btn-secondary flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Atualizar
          </button>
          <button
            onClick={handleAddMedication}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Manual
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {captureStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{captureStats.total_medications}</div>
            <div className="text-sm text-gray-600">Total de Medicamentos</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{captureStats.consultation_medications}</div>
            <div className="text-sm text-gray-600">Capturados da IA</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">{captureStats.total_consultations}</div>
            <div className="text-sm text-gray-600">Total de Consultas</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600">{captureStats.ai_enriched_medications}</div>
            <div className="text-sm text-gray-600">Com Dados da IA</div>
          </div>
        </div>
      )}

      {captureStats && captureStats.most_consulted_name !== 'Nenhum' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Medicamento mais consultado: {captureStats.most_consulted_name}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {captureStats.most_consulted_count}x
            </span>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Buscar por nome, princípio ativo ou classe terapêutica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{filteredMedications.length}</div>
          <div className="text-sm text-gray-600">Exibindo</div>
        </div>
      </div>

      {/* Lista de Medicamentos */}
      <div className="grid grid-cols-1 gap-6">
        {filteredMedications.length === 0 ? (
          <div className="card text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum medicamento encontrado' : 'Nenhum medicamento cadastrado'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Tente ajustar o termo de busca para encontrar medicamentos.'
                : 'Faça análises de medicamentos para popular a base automaticamente.'
              }
            </p>
          </div>
        ) : (
          filteredMedications.map((medication) => (
            <div key={medication.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                    {medication.source === 'consultation_capture' && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Capturado Auto
                      </span>
                    )}
                    {medication.active_ingredient && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        IA Enhanced
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{medication.active_ingredient || 'Princípio ativo não especificado'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                      {medication.therapeutic_class || 'Classe não especificada'}
                    </span>
                    {medication.consultation_count > 0 && (
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {medication.consultation_count}x consultado
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditMedication(medication)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMedication(medication.id)}
                    className="p-2 text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {/* Informações básicas */}
                <div>
                  <strong className="text-gray-700">Forma Farmacêutica:</strong>
                  <p className="text-gray-600 mt-1">{medication.dosage_form}</p>
                  {medication.mechanism_of_action && (
                    <>
                      <strong className="text-gray-700 mt-2 block">Mecanismo de Ação:</strong>
                      <p className="text-gray-600 mt-1 text-xs">{medication.mechanism_of_action}</p>
                    </>
                  )}
                </div>
                
                {/* Contraindicações */}
                <div>
                  <strong className="text-gray-700">Contraindicações:</strong>
                  <div className="mt-1 space-y-1">
                    {(medication.contraindications || []).slice(0, 3).map((contra, idx) => (
                      <span key={idx} className="inline-block bg-danger-50 text-danger-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                        {contra}
                      </span>
                    ))}
                    {(medication.contraindications || []).length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{(medication.contraindications || []).length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Interações */}
                <div>
                  <strong className="text-gray-700">Principais Interações:</strong>
                  <div className="mt-1 space-y-1">
                    {(medication.interactions || []).slice(0, 3).map((interaction, idx) => (
                      <span key={idx} className="inline-block bg-warning-50 text-warning-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                        {interaction}
                      </span>
                    ))}
                    {(medication.interactions || []).length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{(medication.interactions || []).length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações extras da IA */}
              {(medication.main_indications || medication.monitoring || medication.administration_instructions) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {medication.main_indications && (
                      <div>
                        <strong className="text-gray-700">Indicações:</strong>
                        <div className="mt-1">
                          {medication.main_indications.slice(0, 2).map((indication, idx) => (
                            <span key={idx} className="inline-block bg-green-50 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                              {indication}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {medication.monitoring && (
                      <div>
                        <strong className="text-gray-700">Monitoramento:</strong>
                        <div className="mt-1">
                          {medication.monitoring.slice(0, 2).map((monitor, idx) => (
                            <span key={idx} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                              {monitor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {medication.pharmacy_category && (
                      <div>
                        <strong className="text-gray-700">Categoria:</strong>
                        <p className="text-gray-600 mt-1">{medication.pharmacy_category}</p>
                      </div>
                    )}
                  </div>
                  
                  {medication.administration_instructions && (
                    <div className="mt-3">
                      <strong className="text-gray-700">Instruções de Administração:</strong>
                      <p className="text-gray-600 mt-1 text-xs">{medication.administration_instructions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Data de captura */}
              {medication.last_consulted_at && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Última consulta: {new Date(medication.last_consulted_at).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de Edição/Adição de Medicamento */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <MedicationForm
              medication={editingMedication}
              onSave={handleSaveMedication}
              onCancel={() => {
                setShowAddForm(false)
                setEditingMedication(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Componente do formulário de medicamento
const MedicationForm = ({ medication, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: medication?.name || '',
    active_ingredient: medication?.active_ingredient || '',
    therapeutic_class: medication?.therapeutic_class || '',
    mechanism_of_action: medication?.mechanism_of_action || '',
    main_indications: medication?.main_indications?.join(', ') || '',
    contraindications: medication?.contraindications?.join(', ') || '',
    common_side_effects: medication?.common_side_effects?.join(', ') || '',
    important_interactions: medication?.important_interactions?.join(', ') || '',
    dosage_forms: medication?.dosage_forms?.join(', ') || medication?.dosage_form || '',
    administration_instructions: medication?.administration_instructions || '',
    storage_conditions: medication?.storage_conditions || '',
    pharmacy_category: medication?.pharmacy_category || '',
    special_populations: {
      pregnancy: medication?.special_populations?.pregnancy || '',
      elderly: medication?.special_populations?.elderly || '',
      renal_impairment: medication?.special_populations?.renal_impairment || '',
      hepatic_impairment: medication?.special_populations?.hepatic_impairment || ''
    },
    monitoring: medication?.monitoring?.join(', ') || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Converter strings de volta para arrays onde necessário
    const processedData = {
      ...formData,
      main_indications: formData.main_indications.split(',').map(s => s.trim()).filter(s => s),
      contraindications: formData.contraindications.split(',').map(s => s.trim()).filter(s => s),
      common_side_effects: formData.common_side_effects.split(',').map(s => s.trim()).filter(s => s),
      important_interactions: formData.important_interactions.split(',').map(s => s.trim()).filter(s => s),
      dosage_forms: formData.dosage_forms.split(',').map(s => s.trim()).filter(s => s),
      monitoring: formData.monitoring.split(',').map(s => s.trim()).filter(s => s),
      dosage_form: formData.dosage_forms.split(',')[0]?.trim() || 'Não especificado'
    }
    
    onSave(processedData)
  }

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {medication ? 'Editar Medicamento' : 'Adicionar Medicamento'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informações Básicas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Medicamento *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Princípio Ativo
            </label>
            <input
              type="text"
              value={formData.active_ingredient}
              onChange={(e) => handleChange('active_ingredient', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe Terapêutica
            </label>
            <input
              type="text"
              value={formData.therapeutic_class}
              onChange={(e) => handleChange('therapeutic_class', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formas Farmacêuticas (separadas por vírgula)
            </label>
            <input
              type="text"
              value={formData.dosage_forms}
              onChange={(e) => handleChange('dosage_forms', e.target.value)}
              placeholder="Comprimido, Solução, Injetável"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Mecanismo de Ação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mecanismo de Ação
          </label>
          <textarea
            value={formData.mechanism_of_action}
            onChange={(e) => handleChange('mechanism_of_action', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Indicações (separadas por vírgula) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Principais Indicações (separadas por vírgula)
          </label>
          <textarea
            value={formData.main_indications}
            onChange={(e) => handleChange('main_indications', e.target.value)}
            rows="2"
            placeholder="Hipertensão, Angina, Insuficiência cardíaca"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contraindicações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraindicações (separadas por vírgula)
            </label>
            <textarea
              value={formData.contraindications}
              onChange={(e) => handleChange('contraindications', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Efeitos Adversos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Efeitos Adversos Comuns (separados por vírgula)
            </label>
            <textarea
              value={formData.common_side_effects}
              onChange={(e) => handleChange('common_side_effects', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Interações Importantes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interações Importantes (separadas por vírgula)
          </label>
          <textarea
            value={formData.important_interactions}
            onChange={(e) => handleChange('important_interactions', e.target.value)}
            rows="2"
            placeholder="Warfarina, Digoxina, Diuréticos"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instruções de Administração */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruções de Administração
            </label>
            <textarea
              value={formData.administration_instructions}
              onChange={(e) => handleChange('administration_instructions', e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Categoria Farmácia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria na Farmácia
            </label>
            <select
              value={formData.pharmacy_category}
              onChange={(e) => handleChange('pharmacy_category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecione...</option>
              <option value="Venda livre">Venda livre</option>
              <option value="Prescrição">Prescrição</option>
              <option value="Controlado">Controlado</option>
              <option value="Hospitalar">Hospitalar</option>
            </select>
          </div>
        </div>

        {/* Populações Especiais */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Populações Especiais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gravidez
              </label>
              <input
                type="text"
                value={formData.special_populations.pregnancy}
                onChange={(e) => handleChange('special_populations.pregnancy', e.target.value)}
                placeholder="Categoria B, contraindicado, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idosos
              </label>
              <input
                type="text"
                value={formData.special_populations.elderly}
                onChange={(e) => handleChange('special_populations.elderly', e.target.value)}
                placeholder="Ajuste de dose, cuidados especiais"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insuficiência Renal
              </label>
              <input
                type="text"
                value={formData.special_populations.renal_impairment}
                onChange={(e) => handleChange('special_populations.renal_impairment', e.target.value)}
                placeholder="Ajuste necessário, contraindicado"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insuficiência Hepática
              </label>
              <input
                type="text"
                value={formData.special_populations.hepatic_impairment}
                onChange={(e) => handleChange('special_populations.hepatic_impairment', e.target.value)}
                placeholder="Ajuste necessário, contraindicado"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md transition-colors"
          >
            {medication ? 'Atualizar' : 'Adicionar'} Medicamento
          </button>
        </div>
      </form>
    </div>
  )
}

export default DrugDatabase
