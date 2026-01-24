import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import gamesService from '../../services/games.service';
import QuickDropGame from '../../components/games/QuickDropGame/QuickDropGame';
import { HotPotatoGame } from '../../components/games/HotPotatoGame/HotPotatoGame';
import { MatchPairsGame } from '../../components/games/MatchPairsGame/MatchPairsGame';
import CrosswordGame from '../../components/games/CrosswordGame/CrosswordGame';
import { Button } from '../../components/ui/button';

export function GamePlayerPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGameType = async () => {
            try {
                const data = await gamesService.getGameDetail(id);
                setGame(data);
            } catch (err) {
                console.error("Failed to fetch game details:", err);
                setError("Unable to load game information.");
            } finally {
                setLoading(false);
            }
        };

        fetchGameType();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="text-slate-400 mb-6">{error || "Game not found"}</p>
                    <Button onClick={() => navigate('/student/games')} variant="outline">
                        Back to Library
                    </Button>
                </div>
            </div>
        );
    }

    // Router Logic based on Template Code
    const templateCode = game.template?.code;

    if (templateCode === 'fall_drop' || templateCode === 'quick_drop') {
        return <QuickDropGame />;
    }

    if (templateCode === 'hot_potato') {
        return <HotPotatoGame />;
    }

    if (templateCode === 'match_pairs') {
        return <MatchPairsGame />;
    }

    if (templateCode === 'crossword') {
        return <CrosswordGame />;
    }

    // Placeholder for other game types
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
            <div className="max-w-md text-center bg-slate-800 p-8 rounded-2xl border border-slate-700">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    🎮
                </div>
                <h1 className="text-2xl font-bold mb-2">{game.title}</h1>
                <p className="text-slate-400 mb-6">
                    This game type ({game.template?.name}) is currently under development.
                    Check back soon!
                </p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate('/student/games')} className="bg-blue-600 hover:bg-blue-700">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
                    </Button>
                </div>
            </div>
        </div>
    );
}
