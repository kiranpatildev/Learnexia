
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchBar({ placeholder = "Search assignments...", onChange, className }) {
    return (
        <div className={cn("relative flex items-center w-full max-w-lg", className)}>
            <div className="absolute left-4 z-10 text-brand-light-gray pointer-events-none">
                <Search size={20} />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                onChange={onChange}
                className="w-full pl-12 pr-4 py-3 bg-white border border-brand-light-gray/20 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple shadow-sm hover:shadow-md transition-all duration-300 placeholder:font-instrument placeholder:text-gray-400 text-brand-navy font-instrument"
            />
        </div>
    );
}
