import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useActiveCommunication } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { toast } from '../components/ui/toaster';

const MAX_CHARS = 50000;

const SharedNotes = () => {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const { socket }    = useActiveCommunication();
  const { user }      = useAuth();

  const [content,     setContent]     = useState('');
  const [lastSaved,   setLastSaved]   = useState(null);
  const [isSaving,    setIsSaving]    = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);
  const [peerEditing, setPeerEditing] = useState(null); // name of peer currently editing

  const debounceRef  = useRef(null);
  const peerTimerRef = useRef(null);
  const textareaRef  = useRef(null);

  // ── Load existing note from DB ──────────────────────────────────────────────
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${bookingId}`);
        setContent(res.data.data.content || '');
        setLastSaved(new Date(res.data.data.updatedAt));
      } catch {
        toast('Failed to load notes', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [bookingId]);

  // ── Socket: join notes room + handle incoming changes ──────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.emit('notes:join', { bookingId });

    const handleUpdate = ({ content: incoming, fromName }) => {
      setContent(incoming);
      setPeerEditing(fromName || 'Someone');
      clearTimeout(peerTimerRef.current);
      peerTimerRef.current = setTimeout(() => setPeerEditing(null), 2000);
    };

    socket.on('notes:update', handleUpdate);
    return () => {
      socket.off('notes:update', handleUpdate);
      clearTimeout(peerTimerRef.current);
    };
  }, [socket, bookingId]);

  // ── Broadcast changes via socket (debounced 400ms) ──────────────────────────
  const handleChange = useCallback((e) => {
    const val = e.target.value.slice(0, MAX_CHARS);
    setContent(val);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socket?.emit('notes:update', { bookingId, content: val });
    }, 400);
  }, [socket, bookingId]);

  // ── Save to DB ──────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await api.put(`/notes/${bookingId}`, { content });
      setLastSaved(new Date());
      toast('Notes saved!', 'success');
    } catch {
      toast('Failed to save notes', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [bookingId, content]);

  // ── Ctrl+S shortcut ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const formatTime = (date) => {
    if (!date) return null;
    const now  = new Date();
    const diff = Math.round((now - date) / 1000);
    if (diff < 5)  return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">Shared Notes</h1>
            <p className="text-xs text-neutral-400">Session notes • Ctrl+S to save</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Peer editing indicator */}
          {peerEditing && (
            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {peerEditing} is editing…
            </span>
          )}

          {/* Last saved */}
          {lastSaved && (
            <span className="text-xs text-neutral-400">
              Saved {formatTime(lastSaved)}
            </span>
          )}

          {/* Character count */}
          <span className={`text-xs ${content.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-neutral-400'}`}>
            {content.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2"
          >
            {isSaving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>Save</>
            )}
          </button>
        </div>
      </div>

      {/* ── Editor ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="Start typing your shared notes here…&#10;&#10;Both participants can edit in real-time.&#10;Press Ctrl+S (or ⌘+S) to save permanently."
            className="w-full h-full min-h-[calc(100vh-220px)] p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm resize-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
            spellCheck
          />
          {/* Peer editing highlight overlay */}
          {peerEditing && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{peerEditing} is editing</span>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-400 dark:text-neutral-600">
          <span>💡 Changes sync in real-time</span>
          <span>💾 Use Save to persist permanently</span>
          <span>⌨️ Ctrl+S / ⌘+S for quick save</span>
        </div>
      </div>
    </div>
  );
};

export default SharedNotes;
