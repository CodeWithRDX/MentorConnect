import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import logger from '../utils/logger';

const CallContext = createContext(null);

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback if crypto.randomUUID fails in non-secure contexts
    }
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const CallProvider = ({ children }) => {
  const { socket, registerSession, unregisterSession } = useSocket();
  const { user } = useAuth();
  const { setIncomingCallHandler } = useNotifications();
  const navigate = useNavigate();

  const [incomingCall, setIncomingCall] = useState(null);  // { from, name, roomId, offer }
  
  // Initialize activeCall state from sessionStorage to survive page refreshes
  const [activeCall, setActiveCall] = useState(() => {
    try {
      const cached = sessionStorage.getItem('activeCall');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [callStatus, setCallStatus] = useState('idle');    // idle | ringing | connecting | active | ended

  const ringtoneRef = useRef(null);

  // Keep socket active while in a call
  useEffect(() => {
    if (activeCall || callStatus !== 'idle') {
      registerSession();
      return () => {
        unregisterSession();
      };
    }
  }, [activeCall, callStatus, registerSession, unregisterSession]);

  // Helper to update activeCall state and persist to sessionStorage
  const updateActiveCall = useCallback((callData) => {
    setActiveCall(callData);
    try {
      if (callData) {
        sessionStorage.setItem('activeCall', JSON.stringify(callData));
      } else {
        sessionStorage.removeItem('activeCall');
      }
    } catch (e) {
      logger.warn('Failed to update call session storage', e);
    }
  }, []);

  // ── Play/stop ringtone ──────────────────────────────────────────────────────
  const playRingtone = useCallback(() => {
    try {
      if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio('/ringtone.mp3');
        ringtoneRef.current.loop = true;
      }
      ringtoneRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const stopRingtone = useCallback(() => {
    try {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    } catch {}
  }, []);

  // Incoming call handler (shared by Socket and SSE)
  const handleIncomingCall = useCallback(({ from, name, roomId, offer }) => {
    setIncomingCall({ from, name, roomId, offer });
    setCallStatus('ringing');
    playRingtone();
  }, [playRingtone]);

  // Register SSE call handler
  useEffect(() => {
    if (setIncomingCallHandler) {
      setIncomingCallHandler(handleIncomingCall);
    }
  }, [setIncomingCallHandler, handleIncomingCall]);

  // ── Socket event listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !user) return;

    // Remote side ended the call
    const handleCallEnd = ({ from, roomId, reason }) => {
      stopRingtone();
      setIncomingCall(null);
      updateActiveCall(null);
      setCallStatus('ended');
      // Brief delay then reset to idle so UI can show "call ended"
      setTimeout(() => setCallStatus('idle'), 2000);
    };

    // Remote side rejected the call
    const handleCallRejected = ({ from, roomId }) => {
      stopRingtone();
      setIncomingCall(null);
      updateActiveCall(null);
      setCallStatus('ended');
      setTimeout(() => setCallStatus('idle'), 2000);
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:end',      handleCallEnd);
    socket.on('call:rejected', handleCallRejected);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:end',      handleCallEnd);
      socket.off('call:rejected', handleCallRejected);
    };
  }, [socket, user, handleIncomingCall, stopRingtone, updateActiveCall]);

  // ── Accept incoming call ────────────────────────────────────────────────────
  const acceptCall = useCallback(() => {
    if (!incomingCall) return;
    stopRingtone();
    const { from, name, roomId, offer } = incomingCall;
    updateActiveCall({ roomId, peerId: from, peerName: name, role: 'callee', offer });
    setIncomingCall(null);
    setCallStatus('connecting');
    navigate(`/call/${roomId}`);
  }, [incomingCall, navigate, stopRingtone, updateActiveCall]);

  // ── Reject incoming call ────────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    if (!incomingCall || !socket) return;
    stopRingtone();
    socket.emit('call:rejected', { to: incomingCall.from, roomId: incomingCall.roomId });
    setIncomingCall(null);
    setCallStatus('idle');
  }, [incomingCall, socket, stopRingtone]);

  // ── Start an outgoing call ──────────────────────────────────────────────────
  const startCall = useCallback((peerId, peerName, bookingId) => {
    const roomId = generateUUID();
    logger.info(`[CallContext] Starting outgoing call to ${peerName} (ID: ${peerId}) with client roomId: ${roomId}`);
    updateActiveCall({ roomId, peerId, peerName, role: 'caller', bookingId });
    setCallStatus('connecting');
    navigate(`/call/${roomId}`);
  }, [navigate, updateActiveCall]);

  // ── End active call ─────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    if (socket && activeCall) {
      socket.emit('call:end', { to: activeCall.peerId, roomId: activeCall.roomId });
    }
    stopRingtone();
    updateActiveCall(null);
    setCallStatus('idle');
  }, [socket, activeCall, stopRingtone, updateActiveCall]);

  const value = {
    incomingCall,
    activeCall,
    callStatus,
    acceptCall,
    rejectCall,
    startCall,
    endCall,
    setActiveCall: updateActiveCall,
    setCallStatus,
  };

  return (
    <CallContext.Provider value={value}>
      {children}

      {/* Incoming Call Modal Overlay */}
      {incomingCall && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-bounce-in">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-blue-400 ring-offset-4 ring-offset-white dark:ring-offset-neutral-900 animate-pulse">
              <span className="text-white text-3xl font-bold">
                {incomingCall.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>

            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Incoming Video Call</p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
              {incomingCall.name || 'Unknown'}
            </h3>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={rejectCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                aria-label="Reject call"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>

              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                aria-label="Accept call"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>

            <button
              onClick={rejectCall}
              className="mt-4 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used inside <CallProvider>');
  return ctx;
};

export default CallContext;
