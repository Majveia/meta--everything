'use client';

import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg, #0A0A0A)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'var(--bg-soft, #0F0E0D)', borderRadius: 14, border: '1px solid var(--border, #1C1A18)', padding: '32px 28px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>:/</div>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: 'var(--text, #E8E0D4)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: 'var(--text-muted, #6B6560)', letterSpacing: '.04em', marginBottom: 24, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text, #E8E0D4)',
              background: 'var(--terracotta, #BF5A3C)',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
