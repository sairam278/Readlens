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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-serif text-lg font-bold text-ink mb-2">Something went wrong</h2>
          <p className="text-sm text-muted mb-6 max-w-sm leading-relaxed">
            An unexpected error occurred in this view. Your notes and progress are safe.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
