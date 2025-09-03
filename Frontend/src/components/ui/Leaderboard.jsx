import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';

export const Leaderboard = ({ data, currentUserRollNo }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <Trophy className="w-5 h-5 text-blue-500" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-white';
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Leaderboard</h3>
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-gray-400" />
          </div>
          <p className="text-gray-500">No leaderboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {data.map((student, index) => {
          const rank = index + 1;
          const isCurrentUser = currentUserRollNo && student.rollNo === parseInt(currentUserRollNo);
          
          return (
            <div
              key={student.rollNo}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isCurrentUser 
                  ? 'bg-blue-50 border-2 border-blue-300 shadow-md' 
                  : getRankColor(rank)
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">{getRankIcon(rank)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{rank}</span>
                      <span className={`font-medium ${isCurrentUser ? 'text-blue-800' : ''}`}>
                        Roll {student.rollNo}
                      </span>
                      {isCurrentUser && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm opacity-75">
                      {student.division} • {student.percentage}% attendance
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${isCurrentUser ? 'text-blue-600' : ''}`}>
                    {student.points}
                  </div>
                  <div className="text-xs opacity-75">points</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};