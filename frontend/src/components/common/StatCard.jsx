import { Card } from '../ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({ label, value, trend, icon: Icon, color = 'blue', className }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        slate: 'bg-slate-50 text-slate-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <Card className={cn('p-6 hover:shadow-lg transition-shadow duration-200', className)}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
                    {trend !== undefined && trend !== null && (
                        <div className={cn(
                            'flex items-center mt-2 text-xs',
                            trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-slate-600'
                        )}>
                            {trend > 0 && <TrendingUp className="w-3 h-3 mr-1" />}
                            {trend < 0 && <TrendingDown className="w-3 h-3 mr-1" />}
                            <span>{trend > 0 ? '+' : ''}{trend}% from last week</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={cn('p-3 rounded-lg', colorClasses[color] || colorClasses.blue)}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </Card>
    );
}
