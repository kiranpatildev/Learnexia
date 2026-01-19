import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export function QuizTakePage() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (quiz?.time_limit && timeRemaining === null) {
            setTimeRemaining(quiz.time_limit * 60); // Convert minutes to seconds
        }
    }, [quiz]);

    useEffect(() => {
        if (timeRemaining !== null && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeRemaining]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            console.log('[QuizTake] Fetching quiz:', quizId);

            const quizResponse = await api.get(`/assessments/quizzes/${quizId}/`);
            console.log('[QuizTake] Quiz:', quizResponse.data);
            setQuiz(quizResponse.data);

            const questionsResponse = await api.get(`/assessments/questions/`, {
                params: { quiz: quizId }
            });
            console.log('[QuizTake] Questions:', questionsResponse.data);

            const questionsList = questionsResponse.data.results || questionsResponse.data || [];
            setQuestions(questionsList);
        } catch (error) {
            console.error('[QuizTake] Error:', error);
            alert('Failed to load quiz');
            navigate('/student/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, optionId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length === 0) {
            alert('Please answer at least one question');
            return;
        }

        try {
            setSubmitting(true);
            console.log('[QuizTake] Submitting answers:', answers);

            // TODO: Create quiz attempt and submit answers
            alert('Quiz submitted successfully!');
            navigate('/student/quizzes');
        } catch (error) {
            console.error('[QuizTake] Submit error:', error);
            alert('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!quiz || questions.length === 0) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-slate-600">No questions available for this quiz</p>
                        <Button onClick={() => navigate('/student/quizzes')} className="mt-4">
                            Back to Quizzes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/student/quizzes')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Quizzes
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
                        <p className="text-sm text-slate-600">
                            Question {currentQuestion + 1} of {questions.length}
                        </p>
                    </div>
                    {timeRemaining !== null && (
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Clock className="w-5 h-5" />
                            <span className={timeRemaining < 60 ? 'text-red-600' : 'text-slate-900'}>
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardContent className="p-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6">
                            {question.question_text}
                        </h2>

                        <div className="space-y-3">
                            {question.options?.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleAnswer(question.id, option.id)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[question.id] === option.id
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[question.id] === option.id
                                                ? 'border-blue-600 bg-blue-600'
                                                : 'border-slate-300'
                                            }`}>
                                            {answers[question.id] === option.id && (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <span className="text-slate-900">{option.option_text}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>

                    <div className="text-sm text-slate-600">
                        {Object.keys(answers).length} of {questions.length} answered
                    </div>

                    {currentQuestion < questions.length - 1 ? (
                        <Button onClick={handleNext}>
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
