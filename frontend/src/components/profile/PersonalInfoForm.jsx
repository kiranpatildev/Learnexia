
import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Edit2, CheckCircle, Save } from 'lucide-react';
import { mockUser } from '@/services/mockData';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function PersonalInfoForm() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(mockUser);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const sections = [
        {
            title: "Basic Information",
            fields: [
                { label: "First Name", name: "first_name", type: "text", readOnly: false },
                { label: "Last Name", name: "last_name", type: "text", readOnly: false },
                { label: "Email", name: "email", type: "email", readOnly: true },
                { label: "Phone Number", name: "phone", type: "tel", readOnly: false },
                { label: "Date of Birth", name: "date_of_birth", type: "date", readOnly: false },
            ]
        },
        {
            title: "Guardian Information",
            fields: [
                { label: "Guardian Name", name: "guardian_name", type: "text", readOnly: false },
                { label: "Guardian Phone", name: "guardian_phone", type: "tel", readOnly: false },
                { label: "Relationship", name: "guardian_relationship", type: "text", readOnly: false },
            ]
        },
        {
            title: "Emergency Contact",
            fields: [
                { label: "Emergency Contact Name", name: "emergency_contact_name", type: "text", readOnly: false },
                { label: "Emergency Contact Phone", name: "emergency_contact_phone", type: "tel", readOnly: false },
                { label: "Relationship", name: "emergency_contact_relationship", type: "text", readOnly: false },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-500">
            {/* Header / Edit Toggle */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-poppins font-bold text-brand-navy">My Personal Details</h2>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "cta" : "secondary"}
                    size="sm"
                    className="flex gap-2"
                >
                    {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
            </div>

            {sections.map((section, idx) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={section.title}
                    className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-light-gray/20 hover:shadow-md transition-all"
                >
                    <h3 className="text-lg font-bold text-brand-navy mb-6 border-b border-gray-100 pb-2 font-poppins">{section.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {section.fields.map((field) => (
                            <div key={field.name} className="flex flex-col gap-2">
                                <label className="text-xs font-bold font-inter text-gray-400 uppercase tracking-wider">{field.label}</label>
                                {isEditing && !field.readOnly ? (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        className="bg-brand-very-light/50 border border-brand-light-gray/50 rounded-xl px-4 py-3 text-brand-navy font-instrument focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all outline-none"
                                    />
                                ) : (
                                    <div className={cn(
                                        "px-4 py-3 rounded-xl font-instrument text-brand-navy border border-transparent",
                                        field.readOnly ? "bg-gray-50 text-gray-500 italic" : "bg-brand-very-light/20"
                                    )}>
                                        {formData[field.name] || '-'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
