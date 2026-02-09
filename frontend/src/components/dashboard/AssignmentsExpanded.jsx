
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterPills } from '@/components/shared/FilterPills';
import { Button } from '@/components/shared/Button';
import { GradesGraph } from '@/components/dashboard/GradesGraph';
import { mockAssignments } from '@/services/mockData';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

export function AssignmentsExpanded() {
    const [filter, setFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const filterItems = [
        { label: 'Pending', value: 'pending', count: mockAssignments.filter(a => a.status === 'Pending').length, color: '#F24400', colorClass: 'bg-brand-orange border-brand-orange text-white' }, // Orange
        { label: 'Submitted', value: 'submitted', count: 1, color: '#49467B', colorClass: 'bg-brand-navy border-brand-navy text-white' }, // Navy/Purple
        { label: 'Graded', value: 'graded', count: 0, color: '#FFC71B', colorClass: 'bg-brand-yellow border-brand-yellow text-brand-navy' }, // Yellow
    ];

    const filteredAssignments = mockAssignments.filter(a => {
        const matchesFilter = filter === 'pending' ? a.status === 'Pending' : true; // Simplify for mock
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="animate-in fade-in slide-in-from-top-5 duration-500">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <SearchBar
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/2"
                />
                <FilterPills
                    items={filterItems}
                    activeFilter={filter}
                    onFilterChange={setFilter}
                />
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Assignments List */}
                <div className="flex-1 space-y-4">
                    <AnimatePresence>
                        {filteredAssignments.map((assignment, index) => (
                            <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "bg-white rounded-2xl p-6 shadow-sm border border-brand-light-gray/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group",
                                    // Colored left border accent
                                    assignment.priority === 'Urgent' ? "border-l-4 border-l-brand-orange" :
                                        assignment.priority === 'Medium' ? "border-l-4 border-l-brand-yellow" :
                                            "border-l-4 border-l-brand-blue"
                                )}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-poppins font-bold text-lg text-brand-navy">{assignment.title}</h3>

                                            {/* Priority Badge */}
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1",
                                                assignment.priority === 'Urgent' ? "bg-brand-orange/10 text-brand-orange" :
                                                    assignment.priority === 'Medium' ? "bg-brand-yellow/20 text-brand-navy" :
                                                        "bg-brand-blue/10 text-brand-blue"
                                            )}>
                                                {assignment.priority}
                                            </span>
                                        </div>

                                        <p className="text-gray-500 text-sm font-instrument mb-3">{assignment.description}</p>

                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400">
                                            <span className={cn(
                                                "px-2 py-1 rounded bg-brand-very-light text-brand-purple flex items-center gap-1",
                                            )}>
                                                {assignment.subject}
                                            </span>
                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                                <Calendar size={12} /> Due {assignment.due_date}
                                            </span>
                                            <span className="flex items-center gap-1 bg-brand-orange/10 text-brand-orange px-2 py-1 rounded">
                                                <AlertCircle size={12} /> {assignment.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Button
                                            variant="assignment"
                                            size="sm"
                                            className="w-full md:w-auto font-poppins text-xs font-bold py-3 px-6 rounded-xl bg-brand-navy text-white shadow-lg hover:shadow-xl hover:bg-brand-purple transform hover:scale-105 transition-all"
                                        >
                                            Start
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Grades Graph Card */}
                <div className="w-full xl:w-1/3 min-h-[400px]">
                    <div className="bg-white rounded-[2rem] p-2 shadow-lg border border-brand-light-gray/20 h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <GradesGraph />
                    </div>
                </div>
            </div>
        </div>
    );
}
