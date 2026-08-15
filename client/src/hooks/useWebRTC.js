import { useEffect, useRef, useState, useCallback } from 'react';
import { useActiveCommunication } from '../context/SocketContext';
import logger from '../utils/logger';

// ICE servers config — free Google STUN + optional TURN from env
const getIceServers = () => {
  const servers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ];

  const turnUrl = import.meta.env.VITE_TURN_URL;
  if (turnUrl) {
    servers.push({
      urls:       turnUrl,
      username:   import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || '',
    });
  }

  return servers;
};

/**
 * useWebRTC — Abstracts WebRTC peer connection for video calling
 *
 * @param {Object} params
 * @param {string} params.roomId       — Unique room identifier
 * @param {string} params.peerId       — Socket user ID of the remote peer
 * @param {string} params.role         — 'caller' | 'callee'
 * @param {Object} params.initialOffer — SDP offer (for callee only)
 */
const useWebRTC = ({ roomId, peerId, role, initialOffer }) => {
  const { socket } = useActiveCommunication();

  const [localStream,  setLocalStream]  = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted,      setIsMuted]      = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isCameraOff,  setIsCameraOff]  = useState(false);
  const [isRemoteCameraOff, setIsRemoteCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState('new'); // new|connecting|connected|disconnected|failed
  const [permissionError, setPermissionError] = useState(null);

  const peerRef          = useRef(null);
  const localStreamRef   = useRef(null);
  const screenStreamRef  = useRef(null);
  const iceCandidateQueue = useRef([]);
  const isSetupDone      = useRef(false);

  // ── Create RTCPeerConnection ────────────────────────────────────────────────
  const createPeer = useCallback(() => {
    const peer = new RTCPeerConnection({
      iceServers: getIceServers(),
      iceCandidatePoolSize: 10,
    });

    peer.onicecandidate = ({ candidate }) => {
      if (candidate && socket) {
        socket.emit('call:ice-candidate', { to: peerId, candidate, roomId });
      }
    };

    peer.ontrack = (event) => {
      logger.debug('[useWebRTC] Received remote track:', event.track.kind);
      
      const track = event.track;

      track.onmute = () => {
        if (track.kind === 'video') setIsRemoteCameraOff(true);
        if (track.kind === 'audio') setIsRemoteMuted(true);
      };

      track.onunmute = () => {
        if (track.kind === 'video') setIsRemoteCameraOff(false);
        if (track.kind === 'audio') setIsRemoteMuted(false);
      };

      // Set initial status based on current track state
      if (track.kind === 'video') setIsRemoteCameraOff(track.muted);
      if (track.kind === 'audio') setIsRemoteMuted(track.muted);

      if (event.streams?.[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        setRemoteStream((prevStream) => {
          if (prevStream) {
            const filteredTracks = prevStream.getTracks().filter(t => t.kind !== event.track.kind);
            return new MediaStream([...filteredTracks, event.track]);
          } else {
            const newStream = new MediaStream();
            newStream.addTrack(event.track);
            return newStream;
          }
        });
      }
    };

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState);
    };

    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === 'failed') {
        peer.restartIce();
      }
    };

    return peer;
  }, [socket, peerId, roomId]);

  // ── Get local media (camera + mic) ──────────────────────────────────────────
  const getLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setPermissionError(null);
      return stream;
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera/microphone permission denied. Please allow access in your browser settings.'
        : err.name === 'NotFoundError'
        ? 'No camera or microphone found. Please connect a device.'
        : `Media error: ${err.message}`;
      setPermissionError(msg);
      throw err;
    }
  }, []);

  // ── Add queued ICE candidates ────────────────────────────────────────────────
  const drainIceQueue = useCallback(async (peer) => {
    for (const candidate of iceCandidateQueue.current) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        logger.error('[useWebRTC] Error adding queued ICE candidate', err);
      }
    }
    iceCandidateQueue.current = [];
  }, []);

  // ── Initialize as CALLER ────────────────────────────────────────────────────
  const initAsCaller = useCallback(async () => {
    if (isSetupDone.current) {
      return;
    }
    isSetupDone.current = true;

    try {
      const stream = await getLocalMedia();
      const peer = createPeer();
      peerRef.current = peer;

      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
      });

      const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await peer.setLocalDescription(offer);

      socket.emit('call:initiate', { to: peerId, offer: peer.localDescription, roomId }, (res) => {
        if (!res?.success) {
          setPermissionError(res?.error || 'Failed to initiate call');
        }
      });
    } catch (err) {
      logger.error('[useWebRTC] Error in initAsCaller', err);
    }
  }, [getLocalMedia, createPeer, socket, peerId, roomId]);

  // ── Initialize as CALLEE ────────────────────────────────────────────────────
  const initAsCallee = useCallback(async () => {
    if (isSetupDone.current) {
      return;
    }
    if (!initialOffer) {
      logger.warn('[useWebRTC] initAsCallee aborted — missing initialOffer');
      return;
    }
    isSetupDone.current = true;

    try {
      const stream = await getLocalMedia();
      const peer = createPeer();
      peerRef.current = peer;

      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
      });

      await peer.setRemoteDescription(new RTCSessionDescription(initialOffer));
      await drainIceQueue(peer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('call:answer', { to: peerId, answer: peer.localDescription, roomId });
    } catch (err) {
      logger.error('[useWebRTC] Error in initAsCallee', err);
    }
  }, [getLocalMedia, createPeer, initialOffer, drainIceQueue, socket, peerId, roomId]);

  // ── Handle answer (caller side) ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleAnswer = async ({ answer, roomId: inRoomId }) => {
      if (inRoomId !== roomId || !peerRef.current) {
        logger.warn('[useWebRTC] Ignoring call:answer (room ID mismatch or peer not created yet)');
        return;
      }
      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        await drainIceQueue(peerRef.current);
      } catch (err) {
        logger.error('[useWebRTC] Error handling call:answer', err);
      }
    };

    socket.on('call:answer', handleAnswer);
    return () => socket.off('call:answer', handleAnswer);
  }, [socket, roomId, drainIceQueue]);

  // ── Handle ICE candidates ───────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleIce = async ({ candidate, roomId: inRoomId }) => {
      if (inRoomId !== roomId) return;
      const peer = peerRef.current;
      if (peer && peer.remoteDescription) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          logger.error('[useWebRTC] Error adding ICE candidate', err);
        }
      } else {
        iceCandidateQueue.current.push(candidate);
      }
    };

    socket.on('call:ice-candidate', handleIce);
    return () => socket.off('call:ice-candidate', handleIce);
  }, [socket, roomId]);

  // ── Handle remote screen share state changes ────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleRemoteScreenShare = () => {
      setTimeout(() => {
        if (peerRef.current) {
          const remoteTracks = peerRef.current.getReceivers().map(r => r.track).filter(Boolean);
          if (remoteTracks.length > 0) {
            setRemoteStream(new MediaStream(remoteTracks));
          }
        }
      }, 250);
    };

    socket.on('call:screen-share-start', handleRemoteScreenShare);
    socket.on('call:screen-share-stop',  handleRemoteScreenShare);

    return () => {
      socket.off('call:screen-share-start', handleRemoteScreenShare);
      socket.off('call:screen-share-stop',  handleRemoteScreenShare);
    };
  }, [socket]);

  // ── Handle remote camera toggle state ───────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleCameraToggle = ({ enabled }) => {
      setIsRemoteCameraOff(!enabled);
    };

    socket.on('call:camera-toggle', handleCameraToggle);
    return () => socket.off('call:camera-toggle', handleCameraToggle);
  }, [socket]);

  // ── Handle remote mic toggle state ──────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleMicToggle = ({ enabled }) => {
      setIsRemoteMuted(!enabled);
    };

    socket.on('call:mic-toggle', handleMicToggle);
    return () => socket.off('call:mic-toggle', handleMicToggle);
  }, [socket]);

  // ── Setup on mount based on role ────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !peerId) return;
    if (role === 'caller') initAsCaller();
    else                   initAsCallee();
  }, [socket, peerId, role, initAsCaller, initAsCallee]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
      isSetupDone.current = false;
    };
  }, []);

  // ── Controls ────────────────────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      if (socket) socket.emit('call:mic-toggle', { to: peerId, enabled: audioTrack.enabled });
    }
  }, [socket, peerId]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
      if (socket) socket.emit('call:camera-toggle', { to: peerId, enabled: videoTrack.enabled });
    }
  }, [socket, peerId]);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in peer connection (robust transceiver lookup)
      const sender = peerRef.current?.getSenders().find(s => 
        s.track?.kind === 'video' || 
        peerRef.current.getTransceivers().find(t => t.sender === s)?.receiver?.track?.kind === 'video'
      );
      if (sender) await sender.replaceTrack(screenTrack);

      // Update local stream preview
      const currentStream = localStreamRef.current;
      if (currentStream) {
        currentStream.getVideoTracks().forEach(t => t.enabled = false);
      }
      setLocalStream(new MediaStream([...localStreamRef.current.getAudioTracks(), screenTrack]));

      setIsScreenSharing(true);
      if (socket) socket.emit('call:screen-share-start', { to: peerId, roomId });

      // Auto-stop when user clicks browser stop button
      screenTrack.onended = () => stopScreenShare();
    } catch {}
  }, [socket, peerId, roomId]);

  const stopScreenShare = useCallback(async () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());

    // Restore camera track
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    if (cameraTrack) {
      cameraTrack.enabled = true;
      const sender = peerRef.current?.getSenders().find(s => 
        s.track?.kind === 'video' || 
        peerRef.current.getTransceivers().find(t => t.sender === s)?.receiver?.track?.kind === 'video'
      );
      if (sender) await sender.replaceTrack(cameraTrack);
      setLocalStream(new MediaStream([...localStreamRef.current.getAudioTracks(), cameraTrack]));
    }

    setIsScreenSharing(false);
    if (socket) socket.emit('call:screen-share-stop', { to: peerId, roomId });
  }, [socket, peerId, roomId]);

  return {
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
  };
};

export default useWebRTC;
