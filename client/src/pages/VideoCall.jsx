import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCall } from '../context/CallContext';
import { useAuth } from '../context/AuthContext';
import useWebRTC from '../hooks/useWebRTC';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { activeCall, endCall, setCallStatus } = useCall();
  const { user } = useAuth();

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef(null);
  const durationTimerRef = useRef(null);

  const {
    localStream,
    remoteStream,
    isMuted,
    isRemoteMuted,
    isCameraOff,
    isRemoteCameraOff,
    isScreenSharing,
    connectionState,
    permissionError,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC({
    roomId,
    peerId:        activeCall?.peerId,
    role:          activeCall?.role || 'caller',
    initialOffer:  activeCall?.offer,
  });

  // ── Attach streams to video elements ────────────────────────────────────────
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(err => {
        console.warn('[VideoCall] Autoplay local stream blocked or failed:', err);
      });
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        console.warn('[VideoCall] Autoplay remote stream blocked or failed:', err);
      });
    }
  }, [remoteStream]);

  // ── Call duration timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (connectionState === 'connected') {
      setCallStatus('active');
      durationTimerRef.current = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(durationTimerRef.current);
  }, [connectionState, setCallStatus]);

  // ── Automatic redirection when call ends ───────────────────────────────────
  useEffect(() => {
    if (!activeCall) {
      const redirectTimer = setTimeout(() => {
        const dashboardPath = user?.role === 'mentor' ? '/mentor/dashboard' : '/mentee/dashboard';
        navigate(dashboardPath);
      }, 2000);
      return () => clearTimeout(redirectTimer);
    }
  }, [activeCall, user, navigate]);

  // ── Auto-hide controls after 3s of inactivity ───────────────────────────────
  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimerRef.current);
  }, []);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    endCall();
    navigate(-1);
  };

  // ── Permission error screen ─────────────────────────────────────────────────
  if (permissionError) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-neutral-900 rounded-2xl p-8 max-w-md text-center shadow-2xl border border-neutral-800">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Camera/Mic Access Required</h2>
          <p className="text-neutral-400 mb-6 text-sm leading-relaxed">{permissionError}</p>
          <button
            onClick={handleEndCall}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition"
          >
            Leave Call
          </button>
        </div>
      </div>
    );
  }

  const statusLabel = {
    new:          'Initializing…',
    connecting:   'Connecting…',
    connected:    formatDuration(callDuration),
    disconnected: 'Reconnecting…',
    failed:       'Connection failed',
    closed:       'Call ended',
  }[connectionState] || 'Connecting…';

  const statusColor = connectionState === 'connected'
    ? 'bg-green-500'
    : connectionState === 'failed'
    ? 'bg-red-500'
    : 'bg-yellow-500';

  return (
    <div
      className="relative min-h-screen bg-neutral-950 overflow-hidden select-none"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* ── Remote video (full screen) ─────────────────────────────────────── */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${isRemoteCameraOff ? 'invisible' : ''}`}
      />

      {/* Placeholder when remote camera is turned off */}
      {remoteStream && isRemoteCameraOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950">
          <div className="w-28 h-28 rounded-full bg-neutral-800 flex items-center justify-center mb-4 ring-4 ring-white/10">
            <span className="text-white text-5xl font-bold">
              {activeCall?.peerName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <p className="text-white text-xl font-semibold">{activeCall?.peerName || 'Participant'}</p>
          <p className="text-neutral-400 mt-2 text-sm">Camera is off</p>
        </div>
      )}

      {/* Placeholder when remote not connected */}
      {!remoteStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 ring-4 ring-white/10 animate-pulse">
            <span className="text-white text-5xl font-bold">
              {activeCall?.peerName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <p className="text-white text-xl font-semibold">{activeCall?.peerName || 'Connecting…'}</p>
          <p className="text-neutral-400 mt-2 text-sm">{statusLabel}</p>
        </div>
      )}

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColor} ${connectionState === 'connected' ? '' : 'animate-pulse'}`} />
          <span className="text-white text-sm font-medium bg-black/40 backdrop-blur px-3 py-1 rounded-full">
            {connectionState === 'connected' ? formatDuration(callDuration) : statusLabel}
          </span>
        </div>
        {activeCall?.peerName && (
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">
              {activeCall.peerName}
            </span>
            {isRemoteMuted && (
              <svg className="w-4 h-4 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* ── Local video (PiP) ─────────────────────────────────────────────── */}
      <div className="absolute top-16 right-4 z-20 w-32 h-44 md:w-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-neutral-800">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isCameraOff ? 'invisible' : ''}`}
        />
        {isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
            <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{user?.name?.[0]?.toUpperCase() || 'Y'}</span>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="text-white text-xs bg-black/60 px-2 py-0.5 rounded-full">You</span>
        </div>
      </div>

      {/* ── Bottom control bar ────────────────────────────────────────────── */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 z-10 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-center gap-4">

          {/* Mute / Unmute */}
          <ControlButton
            active={!isMuted}
            onClick={toggleMic}
            label={isMuted ? 'Unmute' : 'Mute'}
            activeIcon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            }
            inactiveIcon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            }
          />

          {/* Camera toggle */}
          <ControlButton
            active={!isCameraOff}
            onClick={toggleCamera}
            label={isCameraOff ? 'Start Video' : 'Stop Video'}
            activeIcon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            }
            inactiveIcon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM3 3l18 18" />
            }
          />

          {/* Screen Share */}
          <ControlButton
            active={!isScreenSharing}
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            label={isScreenSharing ? 'Stop Share' : 'Share Screen'}
            activeColor="bg-blue-600 hover:bg-blue-700"
            inactiveColor="bg-blue-600/30 hover:bg-blue-600"
            activeIcon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            }
            inactiveIcon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            }
            isActive={isScreenSharing}
          />

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="End call"
          >
            <svg className="w-7 h-7 rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="text-white/60 text-xs w-16 text-center">{isMuted ? 'Unmute' : 'Mute'}</span>
          <span className="text-white/60 text-xs w-16 text-center">{isCameraOff ? 'Start Video' : 'Stop Video'}</span>
          <span className="text-white/60 text-xs w-16 text-center">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
          <span className="text-white/60 text-xs w-16 text-center">End Call</span>
        </div>
      </div>
    </div>
  );
};

// ── Reusable control button ──────────────────────────────────────────────────
const ControlButton = ({ active, onClick, label, activeIcon, inactiveIcon, isActive, activeColor = 'bg-white/20 hover:bg-white/30', inactiveColor = 'bg-white/10 hover:bg-white/20' }) => (
  <button
    onClick={onClick}
    className={`w-14 h-14 rounded-full ${isActive !== undefined ? (isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/20 hover:bg-white/30') : (active ? activeColor : inactiveColor)} text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur`}
    aria-label={label}
  >
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {active ? activeIcon : inactiveIcon}
    </svg>
  </button>
);

export default VideoCall;
