
import { mockSettings } from '@/services/mockData';
import { Button } from '@/components/shared/Button';
import { ToggleLeft, ToggleRight, Laptop, Download, Trash2, Shield, Eye } from 'lucide-react';
import { useState } from 'react';

export function PrivacySettings() {
    const [privacy, setPrivacy] = useState(mockSettings.privacy);

    const handleToggle = (key) => {
        setPrivacy({ ...privacy, [key]: !privacy[key] });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-500">
            {/* Privacy Toggles */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20">
                <h3 className="text-xl font-bold font-poppins text-brand-navy mb-6 flex items-center gap-2">
                    <Shield size={20} className="text-brand-green" /> Profile Visibility
                </h3>
                <div className="space-y-6">
                    {Object.entries(privacy).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-none">
                            <div className="flex flex-col">
                                <span className="font-poppins font-bold text-brand-navy capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="text-xs text-gray-400 font-instrument">Allow others to see this information</span>
                            </div>
                            <button onClick={() => handleToggle(key)} className="transition-colors transform active:scale-95 duration-200">
                                {value ? <ToggleRight size={40} className="text-brand-purple" fill="currentColor" /> : <ToggleLeft size={40} className="text-gray-300" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Connected Devices */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20 opacity-80 decoration-slate-400">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold font-poppins text-brand-navy flex items-center gap-2">
                        <Laptop size={20} className="text-brand-blue" /> Connected Devices
                    </h3>
                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Coming Soon</span>
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20">
                <h3 className="text-xl font-bold font-poppins text-brand-navy mb-6">Data Management</h3>

                <div className="flex flex-col gap-4">
                    <Button variant="outline" className="justify-between border-brand-light-gray/50 hover:bg-brand-very-light/20">
                        <span className="flex items-center gap-2 font-bold text-gray-600"><Download size={18} /> Download My Data</span>
                    </Button>

                    <Button variant="outline" className="justify-between border-red-100 hover:border-red-200 hover:bg-red-50 text-red-500 hover:text-red-600">
                        <span className="flex items-center gap-2 font-bold"><Trash2 size={18} /> Delete Account</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
