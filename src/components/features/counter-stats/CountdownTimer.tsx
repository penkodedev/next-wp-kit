'use client';

/**
 * Countdown timer using react-countdown library.
 */

import Countdown, { type CountdownRendererFn } from 'react-countdown';

const UNITS: { key: string; labelEs: string }[] = [
  { key: 'days', labelEs: 'Días' },
  { key: 'hours', labelEs: 'Horas' },
  { key: 'minutes', labelEs: 'Minutos' },
  { key: 'seconds', labelEs: 'Segundos' },
];

interface CountdownTimerProps {
  startDate: string | null;
  endDate: string;
  align?: 'left' | 'center' | 'right';
}

function parseDate(value: string): number | null {
  const normalized = value.length === 16 ? `${value}:00` : value.replace(' ', 'T');
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d.getTime();
}

const createRenderer = (align: 'left' | 'center' | 'right'): CountdownRendererFn => ({ days, hours, minutes, seconds, completed }) => {
  const alignClass = `counter-stats--${align}`;
  if (completed) {
    return (
      <div className={`counter-stats ${alignClass}`}>
        <div className="counter-stats-grid">
          <div className="counter-stat-card counter-stat-card--finished">
            <h4 className="counter-stat-number">0</h4>
            <p className="counter-stat-label">Finalizado</p>
          </div>
        </div>
      </div>
    );
  }

  const values = [days, hours, minutes, seconds];
  const firstNonZero = values.findIndex((v) => v > 0);
  const startIndex = firstNonZero >= 0 ? firstNonZero : 3;
  const visibleUnits = UNITS.slice(startIndex);

  return (
    <section className={`counter-stats ${alignClass}`}>
      <div className="counter-stats-grid">
        {visibleUnits.map((unit, i) => {
          const idx = startIndex + i;
          const val = values[idx];
          return (
            <div key={unit.key} className="counter-stat-card">
              <h4 className="counter-stat-number">{val}</h4>
              <p className="counter-stat-label">{unit.labelEs}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default function CountdownTimer({ startDate, endDate, align = 'center' }: CountdownTimerProps) {
  const targetDate = parseDate(endDate);

  const alignClass = `counter-stats--${align}`;
  const renderer = createRenderer(align);

  if (!targetDate) {
    return (
      <div className={`counter-stats ${alignClass}`}>
        <div className="counter-stats-grid">
          <div className="counter-stat-card counter-stat-card--finished">
            <h4 className="counter-stat-number">—</h4>
            <p className="counter-stat-label">Fecha inválida</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Countdown
      date={targetDate}
      renderer={renderer}
      intervalDelay={1000}
    />
  );
}
