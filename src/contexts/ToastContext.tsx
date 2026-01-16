"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, [removeToast]);

    const contextValue = {
        toast: showToast,
        success: (message: string) => showToast(message, 'success'),
        error: (message: string) => showToast(message, 'error'),
        info: (message: string) => showToast(message, 'info'),
        warning: (message: string) => showToast(message, 'warning'),
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`
                            pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-lg border flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-right-full
                            ${t.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' : ''}
                            ${t.type === 'error' ? 'bg-white border-red-100 text-red-800' : ''}
                            ${t.type === 'info' ? 'bg-white border-blue-100 text-blue-800' : ''}
                            ${t.type === 'warning' ? 'bg-white border-amber-100 text-amber-800' : ''}
                        `}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div className="flex-1 text-sm font-medium">{t.message}</div>
                        <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
