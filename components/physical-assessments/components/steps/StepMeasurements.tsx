// components/physical-assessments/components/steps/StepMeasurements.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MEASUREMENT_FIELDS } from '@/components/physical-assessments/constants/physical-assessment';

interface StepMeasurementsProps {
  measurements: Record<string, string>;
  protocol: string;
  gender: string;
  onUpdateMeasurement: (field: string, value: string) => void;
  getRequiredFields: (protocol: string, gender: string) => string[];
}

export function StepMeasurements({
  measurements,
  protocol,
  gender,
  onUpdateMeasurement,
  getRequiredFields
}: StepMeasurementsProps) {
  const requiredFields = protocol && gender ? getRequiredFields(protocol, gender) : [];

  return (
    <div className="space-y-8">
      <Tabs defaultValue="skinfolds" className="w-full">
        {/* Tab Navigation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-orange-500/10 to-indigo-600/10 rounded-2xl blur-xl"></div>
          <TabsList className="relative grid w-full grid-cols-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 border-0">
            <TabsTrigger
              value="skinfolds"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all duration-300 font-semibold"
            >
              <span className="text-xl">🟡</span>
              <span className="hidden sm:inline">Dobras Cutâneas</span>
              <span className="sm:hidden">Dobras</span>
            </TabsTrigger>
            <TabsTrigger
              value="circumferences"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300 font-semibold"
            >
              <span className="text-xl">🔵</span>
              <span className="hidden sm:inline">Circunferências</span>
              <span className="sm:hidden">Circunf.</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dobras Cutâneas */}
        <TabsContent value="skinfolds" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {MEASUREMENT_FIELDS.skinfolds.map((field) => {
              const isRequired = requiredFields.includes(field.key);
              const hasValue = measurements[field.key];
              
              return (
                <div key={field.key} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <Card className={`relative border-0 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02] ${
                    isRequired
                      ? hasValue 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-600'
                        : 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-600'
                      : 'bg-white/90 dark:bg-gray-900/90'
                  }`}>

                    {!isRequired && (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                        <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl"></div>
                      </>
                    )}

                    <CardContent className="relative p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <Label className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
                        isRequired 
                          ? hasValue
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-orange-700 dark:text-orange-300'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}>
                        <span className="text-lg sm:text-xl">{field.icon}</span>
                        <span className="truncate">{field.label}</span>
                        {isRequired && (
                          <span className={`text-lg ${hasValue ? 'text-green-500' : 'text-red-500'}`}>
                            {hasValue ? '✓' : '*'}
                          </span>
                        )}
                        <Badge className={`ml-auto px-2 py-1 bg-gradient-to-r ${field.color} text-white border-0 rounded-full text-xs font-semibold shrink-0`}>
                          {field.unit}
                        </Badge>
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={measurements[field.key] || ''}
                        onChange={(e) => onUpdateMeasurement(field.key, e.target.value)}
                        className={`h-10 sm:h-12 text-base sm:text-lg transition-all duration-300 ${
                          isRequired
                            ? hasValue
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-500 bg-white/80 dark:bg-gray-800/80'
                              : 'border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white/80 dark:bg-gray-800/80'
                            : 'border-0 bg-white/80 dark:bg-gray-800/80 focus:bg-white dark:focus:bg-gray-800'
                        } rounded-lg sm:rounded-xl shadow-lg backdrop-blur-sm`}
                        placeholder="0.0"
                      />
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Circunferências */}
        <TabsContent value="circumferences" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {MEASUREMENT_FIELDS.circumferences.map((field) => (
              <div key={field.key} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <Card className="relative border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl overflow-hidden group-hover:transform group-hover:scale-[1.02]">

                  <div className={`absolute inset-0 bg-gradient-to-r ${field.color} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl"></div>

                  <CardContent className="relative p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <Label className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <span className="text-lg sm:text-xl">{field.icon}</span>
                      <span className="truncate">{field.label}</span>
                      <Badge className={`ml-auto px-2 py-1 bg-gradient-to-r ${field.color} text-white border-0 rounded-full text-xs font-semibold shrink-0`}>
                        {field.unit}
                      </Badge>
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={measurements[field.key] || ''}
                      onChange={(e) => onUpdateMeasurement(field.key, e.target.value)}
                      className="h-10 sm:h-12 text-base sm:text-lg bg-white/80 dark:bg-gray-800/80 border-0 rounded-lg sm:rounded-xl shadow-lg backdrop-blur-sm focus:bg-white dark:focus:bg-gray-800 transition-all duration-300"
                      placeholder="0.0"
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}