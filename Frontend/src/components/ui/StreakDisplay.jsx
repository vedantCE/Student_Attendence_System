import { Flame, Zap, Sparkles, BookOpen, Trophy, Target } from 'lucide-react';

export const StreakDisplay = ({ streaks }) => {
  const getStreakIcon = (streak) => {
    if (streak >= 10) return <Flame className="w-8 h-8" />;
    if (streak >= 5) return <Zap className="w-8 h-8" />;
    if (streak >= 3) return <Sparkles className="w-8 h-8" />;
    return <BookOpen className="w-8 h-8" />;
  };

  const getStreakColor = (streak) => {
    if (streak >= 10) return 'from-red-500 to-orange-500';
    if (streak >= 5) return 'from-yellow-500 to-orange-500';
    if (streak >= 3) return 'from-blue-500 to-purple-500';
    return 'from-gray-400 to-gray-500';
  };

  const activeStreaks = Object.entries(streaks).filter(([_, data]) => data.isActive && data.current >= 2);

  if (activeStreaks.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="text-blue-600">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Build Your Streak!</h3>
            <p className="text-sm text-gray-600">Attend consecutive classes to start your streak</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeStreaks.map(([subject, data]) => (
        <div key={subject} className={`bg-gradient-to-r ${getStreakColor(data.current)} rounded-xl p-4 text-white shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-white">{getStreakIcon(data.current)}</div>
              <div>
                <h3 className="font-bold text-lg">{subject} Streak!</h3>
                <p className="text-sm opacity-90">{data.current} consecutive classes attended</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{data.current}</div>
              <div className="text-xs opacity-75">Best: {data.max}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};