import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

const { createElement: h } = React;

// Opciones para cada sección
const OPTIONS = {
  tipo: [
    { label: '🌐 App Web', value: 'web' },
    { label: '📱 App Móvil', value: 'mobile' },
    { label: '⚡ API / Backend', value: 'api' },
    { label: '🖥️  App Desktop', value: 'desktop' },
    { label: '🔧 Script / CLI', value: 'cli' },
    { label: '❓ No sé, ayúdame', value: 'help' },
  ],
  plataforma: [
    { label: '🌐 Solo Web', value: 'web-only' },
    { label: '📱 Web + Móvil', value: 'web-mobile' },
    { label: '🖥️  Multiplataforma', value: 'multi' },
  ],
  datos: [
    { label: '❌ No necesito BD', value: 'none' },
    { label: '📁 Local (SQLite/JSON)', value: 'local' },
    { label: '☁️  Cloud (Supabase/Firebase)', value: 'cloud' },
    { label: '🐘 PostgreSQL/MySQL', value: 'sql' },
    { label: '🍃 MongoDB', value: 'nosql' },
  ],
  nivel: [
    { label: '🌱 Novato - Guíame paso a paso', value: 'beginner' },
    { label: '🌿 Intermedio - Conozco lo básico', value: 'intermediate' },
    { label: '🌳 Avanzado - Solo dame las herramientas', value: 'advanced' },
  ],
};

const TABS = ['tipo', 'plataforma', 'datos', 'nivel', 'descripcion'];
const TAB_LABELS = {
  tipo: '📦 Tipo',
  plataforma: '🎯 Plataforma', 
  datos: '💾 Datos',
  nivel: '📊 Nivel',
  descripcion: '📝 Descripción',
};

// Componente Tab individual
function Tab({ label, isActive, isCompleted }) {
  const borderColor = isActive ? 'blue' : isCompleted ? 'green' : 'gray';
  const textColor = isActive || isCompleted ? 'white' : 'gray';
  
  return h(Box, { borderStyle: 'round', borderColor, paddingX: 1, marginRight: 1 },
    h(Text, { color: textColor }, `${label} ${isCompleted ? '✓' : ''}`)
  );
}

// Componente principal Wizard
function Wizard({ projectName }) {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [selections, setSelections] = useState({
    tipo: null,
    plataforma: null,
    datos: null,
    nivel: null,
    descripcion: '',
  });
  const [isComplete, setIsComplete] = useState(false);

  const currentTab = TABS[activeTab];
  const isDescriptionTab = currentTab === 'descripcion';

  // Navegación con teclas
  useInput((input, key) => {
    if (key.escape) {
      exit();
      return;
    }
    
    // Tab / Shift+Tab para navegar entre secciones
    if (key.tab && !key.shift && activeTab < TABS.length - 1) {
      setActiveTab(activeTab + 1);
    } else if (key.tab && key.shift && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
    
    // Ctrl+Enter para finalizar
    if (key.ctrl && key.return && canSubmit()) {
      handleSubmit();
    }
  });

  const handleSelect = (item) => {
    setSelections({ ...selections, [currentTab]: item.value });
    if (activeTab < TABS.length - 1) {
      setTimeout(() => setActiveTab(activeTab + 1), 150);
    }
  };

  const handleDescriptionChange = (value) => {
    setSelections({ ...selections, descripcion: value });
  };

  const canSubmit = () => {
    return selections.tipo && selections.nivel && selections.descripcion.length > 0;
  };

  const handleSubmit = async () => {
    setIsComplete(true);
    
    setTimeout(async () => {
      console.clear();
      console.log('\n🚀 Generando entorno de trabajo...\n');
      console.log('📋 Configuración:');
      console.log(`   Tipo: ${OPTIONS.tipo.find(o => o.value === selections.tipo)?.label}`);
      console.log(`   Plataforma: ${OPTIONS.plataforma.find(o => o.value === selections.plataforma)?.label || 'N/A'}`);
      console.log(`   Datos: ${OPTIONS.datos.find(o => o.value === selections.datos)?.label || 'N/A'}`);
      console.log(`   Nivel: ${OPTIONS.nivel.find(o => o.value === selections.nivel)?.label}`);
      console.log(`   Descripción: ${selections.descripcion}\n`);
      
      try {
        const { generateFromWizard } = await import('../../lib/generator.js');
        await generateFromWizard(process.cwd(), selections);
        
        console.log('✅ ¡Entorno generado exitosamente!\n');
        console.log('📁 Archivos creados:');
        console.log('   • AGENTS.md');
        console.log('   • skills/');
        console.log('   • .claude/ .github/ .codex/\n');
        console.log('💡 Próximos pasos:');
        console.log('   1. Abre el proyecto en tu IDE favorito');
        console.log('   2. El agente leerá AGENTS.md automáticamente');
        console.log('   3. Empieza a desarrollar con ayuda de IA!\n');
      } catch (err) {
        console.error('❌ Error:', err.message);
      }
      
      exit();
    }, 500);
  };

  if (isComplete) {
    return h(Box, { flexDirection: 'column', padding: 1 },
      h(Text, { color: 'green' }, '⏳ Procesando...')
    );
  }

  // Construir contenido del tab activo
  let tabContent;
  if (isDescriptionTab) {
    tabContent = h(Box, { flexDirection: 'column' },
      h(Text, { color: 'yellow', bold: true }, 'Describe brevemente tu proyecto:'),
      h(Box, { marginTop: 1 },
        h(Text, { color: 'gray' }, '> '),
        h(TextInput, {
          value: selections.descripcion,
          onChange: handleDescriptionChange,
          placeholder: 'Ej: App para gestionar mis gastos personales...'
        })
      )
    );
  } else {
    const questions = {
      tipo: '¿Qué tipo de proyecto quieres crear?',
      plataforma: '¿En qué plataformas funcionará?',
      datos: '¿Necesitas guardar datos?',
      nivel: '¿Cuál es tu nivel de experiencia?',
    };
    
    tabContent = h(Box, { flexDirection: 'column' },
      h(Text, { color: 'yellow', bold: true }, questions[currentTab]),
      h(Box, { marginTop: 1 },
        h(SelectInput, {
          items: OPTIONS[currentTab] || [],
          onSelect: handleSelect,
        })
      )
    );
  }

  // Resumen de selecciones
  let summaryParts = [];
  if (selections.tipo) summaryParts.push(OPTIONS.tipo.find(o => o.value === selections.tipo)?.label);
  if (selections.plataforma) summaryParts.push(OPTIONS.plataforma.find(o => o.value === selections.plataforma)?.label);
  if (selections.datos) summaryParts.push(OPTIONS.datos.find(o => o.value === selections.datos)?.label);
  if (selections.nivel) summaryParts.push(OPTIONS.nivel.find(o => o.value === selections.nivel)?.label);

  return h(Box, { flexDirection: 'column', padding: 1 },
    // Header
    h(Box, { marginBottom: 1 },
      h(Text, { bold: true, color: 'cyan' }, '🚀 AGENT-AUTO: Nuevo Proyecto')
    ),
    
    // Tabs
    h(Box, { marginBottom: 1 },
      ...TABS.map((tab, index) => 
        h(Tab, {
          key: tab,
          label: TAB_LABELS[tab],
          isActive: index === activeTab,
          isCompleted: selections[tab] !== null && selections[tab] !== '',
        })
      )
    ),
    
    // Contenido del tab activo
    h(Box, { flexDirection: 'column', borderStyle: 'round', borderColor: 'blue', padding: 1, minHeight: 10 },
      tabContent
    ),
    
    // Resumen
    h(Box, { marginTop: 1 },
      h(Text, { color: 'gray', dimColor: true }, `Seleccionado: ${summaryParts.join(' | ') || 'nada aún'}`)
    ),
    
    // Footer
    h(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'gray', paddingX: 1 },
      h(Text, { color: 'gray' }, 
        `[Tab] Siguiente  [Shift+Tab] Anterior  [Enter] Seleccionar  ${canSubmit() ? '[Ctrl+Enter] Generar  ' : ''}[Esc] Cancelar`
      )
    )
  );
}

export default Wizard;
