"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./Button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Memperbarui state sehingga render berikutnya menampilkan UI fallback.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-paper-white flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container p-6 md:p-8 sketch-border hard-shadow flex flex-col items-center text-center gap-4">
            <span className="material-symbols-outlined text-6xl text-curtain-red" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-ink-black">
              Oops! Sesuatu Salah
            </h1>
            <p className="font-body-md text-on-surface-variant text-sm">
              Terjadi kesalahan tak terduga pada aplikasi. Silakan muat ulang halaman.
            </p>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <pre className="bg-ink-black text-paper-white p-4 text-left w-full overflow-x-auto text-xs sketch-border-thin mt-2">
                {this.state.error.toString()}
              </pre>
            )}
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              Muat Ulang Halaman
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
