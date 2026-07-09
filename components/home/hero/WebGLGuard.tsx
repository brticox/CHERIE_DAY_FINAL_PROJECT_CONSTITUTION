'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';

import { detectWebGLCapability, flagWebGLFailure } from '@/lib/home/webgl-capability';

/**
 * Error boundary around the WebGL stage: any renderer crash flags the
 * session and removes the canvas so the poster underneath stays visible.
 */
class StageErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch() {
    flagWebGLFailure();
  }

  override render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/**
 * WebGLGuard — renders its children (the canvas) only when the device
 * passes the capability gate. Decision happens client-side after mount,
 * so SSR always paints the poster first (poster = LCP, never the canvas).
 */
export function WebGLGuard({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(detectWebGLCapability());
  }, []);

  if (!allowed) return null;
  return <StageErrorBoundary>{children}</StageErrorBoundary>;
}
