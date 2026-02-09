
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function IncidentCard({ incident, index }) {
    const severityColors = {
        Minor: "bg-brand-yellow/10 text-brand-yellow-dark border-brand-yellow/20",
        Major: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
        Critical: "bg-red-100 text-red-500 border-red-200"
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-brand-light-gray/20 hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        severityColors[incident.severity]
                    )}>
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold font-poppins text-brand-navy">{incident.title}</h4>
                        <span className="text-xs text-gray-400 font-instrument">{incident.incident_date}</span>
                    </div>
                </div>

                <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    severityColors[incident.severity]
                )}>
                    {incident.severity}
                </span>
            </div>

            <p className="text-sm text-gray-500 font-instrument mb-4 bg-brand-very-light/20 p-3 rounded-xl border border-brand-light-gray/10">
                {incident.description}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {incident.resolved ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-full">
                            <CheckCircle size={12} /> Resolved
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-full animate-pulse">
                            <Clock size={12} /> Pending Review
                        </span>
                    )}
                </div>

                {incident.parent_notified && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Parent Notified</span>
                )}
            </div>
        </motion.div>
    );
}
