import { Button } from '../ui/button';

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {Icon && (
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-slate-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
}
