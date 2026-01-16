import { Mic, Video, FileText, Link as LinkIcon } from 'lucide-react';

const CONTENT_TYPES = [
    {
        id: 'audio',
        icon: Mic,
        title: 'Audio Recording',
        description: 'Upload or record audio lecture',
        color: 'blue'
    },
    {
        id: 'video',
        icon: Video,
        title: 'Video Recording',
        description: 'Upload video lecture with visuals',
        color: 'purple'
    },
    {
        id: 'text',
        icon: FileText,
        title: 'Text/Document',
        description: 'Write or paste lecture content',
        color: 'green'
    },
    {
        id: 'link',
        icon: LinkIcon,
        title: 'External Link',
        description: 'Link to external resource',
        color: 'orange'
    }
];

export default function ContentTypeStep({ formData, updateFormData, errors }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Choose Content Type
                </h3>
                <p className="text-sm text-slate-600">
                    Select how you want to deliver this lecture content
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONTENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.contentType === type.id;

                    return (
                        <button
                            key={type.id}
                            onClick={() => updateFormData({ contentType: type.id })}
                            className={`
                                p-6 rounded-lg border-2 transition-all text-left
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                }
                            `}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`
                                    w-12 h-12 rounded-lg flex items-center justify-center
                                    ${isSelected ? 'bg-blue-600' : 'bg-slate-100'}
                                `}>
                                    <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900 mb-1">
                                        {type.title}
                                    </h4>
                                    <p className="text-sm text-slate-600">
                                        {type.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {errors.contentType && (
                <p className="text-sm text-red-600">{errors.contentType}</p>
            )}

            {/* Info based on selection */}
            {formData.contentType && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                    <p className="text-sm font-medium text-slate-900 mb-2">
                        {formData.contentType === 'audio' && '🎙️ Audio lectures are great for:'}
                        {formData.contentType === 'video' && '🎥 Video lectures are great for:'}
                        {formData.contentType === 'text' && '📄 Text lectures are great for:'}
                        {formData.contentType === 'link' && '🔗 External links are great for:'}
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                        {formData.contentType === 'audio' && (
                            <>
                                <li>Discussions and explanations</li>
                                <li>Podcasts and interviews</li>
                                <li>Language learning</li>
                            </>
                        )}
                        {formData.contentType === 'video' && (
                            <>
                                <li>Demonstrations and tutorials</li>
                                <li>Visual explanations</li>
                                <li>Lab experiments</li>
                            </>
                        )}
                        {formData.contentType === 'text' && (
                            <>
                                <li>Reading materials</li>
                                <li>Study guides</li>
                                <li>Quick reference notes</li>
                            </>
                        )}
                        {formData.contentType === 'link' && (
                            <>
                                <li>YouTube videos</li>
                                <li>Interactive simulations</li>
                                <li>External resources</li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
