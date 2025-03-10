import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './components/alert';
import { AlertCircle } from 'lucide-react';

type Props = {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

type State = {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <Alert variant="destructive" className="space-y-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{this.props.title ?? 'Something went wrong 💥'}</AlertTitle>
          <AlertDescription>
            {this.props.description ?? (
              <details>
                <summary>Error details</summary>
                <pre>{this.state.error?.toString()}</pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
