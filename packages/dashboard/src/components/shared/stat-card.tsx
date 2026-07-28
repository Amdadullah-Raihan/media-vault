import { cn } from '@/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="rounded-md bg-muted p-1.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {(description ?? trendValue) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {trendValue && (
            <span
              className={cn(
                'mr-1',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
              )}
            >
              {trendValue}
            </span>
          )}
          {description}
        </p>
      )}
    </div>
  );
}
