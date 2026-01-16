import { useState } from 'react';
import { Upload, Mic, Video, FileText, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

export default function ContentUploadStep({ formData, updateFormData, errors }) {
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'audio') {
                updateFormData({ audioFile: file });
            } else if (type === 'video') {
                updateFormData({ videoFile: file });
            }
        }
    };

    const removeFile = (type) => {
        if (type === 'audio') {
            updateFormData({ audioFile: null });
        } else if (type === 'video') {
            updateFormData({ videoFile: null });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Upload Content
                </h3>
                <p className="text-sm text-slate-600">
                    Provide the lecture content for students
                </p>
            </div>

            {/* Audio Upload */}
            {formData.contentType === 'audio' && (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        {formData.audioFile ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <Mic className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{formData.audioFile.name}</p>
                                    <p className="text-sm text-slate-600">
                                        {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFile('audio')}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                    <Mic className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900 mb-2">Upload Audio File</h4>
                                    <p className="text-sm text-slate-600 mb-4">
                                        MP3, WAV, M4A (max 100MB)
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById('audio-upload').click()}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose File
                                    </Button>
                                    <input
                                        id="audio-upload"
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => handleFileUpload(e, 'audio')}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">or provide text content</span>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="textContent">Text Content (Optional)</Label>
                        <textarea
                            id="textContent"
                            value={formData.textContent}
                            onChange={(e) => updateFormData({ textContent: e.target.value })}
                            placeholder="Enter lecture content as text..."
                            rows={8}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            This will be used if audio file is not provided
                        </p>
                    </div>
                </div>
            )}

            {/* Video Upload */}
            {formData.contentType === 'video' && (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        {formData.videoFile ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                    <Video className="w-8 h-8 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{formData.videoFile.name}</p>
                                    <p className="text-sm text-slate-600">
                                        {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFile('video')}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                    <Video className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900 mb-2">Upload Video File</h4>
                                    <p className="text-sm text-slate-600 mb-4">
                                        MP4, MOV, AVI (max 500MB)
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById('video-upload').click()}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose File
                                    </Button>
                                    <input
                                        id="video-upload"
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleFileUpload(e, 'video')}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">or provide text content</span>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="textContent">Text Content (Optional)</Label>
                        <textarea
                            id="textContent"
                            value={formData.textContent}
                            onChange={(e) => updateFormData({ textContent: e.target.value })}
                            placeholder="Enter lecture content as text..."
                            rows={8}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            This will be used if video file is not provided
                        </p>
                    </div>
                </div>
            )}

            {/* Text Content */}
            {formData.contentType === 'text' && (
                <div>
                    <Label htmlFor="textContent">
                        Lecture Content <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                        id="textContent"
                        value={formData.textContent}
                        onChange={(e) => updateFormData({ textContent: e.target.value })}
                        placeholder="Enter your lecture content here..."
                        rows={16}
                        className={`w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${errors.content ? 'border-red-500' : 'border-slate-300'
                            }`}
                    />
                    <div className="flex justify-between mt-2">
                        {errors.content && (
                            <p className="text-sm text-red-600">{errors.content}</p>
                        )}
                        <p className="text-sm text-slate-500 ml-auto">
                            {formData.textContent.length} characters
                        </p>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-900 font-medium mb-2">💡 Formatting Tips:</p>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Use clear headings and sections</li>
                            <li>Break content into digestible paragraphs</li>
                            <li>Include examples and explanations</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* External Link */}
            {formData.contentType === 'link' && (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="linkUrl">
                            External Link URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="linkUrl"
                            type="url"
                            value={formData.linkUrl}
                            onChange={(e) => updateFormData({ linkUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={errors.content ? 'border-red-500' : ''}
                        />
                        {errors.content && (
                            <p className="text-sm text-red-600 mt-1">{errors.content}</p>
                        )}
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-900 font-medium mb-2">⚠️ External Link Guidelines:</p>
                        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                            <li>Ensure the link is accessible to all students</li>
                            <li>Verify the content is appropriate and educational</li>
                            <li>Check that the link is not behind a paywall</li>
                            <li>Consider providing a backup text summary</li>
                        </ul>
                    </div>

                    <div>
                        <Label htmlFor="textContent">Backup Text Content (Optional)</Label>
                        <textarea
                            id="textContent"
                            value={formData.textContent}
                            onChange={(e) => updateFormData({ textContent: e.target.value })}
                            placeholder="Provide a summary or transcript in case the link becomes unavailable..."
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            )}

            {errors.content && !['text', 'link'].includes(formData.contentType) && (
                <p className="text-sm text-red-600">{errors.content}</p>
            )}
        </div>
    );
}
