import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

export const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group"
    offset={{
      top: 'max(16px, calc(var(--safe-area-top) + 12px))',
      right: '16px',
      bottom: 'max(16px, calc(var(--safe-area-bottom) + 12px))',
      left: '16px',
    }}
    mobileOffset={{
      top: 'max(12px, calc(var(--safe-area-top) + 8px))',
      right: '12px',
      bottom: 'max(12px, calc(var(--safe-area-bottom) + 8px))',
      left: '12px',
    }}
    icons={{
      success: <CircleCheckIcon className="size-4" />,
      info: <InfoIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
      error: <OctagonXIcon className="size-4" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
    }}
    style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
    }
    {...props}
  />
);
