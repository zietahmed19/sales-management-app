import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('❌ Error info:', errorInfo);
    console.error('❌ Error stack:', error.stack);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
          <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">خطأ في النظام</h2>
            <p className="text-gray-600 mb-4">
              حدث خطأ غير متوقع في التطبيق. يرجى إعادة تحميل الصفحة أو المحاولة مرة أخرى.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mb-4 p-4 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium">تفاصيل الخطأ (للمطورين)</summary>
                <div className="mt-2">
                  <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  <br />
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-2">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
            
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-medium"
              >
                إعادة تحميل الصفحة
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  if (this.props.onRetry) {
                    this.props.onRetry();
                  }
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
              >
                المحاولة مرة أخرى
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
