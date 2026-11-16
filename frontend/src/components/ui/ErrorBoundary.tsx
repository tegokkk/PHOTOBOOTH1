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
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-studio-pattern flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase text-black">
              Oops! Terjadi Kesalahan
            </h1>
            <p className="text-black/65 text-sm font-medium leading-relaxed">
              Terjadi kesalahan tak terduga pada aplikasi. Silakan muat ulang halaman untuk melanjutkan.
            </p>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <pre className="bg-gray-900 text-white p-4 rounded-2xl text-left w-full overflow-x-auto text-xs mt-1">
                {this.state.error.toString()}
              </pre>
            )}
            <Button
              variant="primary"
              fullWidth
              className="mt-2"
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
