import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocketService } from '../services/useWebSocketService';
import { endDebateRoom, getDebate, type DebateRoomDto } from '../services/api';

const WS_URL = `${import.meta.env.VITE_API_URL}/ws-YunoBall-testing`;

type ChatMessage = { sender: string; content: string };

type RoundDto = { name: string; segment12Minutes: number; segment3Minutes: number };

type DebateSnapshot = {
  phase: string;
  roomId: string;
  hostUsername: string;
  guestUsername: string | null;
  viewers: string[];
  bannedUsernames: string[];
  pendingGuestRequestUsernames?: string[];
  currentRoundIndex: number;
  currentSegment: number;
  rounds: RoundDto[];
  segmentEndsAtEpochMs: number | null;
  pollEndsAtEpochMs: number | null;
  pollVotesHost: number;
  pollVotesGuest: number;
  pollWinnerUsername: string | null;
  debateWinnerUsername: string | null;
  hostMuted: boolean;
  guestMuted: boolean;
  hostCamOn: boolean;
  hostScreenOn: boolean;
  guestCamOn: boolean;
  guestScreenOn: boolean;
  error?: string | null;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

function sendDebate(
  send: (dest: string, body: Record<string, unknown>) => void,
  roomId: string,
  type: string,
  username: string,
  extra: Record<string, unknown> = {},
) {
  send(`/YunoBall/debate/${roomId}/event`, { type, username, ...extra });
}

export default function TestRoom() {
  const { roomId: roomIdParam } = useParams();
  const roomId = roomIdParam ?? '';
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'You';

  const [meta, setMeta] = useState<DebateRoomDto | null>(null);
  const [metaError, setMetaError] = useState('');
  const [debate, setDebate] = useState<DebateSnapshot | null>(null);

  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const viewerHostCamVideoRef = useRef<HTMLVideoElement | null>(null);
  const viewerHostScreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const viewerHostAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerUsernameRef = useRef<string | null>(null);
  const hostViewerPcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const viewerRecvPcRef = useRef<RTCPeerConnection | null>(null);
  const viewerHostVideoOrderRef = useRef(0);
  const debateRef = useRef<DebateSnapshot | null>(null);
  const roleRef = useRef<'host' | 'guest' | 'viewer'>('viewer');

  const camStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [roundDraft, setRoundDraft] = useState<RoundDto>({ name: 'Round 1', segment12Minutes: 5, segment3Minutes: 10 });
  const [roundsConfig, setRoundsConfig] = useState<RoundDto[]>([{ name: 'Round 1', segment12Minutes: 5, segment3Minutes: 10 }]);
  const [showRoundEditor, setShowRoundEditor] = useState(false);
  const [kickBanOpen, setKickBanOpen] = useState(false);
  const [kickBanSearch, setKickBanSearch] = useState('');
  const [guestInviteOpen, setGuestInviteOpen] = useState(false);
  const [guestInviteSearch, setGuestInviteSearch] = useState('');

  const { connect, subscribe, send, unsubscribe, disconnect, isConnected } = useWebSocketService(
    WS_URL,
    () => {},
    () => {},
  );

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  useEffect(() => {
    if (!roomId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const m = await getDebate(roomId);
        if (!cancelled) {
          setMeta(m);
        }
      } catch (e) {
        if (!cancelled) {
          setMetaError(e instanceof Error ? e.message : 'Could not load room');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const role = useMemo(() => {
    if (!debate) {
      return 'viewer' as const;
    }
    if (debate.hostUsername === username) {
      return 'host' as const;
    }
    if (debate.guestUsername === username) {
      return 'guest' as const;
    }
    return 'viewer' as const;
  }, [debate, username]);

  const peerUsername = useMemo(() => {
    if (!debate) {
      return null;
    }
    if (role === 'host') {
      return debate.guestUsername;
    }
    if (role === 'guest') {
      return debate.hostUsername;
    }
    return null;
  }, [debate, role]);

  debateRef.current = debate;
  roleRef.current = role;

  useEffect(() => {
    peerUsernameRef.current = peerUsername;
  }, [peerUsername]);

  const hostViewerTargetsKey = !debate
    ? ''
    : [...debate.viewers].filter((x) => x !== username && x !== debate.guestUsername).sort().join(',');

  const kickBanFiltered = (() => {
    const base = !debate
      ? []
      : [...debate.viewers].filter((v) => v !== username && v !== debate.guestUsername).sort();
    const q = kickBanSearch.trim().toLowerCase();
    if (!q) {
      return base;
    }
    return base.filter((v) => v.toLowerCase().startsWith(q));
  })();

  const guestInviteFiltered = (() => {
    const base = [...(debate?.pendingGuestRequestUsernames ?? [])].sort();
    const q = guestInviteSearch.trim().toLowerCase();
    if (!q) {
      return base;
    }
    return base.filter((v) => v.toLowerCase().startsWith(q));
  })();

  /** Only host and current guest run camera, screen share, and WebRTC. */
  const needsMedia = useMemo(
    () => Boolean(meta?.hostUsername === username || debate?.guestUsername === username),
    [meta?.hostUsername, debate?.guestUsername, username],
  );

  const onDebateMessage = useCallback((msg: DebateSnapshot) => {
    const raw = msg as DebateSnapshot & { pendingGuestRequestUsername?: string | null };
    const pendingGuestRequestUsernames =
      msg.pendingGuestRequestUsernames ??
      (raw.pendingGuestRequestUsername ? [raw.pendingGuestRequestUsername] : []);
    setDebate({ ...msg, pendingGuestRequestUsernames });
  }, []);

  const debateTopic = roomId ? `/topic/room/${roomId}/debate` : null;
  const chatTopic = roomId ? `/topic/room/${roomId}` : null;

  useEffect(() => {
    if (!isConnected || !debateTopic) {
      return;
    }
    subscribe(debateTopic, onDebateMessage);
    return () => {
      unsubscribe(debateTopic);
    };
  }, [isConnected, debateTopic, subscribe, unsubscribe, onDebateMessage]);

  const onChatMessage = useCallback((msg: { sender: string; content: string }) => {
    setChatMessages((prev) => [...prev, { sender: msg.sender, content: msg.content }]);
  }, []);

  useEffect(() => {
    if (!isConnected || !chatTopic) {
      return;
    }
    subscribe(chatTopic, onChatMessage);
    return () => {
      unsubscribe(chatTopic);
    };
  }, [isConnected, chatTopic, subscribe, unsubscribe, onChatMessage]);

  useEffect(() => {
    if (!isConnected || !roomId || !meta || meta.status !== 'ACTIVE') {
      return;
    }
    sendDebate(send, roomId, 'JOIN', username);
    return () => {
      sendDebate(send, roomId, 'LEAVE', username);
    };
  }, [isConnected, roomId, send, username, meta]);

  const attachHostMediaToViewerPc = useCallback((pc: RTCPeerConnection) => {
    const cam = camStreamRef.current;
    const screen = screenStreamRef.current;
    const seen = new Set(
      pc
        .getSenders()
        .map((s) => s.track?.id)
        .filter((id): id is string => Boolean(id)),
    );
    if (cam) {
      cam.getTracks().forEach((t) => {
        if (!seen.has(t.id)) {
          pc.addTrack(t, cam);
          seen.add(t.id);
        }
      });
    }
    if (screen) {
      screen.getTracks().forEach((t) => {
        if (!seen.has(t.id)) {
          pc.addTrack(t, screen);
          seen.add(t.id);
        }
      });
    }
    for (const s of [...pc.getSenders()]) {
      if (s.track?.readyState === 'ended') {
        pc.removeTrack(s);
      }
    }
  }, []);

  const handleGuestSignalRemote = useCallback(
    async (from: string | undefined, payload: Record<string, unknown>) => {
      const signalType = payload.signalType as string | undefined;
      const pc = pcRef.current;
      if (!pc || !from) {
        return;
      }
      try {
        if (signalType === 'offer' && payload.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: payload.sdp as string }));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          send(`/YunoBall/debate/${roomId}/event`, {
            type: 'WEBRTC_SIGNAL',
            username,
            targetUsername: from,
            payload: { signalType: 'answer', sdp: answer.sdp, to: from },
          });
        } else if (signalType === 'answer' && payload.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: payload.sdp as string }));
        } else if (signalType === 'ice' && payload.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate as RTCIceCandidateInit));
        }
      } catch {
        /* ignore */
      }
    },
    [roomId, send, username],
  );

  const ensureViewerRecvPc = useCallback(() => {
    if (viewerRecvPcRef.current) {
      return viewerRecvPcRef.current;
    }
    viewerHostVideoOrderRef.current = 0;
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.ontrack = (e) => {
      const t = e.track;
      if (t.kind === 'audio') {
        const a = viewerHostAudioRef.current;
        if (a) {
          const ms = e.streams[0] ?? new MediaStream([t]);
          a.srcObject = ms;
          void a.play().catch(() => {});
        }
        return;
      }
      if (t.kind === 'video') {
        const settings = (typeof t.getSettings === 'function' ? t.getSettings() : {}) as { displaySurface?: string };
        const idx = viewerHostVideoOrderRef.current++;
        const isDisplayCapture = Boolean(settings.displaySurface);
        const ms = new MediaStream([t]);
        const toScreen = isDisplayCapture || idx > 0;
        const el = toScreen ? viewerHostScreenVideoRef.current : viewerHostCamVideoRef.current;
        if (el) {
          el.srcObject = ms;
          void el.play().catch(() => {});
        }
      }
    };
    pc.onicecandidate = (e) => {
      const host = debateRef.current?.hostUsername;
      if (e.candidate && host) {
        send(`/YunoBall/debate/${roomId}/event`, {
          type: 'WEBRTC_SIGNAL',
          username,
          targetUsername: host,
          payload: { signalType: 'ice', candidate: e.candidate.toJSON(), to: host },
        });
      }
    };
    viewerRecvPcRef.current = pc;
    return pc;
  }, [roomId, send, username]);

  const handleViewerWebRtc = useCallback(
    async (fromHost: string, payload: Record<string, unknown>) => {
      const signalType = payload.signalType as string | undefined;
      const pc = ensureViewerRecvPc();
      try {
        if (signalType === 'offer' && payload.sdp) {
          viewerHostVideoOrderRef.current = 0;
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: payload.sdp as string }));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          send(`/YunoBall/debate/${roomId}/event`, {
            type: 'WEBRTC_SIGNAL',
            username,
            targetUsername: fromHost,
            payload: { signalType: 'answer', sdp: answer.sdp, to: fromHost },
          });
        } else if (signalType === 'answer' && payload.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: payload.sdp as string }));
        } else if (signalType === 'ice' && payload.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate as RTCIceCandidateInit));
        }
      } catch {
        /* ignore */
      }
    },
    [ensureViewerRecvPc, roomId, send, username],
  );

  const handleHostWebRtcFromViewer = useCallback(async (fromViewer: string, payload: Record<string, unknown>) => {
    const signalType = payload.signalType as string | undefined;
    const pc = hostViewerPcsRef.current.get(fromViewer);
    if (!pc) {
      return;
    }
    try {
      if (signalType === 'answer' && payload.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: payload.sdp as string }));
      } else if (signalType === 'ice' && payload.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate as RTCIceCandidateInit));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isConnected || !roomId) {
      return;
    }
    const sub = `/topic/room/${roomId}/webrtc`;
    const handler = (raw: unknown) => {
      const ev = raw as { type?: string; username?: string; targetUsername?: string; payload?: Record<string, unknown> };
      if (ev.type !== 'WEBRTC_SIGNAL' || !ev.payload) {
        return;
      }
      const target = (ev.payload.to as string) || ev.targetUsername;
      if (target && target !== username) {
        return;
      }
      const from = ev.username;
      const d = debateRef.current;
      const r = roleRef.current;
      if (r === 'viewer' && from === d?.hostUsername) {
        void handleViewerWebRtc(from, ev.payload);
        return;
      }
      if (r === 'host' && from && d && d.viewers.includes(from) && from !== d.guestUsername) {
        void handleHostWebRtcFromViewer(from, ev.payload);
        return;
      }
      if ((r === 'host' && from === d?.guestUsername) || (r === 'guest' && from === d?.hostUsername)) {
        void handleGuestSignalRemote(from, ev.payload);
        return;
      }
    };
    subscribe(sub, handler);
    return () => unsubscribe(sub);
  }, [
    handleGuestSignalRemote,
    handleHostWebRtcFromViewer,
    handleViewerWebRtc,
    isConnected,
    roomId,
    subscribe,
    unsubscribe,
    username,
  ]);

  const ensurePc = useCallback(() => {
    if (pcRef.current) {
      return pcRef.current;
    }
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };
    pc.onicecandidate = (e) => {
      const peer = peerUsernameRef.current;
      if (e.candidate && peer) {
        send(`/YunoBall/debate/${roomId}/event`, {
          type: 'WEBRTC_SIGNAL',
          username,
          targetUsername: peer,
          payload: { signalType: 'ice', candidate: e.candidate.toJSON(), to: peer },
        });
      }
    };
    pcRef.current = pc;
    return pc;
  }, [roomId, send, username]);

  useEffect(() => {
    return () => {
      hostViewerPcsRef.current.forEach((pc) => pc.close());
      hostViewerPcsRef.current.clear();
      viewerRecvPcRef.current?.close();
      viewerRecvPcRef.current = null;
      viewerHostVideoOrderRef.current = 0;
    };
  }, []);

  useEffect(() => {
    if (role !== 'host') {
      hostViewerPcsRef.current.forEach((pc) => pc.close());
      hostViewerPcsRef.current.clear();
    }
  }, [role]);

  useEffect(() => {
    if (role !== 'viewer') {
      viewerRecvPcRef.current?.close();
      viewerRecvPcRef.current = null;
      viewerHostVideoOrderRef.current = 0;
    }
  }, [role]);

  useEffect(() => {
    if (role !== 'host' || !isConnected || !roomId || !hasLocalStream) {
      return;
    }
    const map = hostViewerPcsRef.current;
    const viewers = hostViewerTargetsKey ? hostViewerTargetsKey.split(',') : [];

    for (const [v, pc] of [...map.entries()]) {
      if (!viewers.includes(v)) {
        pc.close();
        map.delete(v);
      }
    }

    const run = async () => {
      for (const v of viewers) {
        if (!v) {
          continue;
        }
        let pc = map.get(v);
        if (!pc) {
          pc = new RTCPeerConnection(ICE_SERVERS);
          map.set(v, pc);
          pc.onicecandidate = (e) => {
            if (e.candidate) {
              send(`/YunoBall/debate/${roomId}/event`, {
                type: 'WEBRTC_SIGNAL',
                username,
                targetUsername: v,
                payload: { signalType: 'ice', candidate: e.candidate.toJSON(), to: v },
              });
            }
          };
        }
        attachHostMediaToViewerPc(pc);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send(`/YunoBall/debate/${roomId}/event`, {
            type: 'WEBRTC_SIGNAL',
            username,
            targetUsername: v,
            payload: { signalType: 'offer', sdp: offer.sdp, to: v },
          });
        } catch {
          /* ignore */
        }
      }
    };
    void run();
  }, [
    attachHostMediaToViewerPc,
    camOn,
    hasLocalStream,
    hostViewerTargetsKey,
    isConnected,
    role,
    roomId,
    screenOn,
    send,
    username,
  ]);

  useEffect(() => {
    if (!needsMedia || !roomId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          cam.getTracks().forEach((t) => t.stop());
          return;
        }
        camStreamRef.current = cam;
        setHasLocalStream(true);
        cam.getVideoTracks().forEach((t) => {
          t.enabled = true;
        });
        setCamOn(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cam;
          void localVideoRef.current.play().catch(() => {});
        }
        const pc = ensurePc();
        cam.getTracks().forEach((t) => pc.addTrack(t, cam));
      } catch {
        setCamOn(false);
        setHasLocalStream(false);
        send(`/YunoBall/debate/${roomId}/event`, {
          type: 'MEDIA_UPDATE',
          username,
          payload: { camOn: false, screenOn: false },
        });
      }
    })();
    return () => {
      cancelled = true;
      setHasLocalStream(false);
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenOn(false);
      pcRef.current?.close();
      pcRef.current = null;
      hostViewerPcsRef.current.forEach((pc) => pc.close());
      hostViewerPcsRef.current.clear();
    };
  }, [ensurePc, needsMedia, roomId, send, username]);

  useEffect(() => {
    if (!needsMedia) {
      return;
    }
    const v = localVideoRef.current;
    const s = camStreamRef.current;
    if (v && s) {
      v.srcObject = s;
      void v.play().catch(() => {});
    }
  }, [needsMedia, role, debate?.guestUsername, camOn]);

  useEffect(() => {
    if (debate?.rounds?.length) {
      setRoundsConfig(
        debate.rounds.map((r) => ({
          name: r.name,
          segment12Minutes: r.segment12Minutes,
          segment3Minutes: r.segment3Minutes,
        })),
      );
    }
  }, [debate?.rounds]);

  useEffect(() => {
    if (!needsMedia || !isConnected || !roomId) {
      return;
    }
    send(`/YunoBall/debate/${roomId}/event`, {
      type: 'MEDIA_UPDATE',
      username,
      payload: { camOn, screenOn },
    });
  }, [needsMedia, camOn, screenOn, isConnected, roomId, send, username]);

  useEffect(() => {
    if (!needsMedia) {
      return;
    }
    const el = screenVideoRef.current;
    const stream = screenStreamRef.current;
    if (!el) {
      return;
    }
    if (screenOn && stream) {
      el.srcObject = stream;
      void el.play().catch(() => {});
      const vt = stream.getVideoTracks()[0];
      if (vt) {
        vt.onended = () => {
          stream.getTracks().forEach((t) => t.stop());
          screenStreamRef.current = null;
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
          setScreenOn(false);
        };
      }
    } else {
      el.srcObject = null;
    }
  }, [needsMedia, screenOn]);

  useEffect(() => {
    if (!debate || !peerUsername || (role !== 'host' && role !== 'guest')) {
      return;
    }
    const pc = ensurePc();
    const run = async () => {
      if (role === 'host') {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send(`/YunoBall/debate/${roomId}/event`, {
            type: 'WEBRTC_SIGNAL',
            username,
            targetUsername: peerUsername,
            payload: { signalType: 'offer', sdp: offer.sdp, to: peerUsername },
          });
        } catch {
          /* ignore */
        }
      }
    };
    void run();
  }, [debate?.guestUsername, debate?.hostUsername, ensurePc, peerUsername, role, roomId, send, username]);

  useEffect(() => {
    if (!debate || !camStreamRef.current) {
      return;
    }
    const stream = camStreamRef.current;
    const audio = stream.getAudioTracks()[0];
    if (!audio) {
      return;
    }
    if (role === 'host' && debate.hostMuted) {
      audio.enabled = false;
    } else if (role === 'guest' && debate.guestMuted) {
      audio.enabled = false;
    } else {
      audio.enabled = true;
    }
  }, [debate, role]);

  const toggleScreen = async () => {
    if (!needsMedia) {
      return;
    }
    if (screenOn) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setScreenOn(false);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = s;
      const pc = ensurePc();
      s.getTracks().forEach((t) => pc.addTrack(t, s));
      setScreenOn(true);
    } catch {
      /* user cancelled */
    }
  };

  const toggleCam = () => {
    if (!needsMedia) {
      return;
    }
    const s = camStreamRef.current;
    if (s) {
      const tracks = s.getVideoTracks();
      const nextOn = !tracks.some((t) => t.enabled);
      tracks.forEach((t) => {
        t.enabled = nextOn;
      });
      setCamOn(nextOn);
      if (nextOn && localVideoRef.current) {
        localVideoRef.current.srcObject = s;
        void localVideoRef.current.play().catch(() => {});
      }
    }
  };

  const leaveDebate = async () => {
    try {
      if (meta?.hostUsername === username && roomId) {
        await endDebateRoom(roomId);
      }
    } catch {
      /* WS cleanup still sends LEAVE */
    }
    if (chatTopic) {
      unsubscribe(chatTopic);
    }
    if (debateTopic) {
      unsubscribe(debateTopic);
    }
    disconnect();
    navigate('/dashboard/home');
  };

  const endDebateForHost = async () => {
    if (meta?.hostUsername !== username || !roomId) {
      return;
    }
    try {
      await endDebateRoom(roomId);
    } catch {
      sendDebate(send, roomId, 'END_ROOM', username);
    }
    if (chatTopic) {
      unsubscribe(chatTopic);
    }
    if (debateTopic) {
      unsubscribe(debateTopic);
    }
    disconnect();
    navigate('/dashboard/home');
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !isConnected) {
      return;
    }
    send(`/YunoBall/handleMessage/${roomId}`, { content: message, sender: username, roomId });
    setMessage('');
  };

  const requestGuest = () => sendDebate(send, roomId, 'REQUEST_GUEST', username);
  const acceptGuestInvite = (target: string) =>
    sendDebate(send, roomId, 'ACCEPT_GUEST', username, { targetUsername: target });
  const declineGuestInvite = (target: string) =>
    sendDebate(send, roomId, 'DECLINE_GUEST', username, { targetUsername: target });
  const kick = (target: string) => sendDebate(send, roomId, 'KICK', username, { targetUsername: target });
  const ban = (target: string) => sendDebate(send, roomId, 'BAN', username, { targetUsername: target });

  const pushRound = () => {
    setRoundsConfig((r) => [...r, { ...roundDraft }]);
  };

  const applyRoundConfig = () => {
    send(`/YunoBall/debate/${roomId}/event`, {
      type: 'CONFIGURE_ROUNDS',
      username,
      payload: { rounds: roundsConfig },
    });
    setShowRoundEditor(false);
  };

  const startDebate = () => {
    send(`/YunoBall/debate/${roomId}/event`, {
      type: 'START_DEBATE',
      username,
    });
  };

  const vote = (choice: 'HOST' | 'GUEST') => {
    send(`/YunoBall/debate/${roomId}/event`, {
      type: 'POLL_VOTE',
      username,
      payload: { choice },
    });
  };

  const title = meta?.title ?? 'Debate';
  const split = Boolean(debate?.guestUsername);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!debate || (debate.phase !== 'LIVE' && debate.phase !== 'POLL')) {
      return;
    }
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [debate?.phase]);

  const segLeft = useMemo(() => {
    if (debate?.segmentEndsAtEpochMs == null) {
      return null;
    }
    return Math.max(0, Math.floor((debate.segmentEndsAtEpochMs - Date.now()) / 1000));
  }, [debate?.segmentEndsAtEpochMs, tick]);

  const pollLeft = useMemo(() => {
    if (debate?.pollEndsAtEpochMs == null) {
      return null;
    }
    return Math.max(0, Math.floor((debate.pollEndsAtEpochMs - Date.now()) / 1000));
  }, [debate?.pollEndsAtEpochMs, tick]);

  if (metaError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <p className="text-red-600">{metaError}</p>
          <button type="button" className="text-blue-600 underline" onClick={() => navigate('/dashboard/join')}>
            Back to join
          </button>
        </div>
      </div>
    );
  }

  if (meta?.status === 'ENDED') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6 bg-gray-950 text-gray-100">
        <div className="max-w-md text-center space-y-3">
          <p className="text-lg text-gray-200">This debate has ended.</p>
          <p className="text-sm text-gray-500">It will no longer appear in active listings.</p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm"
            onClick={() => navigate('/dashboard/join')}
          >
            Back to debates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-950 text-gray-100 w-full overflow-hidden">
      <header className="shrink-0 border-b border-purple-500/40 bg-gray-900/80 px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-purple-400 truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Room: {roomId} · You: {username} ({role})
          </p>
          {debate?.error && <p className="text-xs text-amber-400 mt-1">{debate.error}</p>}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {meta?.hostUsername === username && (
            <button
              type="button"
              onClick={() => void endDebateForHost()}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-500/40"
            >
              End debate
            </button>
          )}
          <button
            type="button"
            onClick={() => void leaveDebate()}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-orange-300 border border-orange-500/40"
          >
            Leave
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto p-3 sm:p-4 gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
            <span>Phase: {debate?.phase ?? '…'}</span>
            {debate?.phase === 'LIVE' && segLeft !== null && <span>Segment ends in: {segLeft}s</span>}
            {debate?.phase === 'POLL' && pollLeft !== null && <span>Poll ends in: {pollLeft}s</span>}
          </div>

          {debate?.phase === 'ENDED' && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
              The host ended this debate. You can leave when you are ready.
            </div>
          )}

          <div className={`grid gap-3 flex-1 min-h-0 ${split ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            <section className="flex flex-col gap-2 min-h-[200px]">
              <h2 className="text-sm text-purple-300">Host — {debate?.hostUsername}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="aspect-video rounded-lg bg-black/60 border border-purple-500/40 flex items-center justify-center overflow-hidden relative">
                  {role === 'host' && hasLocalStream && (
                    <>
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`absolute inset-0 w-full h-full object-cover ${camOn ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
                      />
                      {!camOn && (
                        <span className="relative z-10 text-xs text-gray-400 px-2 text-center">Camera off</span>
                      )}
                    </>
                  )}
                  {role === 'host' && !hasLocalStream && (
                    <span className="text-xs text-gray-500 px-2 text-center">Allow camera &amp; mic to go on camera</span>
                  )}
                  {role === 'guest' && (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  )}
                  {role === 'viewer' && (
                    <>
                      <audio ref={viewerHostAudioRef} autoPlay playsInline className="hidden" />
                      <video
                        ref={viewerHostCamVideoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                      {!debate?.hostCamOn && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
                          <span className="text-xs text-gray-400 px-2 text-center">Host camera off</span>
                        </div>
                      )}
                    </>
                  )}
                  {role === 'host' && debate?.hostMuted && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-xs px-2 py-1 rounded z-20">Muted (segment rules)</div>
                  )}
                </div>
                <div className="aspect-video rounded-lg bg-black/60 border border-purple-500/30 flex items-center justify-center overflow-hidden relative">
                  {role === 'host' && (
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute inset-0 w-full h-full object-contain bg-black ${screenOn ? 'z-0' : 'opacity-0 pointer-events-none'}`}
                    />
                  )}
                  {role === 'host' && !screenOn && (
                    <span className="relative z-10 text-xs text-gray-500 px-2 text-center">
                      {debate?.hostScreenOn ? 'Host screen share' : 'Host is not sharing their screen'}
                    </span>
                  )}
                  {role === 'viewer' && (
                    <video
                      ref={viewerHostScreenVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute inset-0 w-full h-full object-contain bg-black ${debate?.hostScreenOn ? 'z-0 opacity-100' : 'opacity-0 pointer-events-none'}`}
                    />
                  )}
                  {role !== 'host' && role !== 'viewer' && (
                    <span className="text-xs text-gray-500 px-2 text-center">
                      {debate?.hostScreenOn ? 'Host screen share active' : 'Host is not sharing their screen'}
                    </span>
                  )}
                  {role === 'viewer' && !debate?.hostScreenOn && (
                    <span className="relative z-10 text-xs text-gray-500 px-2 text-center">Host is not sharing their screen</span>
                  )}
                </div>
              </div>
            </section>

            {split && (
              <section className="flex flex-col gap-2 min-h-[200px]">
                <h2 className="text-sm text-cyan-300">Guest — {debate?.guestUsername}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="aspect-video rounded-lg bg-black/60 border border-cyan-500/40 flex items-center justify-center overflow-hidden relative">
                    {role === 'guest' && hasLocalStream && (
                      <>
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`absolute inset-0 w-full h-full object-cover ${camOn ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
                        />
                        {!camOn && (
                          <span className="relative z-10 text-xs text-gray-400 px-2 text-center">Camera off</span>
                        )}
                      </>
                    )}
                    {role === 'guest' && !hasLocalStream && (
                      <span className="text-xs text-gray-500 px-2 text-center">Allow camera &amp; mic to go on camera</span>
                    )}
                    {role === 'host' && (
                      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    )}
                    {role === 'viewer' && (
                      <span className="text-xs text-gray-500 px-2 text-center">Spectator — guest stream is peer-to-peer for debaters</span>
                    )}
                    {role === 'guest' && debate?.guestMuted && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-xs px-2 py-1 rounded z-20">Muted (segment rules)</div>
                    )}
                  </div>
                  <div className="aspect-video rounded-lg bg-black/60 border border-cyan-500/30 flex items-center justify-center">
                    <span className="text-xs text-gray-500 px-2 text-center">
                      {debate?.guestScreenOn ? 'Guest screen share active' : 'Guest is not sharing their screen'}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {needsMedia && (
              <>
                <button
                  type="button"
                  onClick={toggleCam}
                  className="px-3 py-2 rounded-lg text-sm bg-gray-800 border border-purple-500/30"
                >
                  {camOn ? 'Turn off camera' : 'Turn on camera'}
                </button>
                <button type="button" onClick={() => void toggleScreen()} className="px-3 py-2 rounded-lg text-sm bg-gray-800 border border-purple-500/30">
                  {screenOn ? 'Stop screen share' : 'Share screen'}
                </button>
              </>
            )}
            {role === 'viewer' && (
              <button type="button" onClick={requestGuest} className="px-3 py-2 rounded-lg text-sm bg-purple-600 text-white">
                Request to debate
              </button>
            )}
            {role === 'host' && !debate?.guestUsername && (
              <button
                type="button"
                onClick={() => setGuestInviteOpen(true)}
                className="px-3 py-2 rounded-lg text-sm bg-green-900/80 border border-green-500/40 text-green-100"
              >
                Guest requests
                {(() => {
                  const n = debate?.pendingGuestRequestUsernames?.length ?? 0;
                  return n > 0 ? (
                    <span className="ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-green-600 px-1 text-xs">
                      {n}
                    </span>
                  ) : null;
                })()}
              </button>
            )}
            {role === 'host' && (
              <button type="button" onClick={() => setShowRoundEditor(true)} className="px-3 py-2 rounded-lg text-sm bg-gray-800 border border-purple-500/30">
                Configure rounds
              </button>
            )}
            {role === 'host' && (
              <button
                type="button"
                onClick={() => setKickBanOpen(true)}
                className="px-3 py-2 rounded-lg text-sm bg-gray-800 border border-amber-500/40 text-amber-200"
              >
                Kick / ban
              </button>
            )}
            {role === 'host' && debate?.guestUsername && (
              <>
                <button type="button" onClick={startDebate} className="px-3 py-2 rounded-lg text-sm bg-emerald-700 text-white">
                  Start debate (after rounds set)
                </button>
                <button
                  type="button"
                  onClick={() => debate.guestUsername && kick(debate.guestUsername)}
                  className="px-3 py-2 rounded-lg text-sm bg-amber-900/80 border border-amber-600/50"
                >
                  Kick guest
                </button>
              </>
            )}
            {debate?.phase === 'POLL' && role === 'viewer' && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-300">Vote:</span>
                <button type="button" onClick={() => vote('HOST')} className="px-3 py-2 rounded-lg bg-purple-700 text-sm">
                  Host
                </button>
                <button type="button" onClick={() => vote('GUEST')} className="px-3 py-2 rounded-lg bg-cyan-800 text-sm">
                  Guest
                </button>
              </div>
            )}
          </div>

          {debate?.phase === 'FINISHED' && (
            <div className="rounded-lg border border-green-500/40 bg-green-950/40 px-3 py-2 text-sm">
              Debate finished. Winner: {debate.debateWinnerUsername ?? debate.pollWinnerUsername ?? '—'}
            </div>
          )}

          {guestInviteOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
              <div
                className="bg-gray-900 border border-green-500/40 rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl"
                role="dialog"
                aria-label="Guest debate requests"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-green-300">Guest requests</h3>
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-white px-2 py-1 rounded"
                    onClick={() => {
                      setGuestInviteOpen(false);
                      setGuestInviteSearch('');
                    }}
                  >
                    Close
                  </button>
                </div>
                <input
                  type="search"
                  placeholder="Search by username prefix…"
                  value={guestInviteSearch}
                  onChange={(e) => setGuestInviteSearch(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500"
                  autoComplete="off"
                />
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-700 divide-y divide-gray-800">
                  {guestInviteFiltered.length === 0 ? (
                    <p className="text-sm text-gray-500 p-3">No matching requests.</p>
                  ) : (
                    guestInviteFiltered.map((v) => (
                      <div key={v} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                        <span className="text-gray-200 truncate min-w-0">{v}</span>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            className="px-2 py-1 rounded text-green-200 bg-green-950/50 border border-green-600/40 text-xs"
                            onClick={() => acceptGuestInvite(v)}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 rounded text-gray-300 bg-gray-800 border border-gray-600 text-xs"
                            onClick={() => declineGuestInvite(v)}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {kickBanOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
              <div
                className="bg-gray-900 border border-amber-500/40 rounded-lg max-w-md w-full p-4 space-y-3 shadow-xl"
                role="dialog"
                aria-label="Kick or ban viewers"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-amber-200">Kick / ban viewers</h3>
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-white px-2 py-1 rounded"
                    onClick={() => {
                      setKickBanOpen(false);
                      setKickBanSearch('');
                    }}
                  >
                    Close
                  </button>
                </div>
                <input
                  type="search"
                  placeholder="Search by username prefix…"
                  value={kickBanSearch}
                  onChange={(e) => setKickBanSearch(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500"
                  autoComplete="off"
                />
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-700 divide-y divide-gray-800">
                  {kickBanFiltered.length === 0 ? (
                    <p className="text-sm text-gray-500 p-3">No matching viewers.</p>
                  ) : (
                    kickBanFiltered.map((v) => (
                      <div key={v} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                        <span className="text-gray-200 truncate min-w-0">{v}</span>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            className="px-2 py-1 rounded text-amber-300 bg-amber-950/50 border border-amber-600/40 text-xs"
                            onClick={() => kick(v)}
                          >
                            Kick
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 rounded text-red-300 bg-red-950/40 border border-red-600/40 text-xs"
                            onClick={() => ban(v)}
                          >
                            Ban
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {showRoundEditor && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-purple-500/40 rounded-lg max-w-lg w-full p-4 space-y-3 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-purple-300">Rounds & segments</h3>
                <p className="text-xs text-gray-400">
                  Each round has 3 segments: host-only, guest-only (same length as segment 1), then open discussion.
                  After the last round&apos;s open segment, viewers vote for 1 minute.
                </p>
                <div className="space-y-2">
                  {roundsConfig.map((r, i) => (
                    <div key={i} className="flex flex-wrap gap-2 text-sm items-end border border-gray-700 rounded p-2">
                      <label className="flex flex-col gap-1">
                        Name
                        <input
                          className="bg-gray-950 border border-gray-600 rounded px-2 py-1"
                          value={r.name}
                          onChange={(e) => {
                            const next = [...roundsConfig];
                            next[i] = { ...next[i], name: e.target.value };
                            setRoundsConfig(next);
                          }}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Seg 1 &amp; 2 (min)
                        <input
                          type="number"
                          min={1}
                          className="bg-gray-950 border border-gray-600 rounded px-2 py-1 w-24"
                          value={r.segment12Minutes}
                          onChange={(e) => {
                            const next = [...roundsConfig];
                            next[i] = { ...next[i], segment12Minutes: Number(e.target.value) || 1 };
                            setRoundsConfig(next);
                          }}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Seg 3 (min)
                        <input
                          type="number"
                          min={1}
                          className="bg-gray-950 border border-gray-600 rounded px-2 py-1 w-24"
                          value={r.segment3Minutes}
                          onChange={(e) => {
                            const next = [...roundsConfig];
                            next[i] = { ...next[i], segment3Minutes: Number(e.target.value) || 1 };
                            setRoundsConfig(next);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-end border border-dashed border-gray-600 rounded p-2">
                  <label className="flex flex-col gap-1 text-xs">
                    New round name
                    <input
                      className="bg-gray-950 border border-gray-600 rounded px-2 py-1"
                      value={roundDraft.name}
                      onChange={(e) => setRoundDraft((d) => ({ ...d, name: e.target.value }))}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    Seg 1&amp;2 min
                    <input
                      type="number"
                      min={1}
                      className="bg-gray-950 border border-gray-600 rounded px-2 py-1 w-20"
                      value={roundDraft.segment12Minutes}
                      onChange={(e) => setRoundDraft((d) => ({ ...d, segment12Minutes: Number(e.target.value) || 1 }))}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    Seg 3 min
                    <input
                      type="number"
                      min={1}
                      className="bg-gray-950 border border-gray-600 rounded px-2 py-1 w-20"
                      value={roundDraft.segment3Minutes}
                      onChange={(e) => setRoundDraft((d) => ({ ...d, segment3Minutes: Number(e.target.value) || 1 }))}
                    />
                  </label>
                  <button type="button" onClick={pushRound} className="px-3 py-2 rounded bg-gray-800 text-sm">
                    Add round
                  </button>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="px-3 py-2 rounded bg-gray-800" onClick={() => setShowRoundEditor(false)}>
                    Cancel
                  </button>
                  <button type="button" className="px-3 py-2 rounded bg-purple-600" onClick={applyRoundConfig}>
                    Save rounds
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <aside className="shrink-0 flex flex-col w-full lg:w-80 max-h-[40vh] lg:max-h-none lg:h-auto border-t lg:border-t-0 lg:border-l border-purple-500/40 bg-gray-900">
          <div className="px-3 py-2 border-b border-purple-500/30 text-sm text-purple-400">Chat</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
            {chatMessages.map((msg, index) => {
              const isOwn = msg.sender === username;
              return (
                <div key={index} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  <span className={`text-xs mb-0.5 px-1 ${isOwn ? 'text-purple-400' : 'text-cyan-400'}`}>{msg.sender}</span>
                  <div
                    className={`text-sm py-1.5 px-2 rounded max-w-[85%] ${
                      isOwn ? 'bg-purple-900/40 border-r-2 border-purple-500/70' : 'bg-gray-800/80 border-l-2 border-cyan-500/50'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleChatSubmit} className="p-2 border-t border-purple-500/30 flex gap-2 bg-gray-800/80">
            <input
              type="text"
              placeholder="Message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 min-w-0 px-2 py-2 rounded-lg text-sm bg-gray-900 border border-purple-500/30"
            />
            <button type="submit" className="px-3 py-2 rounded-lg bg-purple-600 text-sm">
              Send
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
