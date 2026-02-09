
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { SettingsPanel } from '@/components/profile/SettingsPanel';
import { ActivityTimeline } from '@/components/profile/ActivityTimeline';
import { PrivacySettings } from '@/components/profile/PrivacySettings';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Shield, Clock } from 'lucide-react';

export function Profile() {
    const [activeTab, setActiveTab] = useState('personal');

    const tabs = [
        { id: 'personal', label: 'Personal Information', icon: User },
        { id: 'settings', label: 'Account Settings', icon: Settings },
        { id: 'activity', label: 'Activity Log', icon: Clock },
        { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    ];

    return (
        <div className="font-instrument pb-20 container mx-auto px-4 lg:px-8">
            <Header title="My Profile" subtitle="Manage your account settings" />

            <div className="flex flex-col lg:flex-row gap-8 relative items-start">
                {/* Left: Sticky Sidebar */}
                <div className="w-full lg:w-[350px] flex-shrink-0">
                    <ProfileSidebar />
                </div>

                {/* Right: Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Tabs Navigation */}
                    <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-[2rem] shadow-sm border border-brand-light-gray/20 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-brand-navy text-white shadow-brand-navy/20 shadow-md"
                                        : "bg-transparent text-gray-400 hover:text-brand-navy hover:bg-gray-50"
                                )}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'personal' && <PersonalInfoForm />}
                            {activeTab === 'settings' && <SettingsPanel />}
                            {activeTab === 'activity' && <ActivityTimeline />}
                            {activeTab === 'privacy' && <PrivacySettings />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
