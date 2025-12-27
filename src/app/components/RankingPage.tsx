import { ChevronRight, CheckCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTipRanking, getPopularWorksRanking, RankingUser as APIRankingUser, PopularWork } from '../services/backend-api';

interface RankingUser {
  id: string;
  rank: number;
  avatar: string;
  username: string;
  handle: string;
  isVerified: boolean;
  score?: number; // Added for display
}

interface RankingWork {
    id: string;
    rank: number;
    title: string;
    cover: string;
    author: string;
    authorAvatar: string;
    likes: number;
}

export function RankingPage() {
  const [characterRanking, setCharacterRanking] = useState<RankingUser[]>([]);
  const [workRanking, setWorkRanking] = useState<RankingWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetch
        const [tipsData, worksData] = await Promise.all([
            getTipRanking(5),
            getPopularWorksRanking(5)
        ]);

        if (tipsData.code === 200 && tipsData.data?.items) {
            const mappedUsers: RankingUser[] = tipsData.data.items.map((item: APIRankingUser) => ({
                id: item.user_id.toString(),
                rank: item.rank,
                avatar: item.avatar_url || 'https://github.com/shadcn.png',
                username: item.nickname,
                handle: `ID: ${item.user_id}`,
                isVerified: item.total_tipped_credits > 1000, // Mock logic
                score: item.total_tipped_credits
            }));
            setCharacterRanking(mappedUsers);
        }

        if (worksData.code === 200 && worksData.data?.items) {
            const mappedWorks: RankingWork[] = worksData.data.items.map((item: PopularWork) => ({
                id: item.work_id.toString(),
                rank: item.rank,
                title: item.title,
                cover: item.cover_url || '',
                author: item.creator.nickname,
                authorAvatar: item.creator.avatar_url || 'https://github.com/shadcn.png',
                likes: item.like_count
            }));
            setWorkRanking(mappedWorks);
        }

      } catch (error) {
        console.error("Failed to fetch rankings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)] overflow-y-auto">
      {/* Character Ranking Section (Mapped to Top Creators) */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--color-text-primary)]">创作者排行榜</h3>
          <button className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
             <div className="text-center text-[var(--color-text-secondary)] py-4">加载中...</div>
          ) : characterRanking.length === 0 ? (
             <div className="text-center text-[var(--color-text-secondary)] py-4">暂无数据</div>
          ) : (
            characterRanking.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3"
            >
              {/* Rank Number */}
              <div className={`w-6 text-center ${
                user.rank === 1 ? 'text-yellow-400' :
                user.rank === 2 ? 'text-gray-300' :
                user.rank === 3 ? 'text-amber-600' :
                'text-[var(--color-text-secondary)]'
              }`}>
                {user.rank}
              </div>

              {/* Avatar with Plus */}
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-[var(--color-background)] flex items-center justify-center">
                  <Plus className="w-3 h-3 text-black" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-text-primary)] truncate">
                    {user.username}
                  </span>
                  {user.isVerified && (
                    <CheckCircle className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 fill-[var(--color-primary)]" />
                  )}
                </div>
                <div className="flex justify-between items-center pr-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                    {user.handle}
                    </span>
                    <span className="text-xs text-[var(--color-primary)]">
                        {user.score} 积分
                    </span>
                </div>
              </div>

              {/* Action Button */}
              <button className="px-4 py-1.5 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors whitespace-nowrap">
                关注
              </button>
            </div>
          )))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-2 bg-[var(--color-surface)]" />

      {/* Creator Ranking Section (Mapped to Popular Works) */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--color-text-primary)]">热门作品</h3>
          <button className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
             <div className="text-center text-[var(--color-text-secondary)] py-4">加载中...</div>
          ) : workRanking.length === 0 ? (
             <div className="text-center text-[var(--color-text-secondary)] py-4">暂无数据</div>
          ) : (
          workRanking.map((work) => (
            <div
              key={`${work.id}-${work.rank}`}
              className="flex items-center gap-3"
            >
              {/* Rank Number */}
              <div className={`w-6 text-center ${
                work.rank === 1 ? 'text-yellow-400' :
                work.rank === 2 ? 'text-gray-300' :
                work.rank === 3 ? 'text-amber-600' :
                'text-[var(--color-text-secondary)]'
              }`}>
                {work.rank}
              </div>

              {/* Author Avatar */}
              <div className="relative">
                <img
                  src={work.authorAvatar}
                  alt={work.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>

              {/* Work Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-text-primary)] truncate">
                    {work.title}
                  </span>
                </div>
                <div className="flex justify-between items-center pr-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                    By {work.author}
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                        ❤️ {work.likes}
                    </span>
                </div>
              </div>

              {/* Video Thumbnail */}
              {work.cover ? (
                  <img src={work.cover} className="w-12 h-12 rounded object-cover bg-[var(--color-surface)]" alt="cover" />
              ) : (
                  <div className="w-12 h-12 rounded bg-[var(--color-surface)] flex items-center justify-center text-[10px] text-gray-500">
                      No Cover
                  </div>
              )}
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
