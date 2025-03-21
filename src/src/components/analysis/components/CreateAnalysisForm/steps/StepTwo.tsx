import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Material } from '../../../views/CreateAnalysisView';
import MaterialSelector from '../components/MaterialSelector'; // Usamos la versión modificada
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StepTwoProps {
  materials: Material[];
  onUpdate: (materials: Material[]) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ materials, onUpdate }) => {
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);

  const calculateTotal = (material: Material) => {
    return material.quantity * material.coefficient * material.price;
  };

  const handleQuantityChange = (index: number, value: string) => {
    const newMaterials = [...materials];
    const numValue = parseFloat(value);

    if (!isNaN(numValue) && numValue >= 0) {
      newMaterials[index] = {
        ...newMaterials[index],
        quantity: numValue,
      };
      onUpdate(newMaterials);
    }
  };

  const handleCoefficientChange = (index: number, value: string) => {
    const newMaterials = [...materials];
    const numValue = parseFloat(value);

    if (!isNaN(numValue) && numValue >= 0) {
      newMaterials[index] = {
        ...newMaterials[index],
        coefficient: numValue,
      };
      onUpdate(newMaterials);
    }
  };

  const handleDeleteMaterial = (index: number) => {
    if (confirm('¿Está seguro que desea eliminar este material?')) {
      const newMaterials = materials.filter((_, i) => i !== index);
      onUpdate(newMaterials);
    }
  };

  const handleAddMaterial = (material: Material) => {
    // Verificar si el material ya existe
    const exists = materials.some(m => m.id === material.id);
    if (exists) {
      alert('Este material ya está en la lista');
      return;
    }

    // Añadir con valores por defecto
    const newMaterial = {
      ...material,
      quantity: 1, // Por defecto
      coefficient: 1, // Por defecto
      price: material.precio_unitario, // Ajuste para mantener consistencia con el tipo Material
    };
    onUpdate([...materials, newMaterial]);
    setShowMaterialSelector(false);
  };

  const totalCost = materials.reduce((sum, material) => sum + calculateTotal(material), 0);

  return (
    <div className="space-y-6">
      {/* Header con total */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Materiales y Cantidades</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Costo Total</p>
          <p className="text-lg font-semibold">${totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Alerta si no hay materiales */}
      {materials.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin materiales</AlertTitle>
          <AlertDescription>Agregue al menos un material para continuar.</AlertDescription>
        </Alert>
      )}

      {/* Tabla de materiales */}
      {materials.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="w-32">Cantidad</TableHead>
                <TableHead className="w-32">Coeficiente</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material, index) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.descripcion}</TableCell>
                  <TableCell>{material.unidad}</TableCell>
                  <TableCell>
                    <input
                      type="number"
                      value={material.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="w-24 p-1 border rounded text-right"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      value={material.coefficient}
                      onChange={(e) => handleCoefficientChange(index, e.target.value)}
                      className="w-24 p-1 border rounded text-right"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="text-right">${material.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${calculateTotal(material).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMaterial(index)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Botón para agregar material */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowMaterialSelector(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Material
        </Button>
      </div>

      {/* Selector de materiales (usando la versión modificada) */}
      {showMaterialSelector && (
        <MaterialSelector
          onSelectMaterial={(material) => setSelectedMaterial(material as Material)}
          selectedMaterial={selectedMaterial}
          availableItems={availableItems}
          onAddToAnalysis={handleAddMaterial} // Usamos la nueva prop para agregar
        />
      )}

      {/* Información adicional */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Consideraciones</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• La cantidad y el coeficiente deben ser mayores a 0</li>
          <li>• El precio unitario se obtiene de la base de materiales</li>
          <li>• El total se calcula automáticamente</li>
          <li>• No se pueden duplicar materiales</li>
        </ul>
      </div>
    </div>
  );
};

export default StepTwo;