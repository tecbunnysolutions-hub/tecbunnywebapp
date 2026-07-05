'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { logger } from '@tecbunny/core'; // Assuming logger exists

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MicroErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log silently to telemetry/monitoring
    console.error("Micro-component failed:", error, errorInfo);
    try {
      logger.error('Micro-component Exception', {
        message: error.message,
        stack: error.stack,
        info: errorInfo.componentStack
      });
    } catch (e) {
      // Ignore logger errors
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50/50 rounded-xl border border-red-100 dark:bg-red-950/20 dark:border-red-900/50">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-400">Module Load Failed</h3>
          <p className="text-xs text-red-700 dark:text-red-300 text-center mb-4">
            We couldn't load this specific section. The rest of the page is fine.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors dark:bg-red-950 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
          >
            <RefreshCcw className="w-3 h-3" />
            Retry Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
