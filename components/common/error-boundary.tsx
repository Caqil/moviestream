"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IconAlertTriangle,
  IconRefresh,
  IconBug,
  IconChevronDown,
  IconCopy,
  IconHome,
  IconMail,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  showReportButton?: boolean;
  level?: "page" | "section" | "component";
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
  errorId: string;
  level: "page" | "section" | "component";
  showDetails: boolean;
  showReportButton: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === "production") {
      // reportError(error, errorInfo, this.state.errorId);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorId={this.state.errorId}
          level={this.props.level || "component"}
          showDetails={this.props.showDetails || false}
          showReportButton={this.props.showReportButton !== false}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  errorId,
  level,
  showDetails,
  showReportButton,
}: ErrorFallbackProps) {
  const handleCopyError = () => {
    const errorReport = `
Error ID: ${errorId}
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `.trim();

    navigator.clipboard.writeText(errorReport);
    toast.success("Error details copied to clipboard");
  };

  const handleReportError = () => {
    // In a real app, this would send the error to your error reporting service
    const subject = encodeURIComponent(`Error Report - ${errorId}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error: ${error.message}
Please describe what you were doing when this error occurred:

---
Technical Details:
${error.stack}
    `);

    window.open(
      `mailto:support@moviestream.com?subject=${subject}&body=${body}`
    );
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (level === "page") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <IconAlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <IconBug className="h-4 w-4" />
              <AlertDescription>
                An unexpected error occurred while loading this page. We've been
                notified and are working to fix it.
              </AlertDescription>
            </Alert>

            {showDetails && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <IconChevronDown className="h-4 w-4 mr-2" />
                    Show Error Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-mono">{error.message}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Error ID: {errorId}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button onClick={handleReload} className="w-full">
                <IconRefresh className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                <IconHome className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {showReportButton && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={handleCopyError}
                  className="w-full"
                >
                  <IconCopy className="h-4 w-4 mr-2" />
                  Copy Error
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReportError}
                  className="w-full"
                >
                  <IconMail className="h-4 w-4 mr-2" />
                  Report Error
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (level === "section") {
    return (
      <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
        <div className="text-center space-y-4">
          <div className="mx-auto p-2 bg-destructive/10 rounded-full w-fit">
            <IconAlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Section Error</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This section failed to load. Please try refreshing.
            </p>
          </div>

          {showDetails && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium">
                Error Details
              </summary>
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                {error.message}
              </div>
            </details>
          )}

          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={resetError}>
              <IconRefresh className="h-4 w-4 mr-1" />
              Retry
            </Button>
            {showReportButton && (
              <Button size="sm" variant="outline" onClick={handleCopyError}>
                <IconCopy className="h-4 w-4 mr-1" />
                Copy Error
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Component level error
  return (
    <div className="p-4 border border-destructive/20 rounded bg-destructive/5">
      <div className="flex items-center gap-2 text-destructive">
        <IconAlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">Component Error</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={resetError}
          className="ml-auto"
        >
          <IconRefresh className="h-3 w-3" />
        </Button>
      </div>
      {showDetails && (
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          {error.message}
        </p>
      )}
    </div>
  );
}

// Specialized error boundaries for different parts of the app
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="page"
      showDetails={process.env.NODE_ENV === "development"}
      showReportButton={true}
    >
      {children}
    </ErrorBoundary>
  );
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="section"
      showDetails={process.env.NODE_ENV === "development"}
      showReportButton={false}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="component"
      showDetails={process.env.NODE_ENV === "development"}
      showReportButton={false}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for handling async errors
export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return captureError;
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

export default ErrorBoundary;
