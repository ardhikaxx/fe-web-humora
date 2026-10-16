'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../lib/context/AdminContext';
import { Search, Film, Play, User, X, ChevronRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { series, episodes, users } = useAdmin();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredSeries = q
    ? series.filter((s) => s.title.toLowerCase().includes(q) || s.genres.some((g) => g.toLowerCase().includes(q))).slice(0, 4)
    : [];

  const filteredEpisodes = q
    ? episodes.filter((ep) => ep.title.toLowerCase().includes(q) || (ep.seriesTitle && ep.seriesTitle.toLowerCase().includes(q))).slice(0, 4)
    : [];

  const filteredUsers = q
    ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const totalResults = filteredSeries.length + filteredEpisodes.length + filteredUsers.length;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#EEE8F0] overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#EEE8F0] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#4B0B7A]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari series, episode, atau nama pengguna..."
            className="flex-1 bg-transparent border-none text-sm text-[#24172B] placeholder:text-[#786F7D] focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8]"
            aria-label="Tutup pencarian"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-xs text-[#786F7D]">
              Ketik judul series (misal: <em>Kontrak Jadi Pacar</em>), episode, atau nama pengguna.
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-[#786F7D]">
              Tidak ditemukan hasil untuk &ldquo;<strong>{query}</strong>&rdquo;
            </div>
          )}

          {filteredSeries.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#786F7D] uppercase tracking-wider mb-2">Series ({filteredSeries.length})</p>
              <div className="space-y-1">
                {filteredSeries.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigateTo(`/admin/series/${s.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F6F1F8] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F6F1F8] text-[#4B0B7A] group-hover:bg-[#4B0B7A] group-hover:text-white transition-colors">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#24172B]">{s.title}</p>
                        <p className="text-[11px] text-[#786F7D]">{s.genres.join(', ')} • {s.episodeCount} Episode</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#786F7D]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredEpisodes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#786F7D] uppercase tracking-wider mb-2">Episode ({filteredEpisodes.length})</p>
              <div className="space-y-1">
                {filteredEpisodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => navigateTo(`/admin/videos/${ep.id}/edit`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F6F1F8] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#EAF8F1] text-[#21865B] group-hover:bg-[#21865B] group-hover:text-white transition-colors">
                        <Play className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#24172B]">Ep {ep.number}: {ep.title}</p>
                        <p className="text-[11px] text-[#786F7D]">{ep.seriesTitle} • {ep.accessType === 'free' ? 'Free Preview' : 'Premium'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#786F7D]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#786F7D] uppercase tracking-wider mb-2">Pengguna ({filteredUsers.length})</p>
              <div className="space-y-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => navigateTo('/admin/users')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F6F1F8] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F3E8FF] text-[#6B21A8]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#24172B]">{u.name}</p>
                        <p className="text-[11px] text-[#786F7D]">{u.email} • {u.subscriptionStatus}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#786F7D]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F8F7FA] border-t border-[#EEE8F0] flex items-center justify-between text-[11px] text-[#786F7D]">
          <span>Gunakan panah untuk navigasi</span>
          <span className="bg-white px-2 py-0.5 rounded border border-[#EEE8F0] font-mono">ESC untuk keluar</span>
        </div>
      </div>
    </div>
  );
}
