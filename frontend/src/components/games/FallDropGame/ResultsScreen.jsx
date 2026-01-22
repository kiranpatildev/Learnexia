import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Trophy, Home, RotateCcw, Target, Zap, Clock, Award } from 'lucide-react';
import { Badge } from '../../ui/badge';
import Confetti from 'react-confetti';


export default function ResultsScreen({ results, onReplay, onExit }) {
    // For simplicity without external deps like react-use, pass window size or default
    const width = window.innerWidth;
    const height = window.innerHeight;

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />

            <Card className="w-full max-w-2xl bg-white/95 backdrop-blur shadow-2xl border-0 overflow-hidden text-center fade-in zoom-in duration-500">

                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <Trophy className="w-20 h-20 mx-auto mb-4 drop-shadow-lg text-yellow-300 fill-yellow-300 animate-bounce" />
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Game Completed!</h1>
                    <p className="text-blue-100 font-medium">Great effort!</p>
                </div>

                <CardContent className="p-8">
                    {/* Main Score */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Final Score</div>
                        <div className="text-6xl font-black text-slate-800 tabular-nums">
                            {results.final_score.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                +{results.xp_earned} XP Earned
                            </Badge>
                            {results.rank && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                    Rank #{results.rank}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-slate-800">{Math.round(results.accuracy)}%</div>
                            <div className="text-xs text-slate-500 font-medium uppercase">Accuracy</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-slate-800">{results.max_combo}x</div>
                            <div className="text-xs text-slate-500 font-medium uppercase">Max Combo</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-slate-800">{results.time_taken}s</div>
                            <div className="text-xs text-slate-500 font-medium uppercase">Time</div>
                        </div>
                    </div>

                    {/* Insights / Badges */}
                    {results.insights?.strengths?.length > 0 && (
                        <div className="mb-8 text-left bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                                <Award className="w-4 h-4" /> Strong Points
                            </h4>
                            <ul className="space-y-1">
                                {results.insights.strengths.map((str, i) => (
                                    <li key={i} className="text-sm text-blue-700 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {str}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Badges Earned */}
                    {results.badges_earned?.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Badges Unlocked</h4>
                            <div className="flex flex-wrap justify-center gap-3">
                                {results.badges_earned.map((badge, i) => (
                                    <div key={i} className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-amber-100 border border-amber-200 rounded-xl shadow-sm animate-bounce-in" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="text-2xl mb-1 transform hover:scale-110 transition-transform">🏆</div>
                                        <div className="text-xs font-bold text-amber-900 text-center leading-tight max-w-[80px]">{badge.name}</div>
                                        <div className="text-[10px] font-medium text-amber-700 mt-1">+{badge.xp_reward} XP</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={onExit}
                            variant="outline"
                            className="w-full sm:w-auto py-6"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Back to Library
                        </Button>
                        <Button
                            onClick={onReplay}
                            className="w-full sm:w-auto py-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Play Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
