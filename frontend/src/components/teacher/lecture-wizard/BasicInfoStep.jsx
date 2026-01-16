import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

export default function BasicInfoStep({ formData, updateFormData, errors, classrooms, subjects }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lecture Title */}
                <div className="md:col-span-2">
                    <Label htmlFor="title">
                        Lecture Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateFormData({ title: e.target.value })}
                        placeholder="e.g., Introduction to Photosynthesis"
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                        <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                    )}
                </div>

                {/* Classroom */}
                <div>
                    <Label htmlFor="classroom">
                        Classroom <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="classroom"
                        value={formData.classroom}
                        onChange={(e) => updateFormData({ classroom: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md ${errors.classroom ? 'border-red-500' : 'border-slate-300'
                            }`}
                    >
                        <option value="">Select a classroom</option>
                        {classrooms.map((classroom) => (
                            <option key={classroom.id} value={classroom.id}>
                                {classroom.grade} - {classroom.section} ({classroom.subject})
                            </option>
                        ))}
                    </select>
                    {errors.classroom && (
                        <p className="text-sm text-red-600 mt-1">{errors.classroom}</p>
                    )}
                </div>

                {/* Subject */}
                <div>
                    <Label htmlFor="subject">
                        Subject <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => updateFormData({ subject: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md ${errors.subject ? 'border-red-500' : 'border-slate-300'
                            }`}
                    >
                        <option value="">Select a subject</option>
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                    {errors.subject && (
                        <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
                    )}
                </div>

                {/* Duration */}
                <div>
                    <Label htmlFor="duration">
                        Duration (minutes) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => updateFormData({ duration: e.target.value })}
                        placeholder="45"
                        className={errors.duration ? 'border-red-500' : ''}
                    />
                    {errors.duration && (
                        <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
                    )}
                </div>

                {/* Tags */}
                <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => updateFormData({ tags: e.target.value })}
                        placeholder="biology, plants, science"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Separate tags with commas
                    </p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        placeholder="Brief description of the lecture content..."
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        {formData.description.length} / 500 characters
                    </p>
                </div>
            </div>

            {/* Help Text */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-900 font-medium">💡 Tips for creating effective lectures:</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Use clear, descriptive titles that indicate the topic</li>
                    <li>Add relevant tags to help students find related content</li>
                    <li>Provide a brief description to set expectations</li>
                </ul>
            </div>
        </div>
    );
}
