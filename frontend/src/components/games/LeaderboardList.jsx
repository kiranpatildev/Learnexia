import { Avatar } from '@/components/shared/Avatar';
import { mockLeaderboard, mockUser } from '@/services/mockData';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeaderboardList({ limit, compact, onUserClick }) {
    const data = limit ? mockLeaderboard.slice(0, limit) : mockLeaderboard;

    const renderRank = (rank) => {
        if (rank === 1) return <span className="text-2xl">🥇</span>;
        if (rank === 2) return <span className="text-2xl">🥈</span>;
        if (rank === 3) return <span className="text-2xl">🥉</span>;
        return <span className="text-gray-500 font-bold w-6 text-center">{rank}</span>;
    };

    const renderChange = (change) => {
        if (change > 0) return <span className="text-brand-green text-xs font-bold flex items-center gap-1"><TrendingUp size={12} /> +{change}</span>;
        if (change < 0) return <span className="text-brand-orange text-xs font-bold flex items-center gap-1"><TrendingDown size={12} /> {change}</span>;
        return <span className="text-gray-400 text-xs font-bold flex items-center gap-1"><Minus size={12} /> -</span>;
    };

    return (
        <div className="flex flex-col gap-4">
            {data.map((user) => (
                <div
                    key={user.rank}
                    className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 transform border border-transparent hover:scale-[1.02] hover:shadow-md cursor-pointer group",
                        user.username === mockUser.name ? "bg-brand-purple/5 border-brand-purple/20 shadow-sm" : "bg-white hover:bg-gray-50"
                    )}
                    onClick={() => onUserClick && onUserClick(user)}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center font-poppins">{renderRank(user.rank)}</div>
                        <Avatar src={user.avatar} alt={user.username} className="w-10 h-10 border-2 border-white shadow-sm group-hover:border-brand-yellow/50 transition-colors" />
                        <div>
                            <h4 className={cn("font-bold font-instrument text-brand-navy truncate max-w-[120px]", compact ? "text-sm" : "text-base")}>
                                {user.username} {user.username === mockUser.name && "(You)"}
                            </h4>
                            {!compact && <div className="text-xs text-gray-500 font-instrument">Level 12 • 5 Badges</div>}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 bg-brand-yellow/10 px-2 py-1 rounded-full">
                            <Star size={14} className="text-brand-yellow fill-brand-yellow animate-pulse" />
                            <span className="font-bold text-brand-navy font-poppins text-sm">{user.score}</span>
                        </div>
                        {/* Rank change indicator */}
                        {!compact && renderChange(user.rank_change)}
                    </div>
                </div>
            ))}
        </div>
    );
}
