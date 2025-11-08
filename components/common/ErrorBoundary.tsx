import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('finTrackState');
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear local storage', e);
      alert('Não foi possível limpar os dados. Por favor, limpe os dados do site manualmente nas configurações do seu navegador.');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <div className="w-full max-w-lg text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl">
            <h1 className="text-2xl font-bold text-danger-500 mb-4">Oops! Algo deu errado.</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              O aplicativo encontrou um erro inesperado, possivelmente devido a dados corrompidos.
              Pedimos desculpas pelo inconveniente.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Redefinir e Recarregar
            </button>
            <details className="mt-6 text-left text-xs text-gray-500 dark:text-gray-500">
                <summary>Detalhes do erro (para suporte)</summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-auto">
                  {this.state.error?.toString()}
                  {this.state.error?.stack}
                </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;