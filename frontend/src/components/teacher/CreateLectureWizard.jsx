import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import BasicInfoStep from './lecture-wizard/BasicInfoStep';
import ContentTypeStep from './lecture-wizard/ContentTypeStep';
import ContentUploadStep from './lecture-wizard/ContentUploadStep';
import ReviewStep from './lecture-wizard/ReviewStep';

const STEPS = [
    { id: 1, name: 'Basic Info', component: BasicInfoStep },
    { id: 2, name: 'Content Type', component: ContentTypeStep },
    { id: 3, name: 'Content', component: ContentUploadStep },
    { id: 4, name: 'Review', component: ReviewStep }
];

export default function CreateLectureWizard({ isOpen, onClose, onSubmit, classrooms, subjects }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Basic Info
        title: '',
        classroom: '',
        subject: '',
        description: '',
        duration: '',
        tags: '',

        // Content Type
        contentType: null, // 'audio', 'video', 'text', 'link'

        // Content
        audioFile: null,
        videoFile: null,
        textContent: '',
        linkUrl: '',

        // Status
        isDraft: false
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const updateFormData = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
        // Clear errors for updated fields
        const updatedFields = Object.keys(updates);
        setErrors(prev => {
            const newErrors = { ...prev };
            updatedFields.forEach(field => delete newErrors[field]);
            return newErrors;
        });
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.title.trim()) newErrors.title = 'Title is required';
            if (!formData.classroom) newErrors.classroom = 'Classroom is required';
            if (!formData.subject) newErrors.subject = 'Subject is required';
            if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0';
        }

        if (step === 2) {
            if (!formData.contentType) newErrors.contentType = 'Please select a content type';
        }

        if (step === 3) {
            if (formData.contentType === 'audio' && !formData.audioFile && !formData.textContent) {
                newErrors.content = 'Please upload an audio file or provide text content';
            }
            if (formData.contentType === 'video' && !formData.videoFile && !formData.textContent) {
                newErrors.content = 'Please upload a video file or provide text content';
            }
            if (formData.contentType === 'text' && !formData.textContent.trim()) {
                newErrors.content = 'Please provide text content';
            }
            if (formData.contentType === 'link' && !formData.linkUrl.trim()) {
                newErrors.content = 'Please provide a link URL';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (isDraft = false) => {
        if (!isDraft && !validateStep(currentStep)) {
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({ ...formData, isDraft });
            handleClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to create lecture' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setFormData({
            title: '',
            classroom: '',
            subject: '',
            description: '',
            duration: '',
            tags: '',
            contentType: null,
            audioFile: null,
            videoFile: null,
            textContent: '',
            linkUrl: '',
            isDraft: false
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    const CurrentStepComponent = STEPS[currentStep - 1].component;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-6 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">Create New Lecture</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            disabled={submitting}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                                        ${currentStep > step.id ? 'bg-blue-600 text-white' :
                                            currentStep === step.id ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                                                'bg-slate-100 text-slate-400'}
                                    `}>
                                        {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                                    </div>
                                    <span className={`text-sm font-medium hidden sm:block ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                                        }`}>
                                        {step.name}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <CurrentStepComponent
                        formData={formData}
                        updateFormData={updateFormData}
                        errors={errors}
                        classrooms={classrooms}
                        subjects={subjects}
                        setCurrentStep={setCurrentStep}
                    />

                    {errors.submit && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-900">{errors.submit}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t p-6 flex items-center justify-between">
                    <div>
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={submitting}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {currentStep === STEPS.length && (
                            <Button
                                variant="outline"
                                onClick={() => handleSubmit(true)}
                                disabled={submitting}
                            >
                                Save as Draft
                            </Button>
                        )}

                        {currentStep < STEPS.length ? (
                            <Button onClick={handleNext} disabled={submitting}>
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={() => handleSubmit(false)} disabled={submitting}>
                                {submitting ? 'Publishing...' : 'Publish Lecture'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
