import React from "react";
import ErrorPage from "../pages/ErrorPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <ErrorPage 
            code="FATAL" 
            title="Application Crash" 
            message="A critical error occurred. Please try reloading the application." 
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
