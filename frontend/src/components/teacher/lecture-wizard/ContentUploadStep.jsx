import { useState, useEffect } from 'react';
import { Upload, Mic, Video, FileText, Link as LinkIcon, X, Loader2, StopCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useSpeechToText } from '../../../hooks/useSpeechToText'; // Import hook

export default function ContentUploadStep({ formData, updateFormData, errors }) {
    const [uploading, setUploading] = useState(false);
    const [audioInputType, setAudioInputType] = useState('record'); // 'record' or 'file'

    // Speech to text hook
    const {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        error: speechError,
        isSupported
    } = useSpeechToText();

    // Effect to synchronise transcript with textContent
    useEffect(() => {
        if (transcript) {
            // Append or update logic. 
            // We can just set it directly or append. 
            // If we want "live", we might just replace. 
            // But if user edits, transcript overwrites? 
            // Better: Store session transcript. Append it to existing text when stopped? 
            // Or update in real-time. 
            // If we update real-time, user's edits might conflict if they type while speaking.
            // Simplest: Just append the *new* transcript parts. But `transcript` grows.
            // Better: updateFormData({ textContent: transcript }). 
            // But if they uploaded text before?
            // Let's assume for this feature, if recording, it appends to current value.
            // Actually, `transcript` accumulates from hook start.
            // Let's rely on standard practice: 
            // Update textContent whenever transcript changes? 
            // But `transcript` is state.
            // If I do `updateFormData`, it updates parent state.
        }
    }, [transcript]);
    // Wait, the hook I wrote accumulates `transcript`.
    // I should probably manually "commit" the transcript to `textContent` on change?

    // Improved logic:
    // When transcript updates, update `textContent`. 
    // Since hook maintains full session transcript, we can set `textContent` to `initialText + transcript`.
    // But we don't know initialText easily if we keep updating.
    // Let's just create a local state `activeTranscript` and append it to `formData.textContent`?
    // No, if I update `formData.textContent`, I should just append the *diff*.
    // Actually, simply:
    // `textContent` field is controlled.
    // I will add a `useEffect` that updates `formData.textContent` when `transcript` changes.
    // But to avoid overwriting user edits, maybe strictly append?
    // Let's try: `updateFormData({ textContent: (formData.textContent + ' ' + finalTrans).trim() })`.
    // But the hook returns the *accumulated* transcript variable.
    // So if the hook returns "Hello", then "Hello World".
    // If I append, I get "Hello Hello World".
    // I need the hook to emit *chunks* or maintain the full text and I sync it.
    // My hook maintains `transcript`: "Hello World".
    // I will use `useEffect` to *sync* `transcript` to `textContent`... BUT ONLY IF I track `lastTranscriptLength`.

    // Easier way: 
    // Don't sync automatically.
    // Just show "Live Transcript" in a separate view/box while recording.
    // Then when stopped (or real-time), inject it into the main text area.
    // The requirement says: "As user speaks, text appears in the Text Content field".
    // So distinct box or same box? "populate the SAME Text Content field".

    // Implementation:
    // I'll modify the hook to just return chunks? 
    // Or I'll handle it here.
    // Actually my hook `onresult` accumulates to `transcript`.
    // If I use `interimTranscript`, that's the live part.
    // If I use `transcript`, that's final sentences.
    // I'll rewrite the `useEffect` below to `append` only the `diff`.
    // Actually simplicity:
    // Just maintain a `baseText` when recording starts.
    // `textContent = baseText + transcript + interimTranscript`.
    // This allows real-time update.

    const [baseText, setBaseText] = useState('');

    const handleStartRecording = () => {
        setBaseText(formData.textContent || '');
        startListening();
    };

    // When recording, the visible text is `baseText + transcript + interimTranscript`.
    // We update `formData.textContent` with this combined value.
    useEffect(() => {
        if (isListening) {
            const newText = (baseText + (baseText ? '\n' : '') + transcript + (transcript ? ' ' : '') + interimTranscript).trim();
            updateFormData({ textContent: newText });
        }
    }, [transcript, interimTranscript, isListening, baseText]);


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
                <div className="space-y-6">
                    {/* Input Method Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-lg select-none">
                        <button
                            onClick={() => setAudioInputType('record')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${audioInputType === 'record'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Mic className="w-4 h-4" />
                            Live Recording
                        </button>
                        <button
                            onClick={() => setAudioInputType('file')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${audioInputType === 'file'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Upload className="w-4 h-4" />
                            Upload File
                        </button>
                    </div>

                    {/* Live Recording Section */}
                    {audioInputType === 'record' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className={`bg-slate-50 border-2 ${isListening ? 'border-blue-400 bg-blue-50/10' : 'border-slate-200'} border-dashed rounded-lg p-8 text-center transition-all`}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
                                        }`}>
                                        <Mic className={`w-8 h-8 ${isListening ? 'text-red-600' : 'text-blue-600'}`} />
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-medium text-slate-900">
                                            {isListening ? 'Recording in progress...' : 'Ready to record'}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                            {isListening
                                                ? 'Speak clearly. Your words are being transcribed below.'
                                                : 'Click the button below to start converting your voice to text.'}
                                        </p>
                                    </div>

                                    {/* Error Message */}
                                    {speechError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {speechError}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        {!isListening ? (
                                            <Button
                                                onClick={handleStartRecording}
                                                className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                                                disabled={!isSupported}
                                            >
                                                <Mic className="w-4 h-4 mr-2" />
                                                Start Recording
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={stopListening}
                                                variant="destructive"
                                                className="bg-red-600 hover:bg-red-700 min-w-[140px]"
                                            >
                                                <StopCircle className="w-4 h-4 mr-2" />
                                                Stop
                                            </Button>
                                        )}
                                    </div>

                                    {!isSupported && (
                                        <p className="text-xs text-amber-600 mt-2">
                                            Browser not supported. Please use Chrome/Edge/Safari.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* File Upload Section */}
                    {audioInputType === 'file' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                                {formData.audioFile ? (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                            <FileText className="w-8 h-8 text-green-600" />
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
                                            Remove File
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                            <Upload className="w-8 h-8 text-slate-400" />
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
                        </div>
                    )}

                    {/* Shared Text Content Area */}
                    <div className="pt-4 border-t border-slate-200">
                        <Label htmlFor="textContent" className="flex justify-between items-center mb-2">
                            <span>
                                {audioInputType === 'record' ? 'Live Transcript' : 'Text Content / Backup Note'}
                            </span>
                            {audioInputType === 'record' && isListening && (
                                <span className="text-xs text-blue-600 animate-pulse font-medium flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    Transcribing...
                                </span>
                            )}
                        </Label>
                        <textarea
                            id="textContent"
                            value={formData.textContent}
                            onChange={(e) => updateFormData({ textContent: e.target.value })}
                            placeholder={audioInputType === 'record'
                                ? "Transcribed text will appear here automatically..."
                                : "Add optional notes or a transcript for the audio file..."}
                            rows={8}
                            className={`w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isListening ? 'border-blue-300 ring-2 ring-blue-50 shadow-inner bg-blue-50/5' : 'border-slate-300'
                                }`}
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            {audioInputType === 'record'
                                ? "You can edit this text after recording."
                                : "Providing text content improves accessibility for students."}
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
