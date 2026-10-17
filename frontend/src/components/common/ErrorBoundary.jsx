import { Component } from 'react';
export default class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('HireFlow UI error', error, info);
    }
    render() {
        if (!this.state.hasError)
            return this.props.children;
        return (<main className="center-page">
            <div className="panel error-boundary-card">
                <div className="eyebrow">HIREFLOW</div>
                <h1>Something needs a refresh.</h1>
                <p>We hit an unexpected screen error. Your saved account data is not deleted.</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload HireFlow</button>
            </div>
        </main>);
    }
}
