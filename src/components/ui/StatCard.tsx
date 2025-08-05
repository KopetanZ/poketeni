import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  trend?: {
    value: number;
    label: string;
  };
}

const colorVariants = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  red: 'bg-red-50 text-red-600 border-red-200'
};

export function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 ml-2">{subtitle}</p>
            )}
          </div>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
          )}
        </div>
        
        <div className={cn(
          "p-3 rounded-lg border",
          colorVariants[color]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}