// components/physical-assessments/components/steps/stepProtocol.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BODY_PROTOCOLS } from '@/components/physical-assessments/constants/physical-assessment';
import { Calculator, CheckCircle2, Info } from 'lucide-react';

interface StepProtocolProps {
  selectedProtocol: string;
  onProtocolSelect: (protocol: string) => void;
  gender: string;
  getRequiredFields: (protocol: string, gender: string) => string[];
}

export function StepProtocol({
  selectedProtocol,
  onProtocolSelect,
  gender,
  getRequiredFields
}: StepProtocolProps) {
  const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
      chest: 'Peitoral',
      abdominal: 'Abdominal',
      thigh: 'Coxa',
      triceps: 'Tríceps',
      suprailiac: 'Supra-ilíaca',
      midaxillary: 'Axilar Média',
      subscapular: 'Subescapular',
      biceps: 'Bíceps'
    };
    return fieldLabels[field] || field;
  };

  return (
    <div className="space-y-8">
      {/* Grid de Protocolos */}
      <div className="grid gap-6 md:grid-cols-2">
        {BODY_PROTOCOLS.map((protocol) => (
          <div
            key={protocol.value}
            onClick={() => onProtocolSelect(protocol.value)}
            className="group cursor-pointer relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${protocol.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <Card className={`relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] ${
              selectedProtocol === protocol.value
                ? 'bg-gradient-to-r ' + protocol.color + ' text-white'
                : 'bg-white/90 dark:bg-gray-900/90'
            }`}>

              {selectedProtocol !== protocol.value && (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-r ${protocol.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-2xl"></div>
                </>
              )}

              <CardContent className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shadow-lg ${
                    selectedProtocol === protocol.value
                      ? 'bg-white/20'
                      : 'bg-gradient-to-r ' + protocol.color
                  }`}>
                    <Calculator className={`h-6 w-6 ${
                      selectedProtocol === protocol.value ? 'text-white' : 'text-white'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg mb-2 ${
                      selectedProtocol === protocol.value
                        ? 'text-white'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {protocol.label}
                    </h4>
                    <p className={`text-sm leading-relaxed ${
                      selectedProtocol === protocol.value
                        ? 'text-white/80'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {protocol.description}
                    </p>
                    {selectedProtocol === protocol.value && (
                      <Badge className="mt-4 bg-white/20 text-white border-0 rounded-full font-bold">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Selecionado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Informações dos Campos Obrigatórios */}
      {selectedProtocol && gender && (
        <div className="p-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl border border-indigo-200 dark:border-indigo-700 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shrink-0">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-indigo-800 dark:text-indigo-300 mb-3 text-lg">
                Campos obrigatórios para {BODY_PROTOCOLS.find(p => p.value === selectedProtocol)?.label}:
              </h5>
              <div className="flex flex-wrap gap-3">
                {getRequiredFields(selectedProtocol, gender).map((field) => (
                  <Badge 
                    key={field} 
                    className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 rounded-full text-xs font-semibold shadow-lg"
                  >
                    {getFieldLabel(field)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}