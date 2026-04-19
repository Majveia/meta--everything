import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '@/components/atoms/ErrorBoundary';

// ═══ Helper: a component that throws on demand ═══

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test explosion');
  }
  return <div>All good</div>;
}

// Suppress console.error noise from React error boundaries in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('displays a generic message when error has no message', () => {
    function EmptyThrower() {
      throw new Error();
    }

    render(
      <ErrorBoundary>
        <EmptyThrower />
      </ErrorBoundary>,
    );

    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('"Try again" button resets error state and re-renders children', () => {
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) {
        throw new Error('Boom');
      }
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    // Should show fallback
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Fix the child so it won't throw on re-render
    shouldThrow = false;

    // Click "Try again"
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    // Should now show the recovered child
    expect(screen.getByText('Recovered')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('shows the emoticon in fallback UI', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByText(':/')).toBeInTheDocument();
  });
});
