const FREQUENCY_FACTORS = {
  weekly: 4.345, // promedio de semanas por mes
  biweekly: 2.172,
  monthly: 1,
  quarterly: 0.333
};

const FREQUENCY_LABELS = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  quarterly: 'Trimestral'
};

export function calculateMonthly(rule) {
  const factor = FREQUENCY_FACTORS[rule.frequency] ?? 1;
  return Math.round(rule.amount * factor);
}

export function describeFrequency(key) {
  return FREQUENCY_LABELS[key] ?? key;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function buildInsights({ totalMonthly, goal, rules, previousTotal }) {
  if (!rules.length) {
    return [
      {
        title: 'Comienza con tu primera regla',
        body: 'Define una automatización pequeña para que la IA aprenda tu ritmo y empiece a proyectar resultados.',
        tone: 'info'
      }
    ];
  }

  const insights = [];
  const coverage = goal > 0 ? totalMonthly / goal : 0;
  const diff = totalMonthly - (previousTotal ?? 0);
  const highImpact = rules.filter((rule) => rule.impact === 'high').length;
  const exploratory = rules.filter((rule) => rule.impact === 'exploratory').length;
  const automationRules = rules.filter((rule) => rule.category === 'Automatización').length;

  insights.push({
    title: 'Proyección mensual consolidada',
    body: `Tus reglas actuales aportan ${formatCurrency(totalMonthly)} cada mes. Mantén este ritmo para estabilizar tus objetivos.`,
    tone: 'success'
  });

  if (goal > 0) {
    if (coverage < 0.6) {
      insights.push({
        title: 'Refuerza tu meta',
        body: 'Estás por debajo del 60% de tu meta mensual. Considera aumentar el monto de una regla existente o crear una nueva transferencia programada.',
        tone: 'warning'
      });
    } else if (coverage > 1.2) {
      insights.push({
        title: 'Meta superada',
        body: 'Tus reglas superan la meta en más de un 20%. Revisa si puedes derivar el excedente a un fondo de emergencia o inversión.',
        tone: 'success'
      });
    } else {
      insights.push({
        title: 'Vas en el camino correcto',
        body: 'Te mantienes cerca del objetivo mensual. Programa una revisión semanal para detectar oportunidades de optimización.',
        tone: 'info'
      });
    }
  }

  if (diff > 0) {
    insights.push({
      title: 'Tu ahorro creció',
      body: `Incrementaste ${formatCurrency(diff)} respecto al periodo anterior. Capitaliza el impulso configurando recordatorios automáticos.`,
      tone: 'success'
    });
  } else if (diff < 0) {
    insights.push({
      title: 'Detectamos una caída',
      body: `Registras ${formatCurrency(Math.abs(diff))} menos que el ciclo pasado. Revisa reglas pausadas o gastos extraordinarios recientes.`,
      tone: 'warning'
    });
  }

  if (automationRules === 0) {
    insights.push({
      title: 'Activa automatizaciones',
      body: 'Aún no tienes reglas automáticas. Configura al menos una para capturar ahorros sin fricción en tu día a día.',
      tone: 'info'
    });
  }

  if (highImpact > 0 && exploratory > highImpact) {
    insights.push({
      title: 'Balancea tus apuestas',
      body: 'Tienes más reglas exploratorias que de alto impacto. Ajusta montos para asegurar resultados consistentes.',
      tone: 'warning'
    });
  }

  return insights;
}
