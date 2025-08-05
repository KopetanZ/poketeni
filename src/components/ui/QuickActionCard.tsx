import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const colorVariants = {
  blue: 'bg-blue-500 hover:bg-blue-600',
  green: 'bg-green-500 hover:bg-green-600',
  yellow: 'bg-yellow-500 hover:bg-yellow-600',
  purple: 'bg-purple-500 hover:bg-purple-600',
  red: 'bg-red-500 hover:bg-red-600'
};

export function QuickActionCard({ title, description, icon: Icon, href, color }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:transform hover:scale-105"
    >
      <div className="flex items-start space-x-4">
        <div className={cn(
          "p-3 rounded-lg text-white transition-colors",
          colorVariants[color]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 font-display">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}