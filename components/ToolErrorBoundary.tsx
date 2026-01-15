import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ToolErrorBoundaryProps {
    children: ReactNode;
    toolName?: string;
}

interface ToolErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
    constructor(props: ToolErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): ToolErrorBoundaryState {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details for debugging
        console.error('Tool Error Boundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render() {
        if (this.state.hasError) {
            const toolName = this.props.toolName || 'Tool';

            return (
                <div className="flex items-center justify-center h-full min-h-[400px] p-8 animate-fade-in">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-amber-500/10 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
                            <AlertTriangle className="text-amber-500" size={40} />
                        </div>

                        <h3 className="font-display font-bold text-slate-900 dark:text-white text-2xl mb-3">
                            {toolName} Temporarily Unavailable
                        </h3>

                        <p className="text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-6">
                            The tool encountered an error while loading. You can continue with the lesson and try again later.
                        </p>

                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-sm text-slate-500 dark:text-[#64748B] cursor-pointer hover:text-slate-700 dark:hover:text-[#94A3B8] font-medium">
                                    Technical Details
                                </summary>
                                <div className="mt-2 p-4 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                                    <code className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
                                        {this.state.error.message}
                                    </code>
                                </div>
                            </details>
                        )}

                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all hover:shadow-lg"
                        >
                            <RefreshCw size={18} />
                            Retry Loading Tool
                        </button>

                        <p className="mt-4 text-xs text-slate-400 dark:text-[#64748B]">
                            If the problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
