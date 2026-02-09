
import { mockUser } from '@/services/mockData';
import { Avatar } from '@/components/shared/Avatar';
import { Calendar, User, Trophy, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfileSidebar() {
    return (
        <div className="md:sticky md:top-24 w-full h-fit flex flex-col items-center bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20 text-center">
            <div className="relative mb-6 group">
                <Avatar src={mockUser.avatar} alt={mockUser.name} size="2xl" className="border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                </div>
            </div>

            <h2 className="text-2xl font-poppins font-bold text-brand-navy mb-1">{mockUser.name}</h2>
            <p className="text-sm font-instrument text-gray-500 mb-2">Grade {mockUser.grade} • Section {mockUser.section}</p>
            <span className="inline-block px-4 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold uppercase tracking-wider mb-6">
                {mockUser.role}
            </span>

            <div className="w-full border-t border-gray-100 pt-6 space-y-4 text-left">
                {[
                    { icon: Calendar, label: 'Member Since', value: mockUser.member_since },
                    { icon: Trophy, label: 'Level', value: mockUser.current_level, color: 'text-brand-purple' },
                    { icon: Flame, label: 'Streak', value: `${mockUser.current_streak} days`, color: 'text-brand-orange' },
                    { icon: User, label: 'Guardian', value: mockUser.guardian_name.split(' ')[0] },
                ].map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={item.label}
                        className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        <div className="flex items-center gap-3 text-gray-400 font-bold text-sm group-hover:text-brand-navy transition-colors">
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </div>
                        <span className={`font-instrument font-medium ${item.color || 'text-brand-navy'}`}>
                            {item.value}
                        </span>
                    </motion.div>
                ))}
            </div>

            <button className="mt-8 w-full py-3 rounded-xl border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors text-sm">
                Log Out
            </button>
        </div>
    );
}
