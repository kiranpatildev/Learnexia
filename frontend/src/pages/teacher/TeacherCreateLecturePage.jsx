import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Upload, Loader2, Video, FileText } from 'lucide-react';
import { lectureService } from '../../services/lecture.service';

export function TeacherCreateLecturePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        description: '',
        video_file: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, video_file: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.subject) {
            alert("Title and Subject are required.");
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('subject', formData.subject);
            data.append('description', formData.description);
            if (formData.video_file) {
                data.append('video_file', formData.video_file);
            }

            await lectureService.createLecture(data);
            navigate('/teacher/lectures');
        } catch (error) {
            console.error('Error creating lecture:', error);
            alert('Failed to create lecture. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600"
                    onClick={() => navigate('/teacher/lectures')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lectures
                </Button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Create Lecture</h1>
                        <p className="text-sm text-slate-600 mt-1">Upload a new lecture recording and details</p>
                    </div>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Lecture Title*</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Introduction to Physics"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject*</Label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="e.g. Physics"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe the lecture content..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="video_file">Video File</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    id="video_file"
                                    name="video_file"
                                    accept="video/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {formData.video_file ? formData.video_file.name : 'Click to upload video'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        MP4, WebM up to 500MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/teacher/lectures')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Create Lecture
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
