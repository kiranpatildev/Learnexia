import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Mic, Video, FileText, Link as LinkIcon, Edit } from 'lucide-react';

export default function ReviewStep({ formData, updateFormData, errors, classrooms, subjects, setCurrentStep }) {
    const selectedClassroom = classrooms.find(c => c.id === formData.classroom);

    const getContentTypeIcon = () => {
        switch (formData.contentType) {
            case 'audio': return <Mic className="w-5 h-5 text-blue-600" />;
            case 'video': return <Video className="w-5 h-5 text-purple-600" />;
            case 'text': return <FileText className="w-5 h-5 text-green-600" />;
            case 'link': return <LinkIcon className="w-5 h-5 text-orange-600" />;
            default: return null;
        }
    };

    const getContentTypeName = () => {
        switch (formData.contentType) {
            case 'audio': return 'Audio Recording';
            case 'video': return 'Video Recording';
            case 'text': return 'Text/Document';
            case 'link': return 'External Link';
            default: return 'Unknown';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Review & Publish
                </h3>
                <p className="text-sm text-slate-600">
                    Review your lecture details before publishing
                </p>
            </div>

            {/* Basic Information */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Basic Information</h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-slate-600">Title</p>
                        <p className="font-medium text-slate-900">{formData.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-600">Classroom</p>
                            <p className="font-medium text-slate-900">
                                {selectedClassroom ?
                                    `${selectedClassroom.grade} - ${selectedClassroom.section}` :
                                    'Not selected'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Subject</p>
                            <p className="font-medium text-slate-900">{formData.subject}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-600">Duration</p>
                            <p className="font-medium text-slate-900">{formData.duration} minutes</p>
                        </div>
                        {formData.tags && (
                            <div>
                                <p className="text-sm text-slate-600">Tags</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {formData.tags.split(',').map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {tag.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {formData.description && (
                        <div>
                            <p className="text-sm text-slate-600">Description</p>
                            <p className="text-sm text-slate-900">{formData.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Type */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Content Type</h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                        {getContentTypeIcon()}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{getContentTypeName()}</p>
                        <p className="text-sm text-slate-600">
                            {formData.contentType === 'audio' && 'Audio lecture content'}
                            {formData.contentType === 'video' && 'Video lecture content'}
                            {formData.contentType === 'text' && 'Text-based lecture'}
                            {formData.contentType === 'link' && 'External resource link'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Preview */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">Content Preview</h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
                <div className="space-y-3">
                    {formData.contentType === 'audio' && formData.audioFile && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
                            <Mic className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{formData.audioFile.name}</p>
                                <p className="text-xs text-slate-600">
                                    {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                    )}
                    {formData.contentType === 'video' && formData.videoFile && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
                            <Video className="w-5 h-5 text-purple-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{formData.videoFile.name}</p>
                                <p className="text-xs text-slate-600">
                                    {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                    )}
                    {formData.contentType === 'text' && formData.textContent && (
                        <div className="p-3 bg-white rounded border border-slate-200">
                            <p className="text-sm text-slate-900 line-clamp-4 whitespace-pre-wrap">
                                {formData.textContent}
                            </p>
                            <p className="text-xs text-slate-600 mt-2">
                                {formData.textContent.length} characters
                            </p>
                        </div>
                    )}
                    {formData.contentType === 'link' && formData.linkUrl && (
                        <div className="p-3 bg-white rounded border border-slate-200">
                            <p className="text-sm font-medium text-slate-900 mb-1">External Link</p>
                            <a
                                href={formData.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline break-all"
                            >
                                {formData.linkUrl}
                            </a>
                        </div>
                    )}
                    {formData.textContent && ['audio', 'video', 'link'].includes(formData.contentType) && (
                        <div className="p-3 bg-white rounded border border-slate-200">
                            <p className="text-sm font-medium text-slate-900 mb-2">Additional Text Content</p>
                            <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">
                                {formData.textContent}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Publishing Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900 mb-2">📢 What happens after publishing?</p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Lecture will be visible to all students in the selected classroom</li>
                    <li>You can generate AI resources (notes, flashcards, quizzes) from this lecture</li>
                    <li>Students will be able to view and study the content</li>
                    <li>You can edit or delete the lecture anytime</li>
                </ul>
            </div>
        </div>
    );
}
