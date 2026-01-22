import { useRef, useEffect } from 'react';
import { Button } from '../../ui/button';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function ExplanationModal({ explanation, onNext }) {
    const buttonRef = useRef(null);

    // Auto-focus the next button for keyboard usability
    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.focus();
        }
    }, []);

    if (!explanation) return null;

    const { text, isCorrect, correctAnswer } = explanation;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className={`p-4 flex flex-col items-center justify-center text-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                    {isCorrect ? (
                        <CheckCircle className="w-12 h-12 text-white mb-2" />
                    ) : (
                        <XCircle className="w-12 h-12 text-white mb-2" />
                    )}
                    <h3 className="text-2xl font-bold text-white">
                        {isCorrect ? 'Correct!' : 'Wrong!'}
                    </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!isCorrect && correctAnswer && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                            <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                                Correct Answer
                            </p>
                            <p className="text-green-800 font-medium leading-snug">
                                {correctAnswer}
                            </p>
                        </div>
                    )}

                    <div className="mb-6">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {text}
                        </p>
                    </div>

                    <Button
                        ref={buttonRef}
                        onClick={onNext}
                        className={`w-full py-6 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${isCorrect
                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            }`}
                    >
                        Continue <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
