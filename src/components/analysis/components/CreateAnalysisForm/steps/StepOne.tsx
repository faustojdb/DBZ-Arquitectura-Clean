import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BasicInfo } from '../CreateAnalysisView';

interface StepOneProps {
  data: BasicInfo;
  onUpdate: (data: BasicInfo) => void;
}

const RUBROS = [
  { id: '1', name: 'Trabajos Preliminares' },
  { id: '2', name: 'Movimiento de Suelos' },
  { id: '3', name: 'Hormigón Armado' },
  { id: '4', name: 'Mampostería' },
  { id: '5', name: 'Aislaciones' },
  // ... otros rubros según el sistema
];

const UNIDADES = [
  { id: 'm2', name: 'Metro Cuadrado' },
  { id: 'm3', name: 'Metro Cúbico' },
  { id: 'ml', name: 'Metro Lineal' },
  { id: 'kg', name: 'Kilogramo' },
  { id: 'un', name: 'Unidad' },
  { id: 'gl', name: 'Global' },
];

const StepOne: React.FC<StepOneProps> = ({ data, onUpdate }) => {
  // Generar código automático basado en el rubro seleccionado
  useEffect(() => {
    if (data.rubro && !data.code) {
      const selectedRubro = RUBROS.find(r => r.id === data.rubro);
      if (selectedRubro) {
        const newCode = `${selectedRubro.id}.${Math.floor(Math.random() * 100)}`;
        handleChange('code', newCode);
      }
    }
  }, [data.rubro]);

  const handleChange = (field: keyof BasicInfo, value: string) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nombre del Análisis <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ej: Excavación para Fundaciones"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rubro">
            Rubro <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={data.rubro} 
            onValueChange={(value) => handleChange('rubro', value)}
          >
            <SelectTrigger id="rubro">
              <SelectValue placeholder="Seleccionar Rubro" />
            </SelectTrigger>
            <SelectContent>
              {RUBROS.map((rubro) => (
                <SelectItem key={rubro.id} value={rubro.id}>
                  {rubro.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">
            Unidad <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={data.unit} 
            onValueChange={(value) => handleChange('unit', value)}
          >
            <SelectTrigger id="unit">
              <SelectValue placeholder="Seleccionar Unidad" />
            </SelectTrigger>
            <SelectContent>
              {UNIDADES.map((unidad) => (
                <SelectItem key={unidad.id} value={unidad.id}>
                  {unidad.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">
          Código <span className="text-red-500">*</span>
        </Label>
        <Input
          id="code"
          value={data.code}
          onChange={(e) => handleChange('code', e.target.value)}
          placeholder="Ej: 1.1"
          className="font-mono"
        />
        <p className="text-sm text-gray-500">
          El código se genera automáticamente pero puede modificarlo
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descripción detallada del análisis..."
          rows={4}
        />
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Campos requeridos</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Nombre del análisis</li>
          <li>• Rubro</li>
          <li>• Unidad</li>
          <li>• Código</li>
        </ul>
      </div>
    </div>
  );
};

export default StepOne;