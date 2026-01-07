'use client';

import { type ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  onClick?: () => void;
}

export function MetricCard({ title, value, subtitle, trend, icon, onClick }: MetricCardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`glass rounded-2xl p-6 text-left transition-all duration-300 ${
        onClick ? 'hover:bg-white/[0.15] cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/60">{title}</p>
          <p className="mt-2 text-4xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
          {trend && (
            <p
              className={`mt-2 text-sm font-medium ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% vs vorige periode
            </p>
          )}
        </div>
        {icon && <div className="p-3 bg-white/10 rounded-xl">{icon}</div>}
      </div>
    </Component>
  );
}
