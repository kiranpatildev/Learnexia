
import { Header } from '@/components/layout/Header';
import { ScoreIndicator } from '@/components/behavior/ScoreIndicator';
import { IncidentCard } from '@/components/behavior/IncidentCard';
import { BehaviorChart } from '@/components/behavior/BehaviorChart';
import { mockBehavior } from '@/services/mockData';
import { Smile, Award, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function BehaviorAnalysis() {
    return (
        <div className="font-instrument pb-20 container mx-auto px-4 lg:px-8">
            <Header
                title="Behavior Analysis"
                subtitle="Track your progress and conduct"
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column (2/3 width) - Stats & Incidents */}
                <div className="xl:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-5 duration-500">
                    {/* Top Section: Score Indicator & Stats Grid */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-shrink-0 mx-auto lg:mx-0">
                            <ScoreIndicator />
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4">
                            {[
                                { label: 'Total Incidents', value: mockBehavior.total_incidents, icon: AlertCircle, color: 'text-brand-orange bg-brand-orange/10' },
                                { label: 'Positive Actions', value: mockBehavior.positive_behaviors ? mockBehavior.positive_behaviors.length : 0, icon: Smile, color: 'text-brand-green bg-brand-green/10' },
                                { label: 'Days Incident Free', value: mockBehavior.days_since_last_incident, icon: Calendar, color: 'text-brand-blue bg-brand-blue/10' },
                                { label: 'Parent Notices', value: mockBehavior.parent_notifications, icon: Award, color: 'text-brand-purple bg-brand-purple/10' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-brand-light-gray/20 flex flex-col justify-center gap-2 hover:shadow-md transition-all group max-w-full"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <span className="text-3xl font-poppins font-bold text-brand-navy">{stat.value}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Incident History */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-light-gray/20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-poppins text-brand-navy">Incident History</h3>
                            <button className="text-brand-purple font-bold text-sm hover:underline">View All</button>
                        </div>

                        <div className="space-y-4">
                            {mockBehavior.incidents && mockBehavior.incidents.length > 0 ? (
                                mockBehavior.incidents.map((incident, index) => (
                                    <IncidentCard key={incident.id} incident={incident} index={index} />
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Smile size={48} className="mx-auto mb-4 text-brand-green opacity-50" />
                                    <p>No incidents recorded. Keep up the great work! 🎉</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3 width) - Trend & Positive Behaviors */}
                <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-500">
                    {/* Trend Chart Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand-light-gray/20">
                        <h3 className="text-xl font-bold font-poppins text-brand-navy mb-2">Behavior Trend</h3>
                        <p className="text-sm text-gray-400 font-instrument mb-6">Last 6 Months Performance</p>
                        <BehaviorChart />
                    </div>

                    {/* Positive Behaviors List */}
                    <div className="bg-brand-very-light/30 rounded-[2.5rem] p-8 border border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-full blur-3xl -z-10" />

                        <h3 className="text-xl font-bold font-poppins text-brand-navy mb-6 flex items-center gap-2">
                            <Award className="text-brand-green" /> Positive Actions
                        </h3>

                        <div className="space-y-4">
                            {mockBehavior.positive_behaviors && mockBehavior.positive_behaviors.map((action, i) => (
                                <motion.div
                                    key={action.id || i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-brand-light-gray/10 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div>
                                        <h4 className="font-bold text-brand-navy text-sm font-poppins">{action.title}</h4>
                                        <span className="text-xs text-brand-light-gray font-instrument">{action.date}</span>
                                    </div>
                                    <span className="text-brand-green font-bold text-xs bg-brand-green/10 px-2 py-1 rounded-full">
                                        +{action.points_earned} XP
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-3 rounded-xl border border-brand-green/20 text-brand-green font-bold hover:bg-brand-green/5 transition-colors text-sm">
                            View All Achievements
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
