import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'default', className = '' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        default: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm text-slate-600">Loading...</p>
            </div>
        </div>
    );
}
