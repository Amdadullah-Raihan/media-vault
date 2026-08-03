import { ShieldOff } from 'lucide-react';
import { cn } from '@/utils';

interface ForbiddenStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ForbiddenState({
  title = 'Access Denied',
  message = 'You do not have permission to access this resource.',
  className,
}: ForbiddenStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 px-8 py-16 text-center',
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
        <ShieldOff className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
