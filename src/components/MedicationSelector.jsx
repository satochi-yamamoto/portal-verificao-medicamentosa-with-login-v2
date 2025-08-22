import { useState } from 'react'
import { X } from 'lucide-react'

const MedicationSelector = ({ selectedMedications, onMedicationAdd, onMedicationRemove }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dosage, setDosage] = useState('')

  // Lista de medicamentos baseada no exemplo fornecido
  const availableMedications = [
    'Nitrazepam',
    'Clonazepam', 
    'Ácido Valproico',
    'Olanzapina',
    'Anlodipino',
    'Losartana',
    'Omeprazol',
    'Sinvastatina',
    'Ciprofibrato',
    'Colchicina',
    'Alopurinol',
    'Metformina',
    'Flunarizina'
  ]

  const filteredMedications = availableMedications.filter(med =>
    med.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedMedications.some(selected => selected.name === med)
  )

  const handleAddMedication = (medicationName) => {
    if (dosage.trim()) {
      onMedicationAdd({
        name: medicationName,
        dosage: dosage.trim()
      })
      setSearchTerm('')
      setDosage('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="label">Medicamento</label>
          <input
            type="text"
            className="input"
            placeholder="Digite o nome do medicamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && filteredMedications.length > 0 && (
            <div className="mt-1 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg">
              {filteredMedications.map((med) => (
                <button
                  key={med}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                  onClick={() => setSearchTerm(med)}
                >
                  {med}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-40">
          <label className="label">Dosagem</label>
          <input
            type="text"
            className="input"
            placeholder="Ex: 10mg"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            className="btn btn-primary h-10 px-4"
            onClick={() => handleAddMedication(searchTerm)}
            disabled={!searchTerm || !dosage}
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista de medicamentos selecionados */}
      {selectedMedications.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Medicamentos Selecionados:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedMedications.map((med, index) => (
              <div
                key={index}
                className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{med.name} - {med.dosage}</span>
                <button
                  onClick={() => onMedicationRemove(index)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicationSelector
