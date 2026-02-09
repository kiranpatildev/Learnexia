
import { mockSettings } from '@/services/mockData';
import { cn } from '@/lib/utils';
import { ToggleLeft, ToggleRight, Moon, Sun, Bell, Lock } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useState } from 'react';

export function SettingsPanel() {
    const [settings, setSettings] = useState(mockSettings);

    const handleToggle = (key) => {
        setSettings({ ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } });
    };

    const inputClass = "bg-brand-very-light/20 border border-brand-light-gray/20 rounded-xl px-4 py-3 text-brand-navy font-instrument focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all outline-none w-full";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-500">
            {/* Change Password */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20">
                <h3 className="text-xl font-bold font-poppins text-brand-navy mb-6 flex items-center gap-2">
                    <Lock size={20} className="text-brand-purple" /> Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <input type="password" placeholder="Current Password" className={inputClass} />
                    <input type="password" placeholder="New Password" className={inputClass} />
                    <input type="password" placeholder="Confirm New Password" className={inputClass} />
                </div>
                <div className="flex justify-end">
                    <Button variant="primary">Update Password</Button>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20">
                <h3 className="text-xl font-bold font-poppins text-brand-navy mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-brand-orange" /> Notification Preferences
                </h3>
                <div className="space-y-4">
                    {/* Convert mockSettings keys to readable */}
                    {Object.keys(settings.notifications).map((key) => (
                        <div key={key} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                            <span className="font-instrument capitalize font-medium text-brand-navy group-hover:text-brand-purple transition-colors">
                                {key.replace('_', ' ')} Notifications
                            </span>
                            <button onClick={() => handleToggle(key)} className="text-brand-purple hover:text-brand-purple/80 transition-colors transform group-hover:scale-110 duration-200">
                                {settings.notifications[key] ? <ToggleRight size={40} fill="currentColor" className="text-brand-purple" /> : <ToggleLeft size={40} className="text-gray-300" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Theme Placeholder */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20 relative overflow-hidden group">
                <div className="absolute top-4 right-4 bg-brand-yellow text-brand-navy text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-md">Coming Soon</div>
                <h3 className="text-xl font-bold font-poppins text-brand-navy mb-6 flex items-center gap-2">
                    <Moon size={20} className="text-brand-blue" /> Appearance
                </h3>
                <div className="flex gap-4 opacity-50 select-none filter blur-[1px] group-hover:blur-0 transition-all duration-500">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-brand-purple bg-brand-purple/10 text-brand-purple font-bold">
                        <Moon size={16} /> Dark
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-400 font-bold bg-gray-50">
                        <Sun size={16} /> Light
                    </button>
                </div>
            </div>
        </div>
    );
}
