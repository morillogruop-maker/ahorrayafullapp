'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildInsights,
  calculateMonthly,
  describeFrequency,
  formatCurrency
} from '../lib/finance';

const STORAGE_KEY = 'ahorra-ya-dashboard';

const defaultForm = {
  name: '',
  category: 'Automatización',
  amount: '',
  frequency: 'monthly',
  impact: 'stable'
};

const impactLabels = {
  stable: 'Estable',
  high: 'Alto',
  exploratory: 'Exploratorio'
};

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `rule-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Dashboard() {
  const [goal, setGoal] = useState(500);
  const [rules, setRules] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [isReady, setIsReady] = useState(false);
  const lastTotalRef = useRef(0);
  const [year] = useState(() => new Date().getFullYear());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed.goal === 'number' && Number.isFinite(parsed.goal)) {
          setGoal(Math.max(0, parsed.goal));
        }
        if (Array.isArray(parsed.rules)) {
          setRules(
            parsed.rules
              .filter((rule) => typeof rule === 'object' && rule)
              .map((rule) => ({
                id: rule.id ?? createId(),
                name: typeof rule.name === 'string' ? rule.name : 'Regla sin nombre',
                category: typeof rule.category === 'string' ? rule.category : 'Automatización',
                amount: Number(rule.amount) > 0 ? Number(rule.amount) : 0,
                frequency: rule.frequency ?? 'monthly',
                impact: rule.impact ?? 'stable',
                createdAt: rule.createdAt ?? new Date().toISOString()
              }))
              .filter((rule) => rule.amount > 0)
          );
        }
        if (typeof parsed.lastTotal === 'number') {
          lastTotalRef.current = parsed.lastTotal;
        }
      } catch (error) {
        console.warn('No se pudo leer el estado guardado', error);
      }
    }
    setIsReady(true);
  }, []);

  const totalMonthly = useMemo(
    () =>
      rules.reduce((acc, rule) => {
        return acc + calculateMonthly(rule);
      }, 0),
    [rules]
  );

  const trend = totalMonthly - lastTotalRef.current;
  const goalCoverage = goal > 0 ? Math.round((totalMonthly / goal) * 100) : 0;
  const deltaToGoal = goal - totalMonthly;

  const insights = useMemo(
    () => buildInsights({ totalMonthly, goal, rules, previousTotal: lastTotalRef.current }),
    [goal, rules, totalMonthly]
  );

  useEffect(() => {
    if (!isReady || typeof window === 'undefined') return;
    const payload = {
      goal,
      rules,
      lastTotal: totalMonthly
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    lastTotalRef.current = totalMonthly;
  }, [goal, rules, totalMonthly, isReady]);

  const handleGoalChange = (event) => {
    const nextValue = Number(event.target.value);
    setGoal(Number.isFinite(nextValue) ? Math.max(0, nextValue) : 0);
  };

  const updateForm = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => setFormData(defaultForm);

  const handleSubmit = (event) => {
    event.preventDefault();
    const amountNumber = Number(formData.amount);
    if (!formData.name.trim() || !Number.isFinite(amountNumber) || amountNumber <= 0) {
      return;
    }
    const newRule = {
      id: createId(),
      name: formData.name.trim(),
      category: formData.category,
      amount: amountNumber,
      frequency: formData.frequency,
      impact: formData.impact,
      createdAt: new Date().toISOString()
    };
    setRules((prev) => [newRule, ...prev]);
    resetForm();
  };

  const removeRule = (id) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  const formatTrend = () => {
    if (rules.length === 0) {
      return 'Crea reglas para comenzar a medir tus avances.';
    }
    if (lastTotalRef.current === 0) {
      return 'Primer registro del periodo en curso.';
    }
    if (trend === 0) {
      return 'Sin cambios frente al periodo previo';
    }
    const direction = trend > 0 ? 'arriba' : 'abajo';
    return `${trend > 0 ? '+' : '-'}${formatCurrency(Math.abs(trend))} respecto al mes anterior (${direction}).`;
  };

  const goalMessage = () => {
    if (goal <= 0) {
      return 'Fija una meta mensual para obtener comparativas.';
    }
    if (deltaToGoal > 0) {
      return `Te faltan ${formatCurrency(deltaToGoal)} para alcanzar la meta.`;
    }
    if (deltaToGoal < 0) {
      return `Superas tu meta en ${formatCurrency(Math.abs(deltaToGoal))}.`;
    }
    return 'Has alcanzado exactamente tu meta.';
  };

  return (
    <>
      <header className="hero">
        <div className="hero__content">
          <div>
            <span className="hero__badge">Ahorra Ya · IA financiera</span>
            <h1>Impulsa tus metas con reglas de ahorro inteligentes</h1>
            <p>
              Diseña automatizaciones, estima resultados mensuales y recibe consejos accionables para mantener tus objetivos
              siempre en crecimiento.
            </p>
          </div>
          <div className="hero__snapshot" aria-hidden="true">
            <div className="snapshot__card">
              <p className="snapshot__label">Ahorro proyectado</p>
              <p className="snapshot__value">{formatCurrency(totalMonthly)}</p>
              <span className="snapshot__trend">{formatTrend()}</span>
            </div>
            <div className="snapshot__card">
              <p className="snapshot__label">Meta mensual</p>
              <p className="snapshot__value">{formatCurrency(goal)}</p>
              <span className="snapshot__meta">{goalMessage()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="panel" aria-labelledby="resumenTitle">
          <div className="panel__header">
            <h2 id="resumenTitle">Resumen mensual</h2>
            <div className="goal__control">
              <label htmlFor="goalInput">Meta mensual</label>
              <div className="goal__input">
                <span>$</span>
                <input id="goalInput" type="number" min="0" value={goal} onChange={handleGoalChange} />
              </div>
            </div>
          </div>
          <div className="metrics" role="list">
            <article className="metric" role="listitem">
              <h3>Total proyectado</h3>
              <p className="metric__value">{formatCurrency(totalMonthly)}</p>
              <span>{rules.length ? 'Equivalente mensual consolidado.' : 'Agrega reglas para empezar.'}</span>
            </article>
            <article className="metric" role="listitem">
              <h3>Porcentaje de meta</h3>
              <p className="metric__value">{Math.min(goalCoverage, 999)}%</p>
              <span>{goalMessage()}</span>
            </article>
            <article className="metric" role="listitem">
              <h3>Reglas activas</h3>
              <p className="metric__value">{rules.length}</p>
              <span>{rules.length ? 'Administrando reglas en ejecución.' : 'Aún no hay reglas activas.'}</span>
            </article>
          </div>
        </section>

        <section className="panel" aria-labelledby="reglasTitle">
          <div className="panel__header">
            <h2 id="reglasTitle">Crea tus reglas de ahorro</h2>
            <p className="panel__description">
              Configura montos, frecuencia y categorías. La calculadora convierte todo a un equivalente mensual automáticamente.
            </p>
          </div>
          <form className="rule-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="ruleName">Nombre de la regla</label>
              <input
                id="ruleName"
                name="ruleName"
                type="text"
                required
                placeholder="Ej. Redondeo de compras"
                value={formData.name}
                onChange={updateForm('name')}
              />
            </div>
            <div className="field">
              <label htmlFor="ruleCategory">Categoría</label>
              <select id="ruleCategory" value={formData.category} onChange={updateForm('category')} required>
                <option value="Automatización">Automatización</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Micro-ahorro">Micro-ahorro</option>
                <option value="Inversión">Inversión</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="ruleAmount">Monto</label>
              <div className="field__input">
                <span>$</span>
                <input
                  id="ruleAmount"
                  name="ruleAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={updateForm('amount')}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="ruleFrequency">Frecuencia</label>
              <select id="ruleFrequency" value={formData.frequency} onChange={updateForm('frequency')} required>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="ruleImpact">Impacto estimado</label>
              <select id="ruleImpact" value={formData.impact} onChange={updateForm('impact')} required>
                <option value="stable">Estable</option>
                <option value="high">Alto</option>
                <option value="exploratory">Exploratorio</option>
              </select>
            </div>
            <div className="rule-form__actions">
              <button className="btn" type="submit">
                Guardar regla
              </button>
              <button className="btn btn--ghost" type="button" onClick={resetForm}>
                Limpiar
              </button>
            </div>
          </form>

          <div className="rules" id="rulesList" aria-live="polite">
            {rules.length === 0 ? (
              <p className="rules__empty">
                Aún no registras reglas. Combina automatizaciones, transferencias y micro-ahorros para impulsar tus resultados.
              </p>
            ) : (
              rules.map((rule) => {
                const monthly = calculateMonthly(rule);
                return (
                  <article key={rule.id} className="rule">
                    <div className="rule__header">
                      <h3>{rule.name}</h3>
                      <span className={`badge badge--${rule.impact}`}>{impactLabels[rule.impact]}</span>
                    </div>
                    <dl className="rule__details">
                      <div>
                        <dt>Monto base</dt>
                        <dd>{formatCurrency(rule.amount)}</dd>
                      </div>
                      <div>
                        <dt>Frecuencia</dt>
                        <dd>{describeFrequency(rule.frequency)}</dd>
                      </div>
                      <div>
                        <dt>Aporte mensual</dt>
                        <dd>{formatCurrency(monthly)}</dd>
                      </div>
                      <div>
                        <dt>Categoría</dt>
                        <dd>{rule.category}</dd>
                      </div>
                    </dl>
                    <button className="rule__remove" type="button" onClick={() => removeRule(rule.id)}>
                      Eliminar
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="panel" aria-labelledby="insightsTitle">
          <div className="panel__header">
            <h2 id="insightsTitle">Recomendaciones inteligentes</h2>
            <p className="panel__description">Acciones sugeridas según tu ritmo actual.</p>
          </div>
          <div className="insights" id="insights">
            {insights.map((insight, index) => (
              <article key={`${insight.title}-${index}`} className={`insight insight--${insight.tone}`}>
                <h3>{insight.title}</h3>
                <p>{insight.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <small>
          © {year} Ahorra Ya. Construido para acelerar tus objetivos financieros.
        </small>
      </footer>
    </>
  );
}
