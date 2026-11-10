import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ReadLens error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-serif text-lg font-bold text-ink mb-2">Something went wrong</h2>
          <p className="text-sm text-muted mb-4 max-w-sm leading-relaxed">
            An unexpected error occurred in this view. Your notes and progress are safe.
          </p>
          {this.state.error && (
            <div className="mb-6 p-3 bg-card border border-danger/40 text-danger text-xs font-mono rounded-xl max-w-md text-left overflow-auto whitespace-pre-wrap">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.hash = "#/dashboard";
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
          >
            Reset & Go to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
