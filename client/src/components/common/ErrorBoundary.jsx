import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-yellow-100 p-6 text-center">
                    <div>
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="font-bangers text-2xl text-ink mb-2">Oops! Something went wrong loading the 3D scene.</h2>
                        <p className="font-grotesk text-ink/70">But don't worry, you can still use the rest of the application!</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
