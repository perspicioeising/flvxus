'use client';

import { useState } from 'react';
import { Zap, Search, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_EVENTS } from '../constants/webhook';

interface StepEventsProps {
  formData: {
    events: string[];
  };
  onUpdateField: (field: string, value: any) => void;
}

export function StepEvents({ formData, onUpdateField }: StepEventsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(AVAILABLE_EVENTS.map(e => e.category)))];
  
  const filteredEvents = AVAILABLE_EVENTS.filter(event => {
    const matchesSearch = event.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleEvent = (eventKey: string) => {
    const currentEvents = formData.events || [];
    const newEvents = currentEvents.includes(eventKey)
      ? currentEvents.filter(e => e !== eventKey)
      : [...currentEvents, eventKey];
    
    onUpdateField('events', newEvents);
  };

  const selectAllInCategory = (category: string) => {
    const categoryEvents = AVAILABLE_EVENTS
      .filter(e => category === 'all' || e.category === category)
      .map(e => e.key);
    
    onUpdateField('events', [...new Set([...formData.events, ...categoryEvents])]);
  };

  const deselectAllInCategory = (category: string) => {
    const categoryEvents = AVAILABLE_EVENTS
      .filter(e => category === 'all' || e.category === category)
      .map(e => e.key);
    
    const newEvents = formData.events.filter(e => !categoryEvents.includes(e));
    onUpdateField('events', newEvents);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-achievement-exercise rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-app-large">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-app-heading mb-2">
          Selecionar Eventos
        </h2>
        <p className="text-app-text-secondary">
          Escolha quais eventos do sistema você quer monitorar
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-app-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar eventos..."
            className="w-full pl-12 pr-4 py-3 border-2 border-app-border-muted rounded-xl focus:ring-2 focus:ring-app-text-accent focus:border-app-text-accent bg-app-card text-app-text-primary placeholder-app-text-muted transition-all duration-200"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const isActive = selectedCategory === category;
            const categoryEvents = AVAILABLE_EVENTS.filter(e => category === 'all' || e.category === category);
            const selectedInCategory = categoryEvents.filter(e => formData.events.includes(e.key)).length;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-app-text-accent text-white shadow-app-medium'
                    : 'bg-app-card border border-app-border-muted text-app-text-secondary hover:border-app-border-accent hover:text-app-text-primary'
                }`}
              >
                {category === 'all' ? 'Todos' : category}
                {selectedInCategory > 0 && (
                  <Badge className="ml-2 bg-white/20 text-white border-0">
                    {selectedInCategory}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => selectAllInCategory(selectedCategory)}
            className="px-3 py-2 bg-achievement-exercise text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-200"
          >
            Selecionar Todos
          </button>
          <button
            onClick={() => deselectAllInCategory(selectedCategory)}
            className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200"
          >
            Desmarcar Todos
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredEvents.map(event => {
          const isSelected = formData.events.includes(event.key);
          
          return (
            <button
              key={event.key}
              onClick={() => toggleEvent(event.key)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? 'border-app-text-accent bg-app-text-accent/10 shadow-app-medium'
                  : 'border-app-border-muted bg-app-card hover:border-app-border-accent hover:shadow-app-medium hover:scale-105'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{event.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold transition-colors duration-200 ${
                      isSelected ? 'text-app-text-accent' : 'text-app-text-primary group-hover:text-app-text-accent'
                    }`}>
                      {event.label}
                    </h3>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-app-text-accent" />
                    )}
                  </div>
                  <p className="text-sm text-app-text-secondary mb-2">
                    {event.description}
                  </p>
                  <Badge className="bg-app-bg-secondary/50 text-app-text-secondary border-app-border-muted text-xs">
                    {event.category}
                  </Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-app-border-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-app-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-app-text-primary mb-2">Nenhum evento encontrado</h3>
          <p className="text-app-text-secondary">Tente ajustar os filtros ou busca</p>
        </div>
      )}

      {/* Selection Summary */}
      <div className="mt-8 p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl border border-green-200/50 dark:border-green-700/50">
        <h4 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Eventos Selecionados: {formData.events.length}
        </h4>
        {formData.events.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {formData.events.map(eventKey => {
              const event = AVAILABLE_EVENTS.find(e => e.key === eventKey);
              return event ? (
                <Badge key={eventKey} className="bg-green-100 text-green-800 border-green-200">
                  {event.icon} {event.label}
                </Badge>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-sm text-green-700 dark:text-green-400">
            Selecione pelo menos um evento para continuar
          </p>
        )}
      </div>
    </div>
  );
}

