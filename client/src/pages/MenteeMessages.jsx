import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/toaster';
import { Send, Wifi, WifiOff } from 'lucide-react';
import api from '../utils/api';
import logger from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import { useActiveCommunication } from '../context/SocketContext';

const OnlineDot = ({ online }) => (
  <span
    className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${online ? 'bg-green-500' : 'bg-neutral-400'
      }`}
  />
);

const MenteeMessages = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { socket, onlineUsers } = useActiveCommunication();
  const mentorFromQuery = new URLSearchParams(location.search).get('mentor');

  const [contacts, setContacts] = useState([]);
  const [activeMentorId, setActiveMentorId] = useState(mentorFromQuery || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const activeMentorIdRef = useRef(activeMentorId);

  // Keep ref in sync so socket callbacks can read the latest value
  useEffect(() => {
    activeMentorIdRef.current = activeMentorId;
  }, [activeMentorId]);

  // ── Load contacts ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true);
        const res = await api.get('/messages/contacts');
        const allContacts = (res.data?.data || []).filter((c) => c.role === 'mentor');

        let initialActiveId = '';

        if (mentorFromQuery) {
          const exists = allContacts.find((c) => c._id === mentorFromQuery);
          if (exists) {
            initialActiveId = mentorFromQuery;
          } else {
            try {
              const userRes = await api.get(`/auth/${mentorFromQuery}`);
              const userData = userRes.data.data;
              if (userData) {
                allContacts.unshift({ ...userData, role: 'mentor' });
                initialActiveId = mentorFromQuery;
              }
            } catch (e) {
              logger.error('Failed to fetch mentor details', e);
            }
          }
        } else if (allContacts.length > 0) {
          initialActiveId = allContacts[0]._id;
        }

        setContacts(allContacts);
        if (initialActiveId) setActiveMentorId(initialActiveId);
      } catch (error) {
        logger.error('Fetch contacts error', error);
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, [mentorFromQuery]);

  // ── Load conversation history via REST ────────────────────────────────────
  useEffect(() => {
    if (!activeMentorId) return;

    const fetchConversation = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/messages/conversation/${activeMentorId}`);
        setMessages(res.data?.data || []);
      } catch (error) {
        logger.error('Fetch messages error', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchConversation();
    setPeerTyping(false);
  }, [activeMentorId]);

  // ── Auto-scroll to latest message ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, peerTyping]);

  // ── Socket event listeners ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleNewMessage = (msg) => {
      const fromId = typeof msg.from === 'string' ? msg.from : msg.from?._id;
      const toId = typeof msg.to === 'string' ? msg.to : msg.to?._id;
      const myId = user?._id || user?.id;

      // Only append if the message belongs to the active conversation
      if (
        (fromId === activeMentorIdRef.current && toId === myId) ||
        (fromId === myId && toId === activeMentorIdRef.current)
      ) {
        setMessages((prev) => {
          // Deduplicate by _id
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      // Update last message preview in contacts list
      setContacts((prev) =>
        prev.map((c) =>
          c._id === fromId || c._id === toId
            ? { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt }
            : c
        )
      );
    };

    const handleTyping = ({ from }) => {
      if (from === activeMentorIdRef.current) setPeerTyping(true);
    };

    const handleStopTyping = ({ from }) => {
      if (from === activeMentorIdRef.current) setPeerTyping(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    setConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, user]);

  // ── Handle input + typing events ──────────────────────────────────────────
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (!socket || !activeMentorId) return;

    socket.emit('typing', { to: activeMentorId });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('stop_typing', { to: activeMentorId });
    }, 1500);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!activeMentorId) { toast('No mentor selected', 'error'); return; }
    const body = message.trim();
    if (!body) return;

    setSending(true);
    clearTimeout(typingTimerRef.current);
    socket?.emit('stop_typing', { to: activeMentorId });

    const myId = user?._id || user?.id;

    // Optimistic update
    const optimisticMsg = {
      _id: `optimistic-${Date.now()}`,
      from: myId,
      to: activeMentorId,
      body,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessage('');

    try {
      if (socket?.connected) {
        // Real-time path via socket
        socket.emit('send_message', { to: activeMentorId, body }, (ack) => {
          if (ack?.success) {
            // Replace optimistic message with real one from server
            setMessages((prev) =>
              prev.map((m) => (m._id === optimisticMsg._id ? ack.data : m))
            );
          } else {
            // Roll back and notify
            setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
            toast(ack?.error || 'Failed to send', 'error');
          }
        });
      } else {
        // Fallback: REST API if socket is not connected
        const res = await api.post('/messages', { to: activeMentorId, body });
        const savedMessage = res.data?.data;
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticMsg._id ? savedMessage : m))
        );
      }
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
      toast(error.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  }, [activeMentorId, message, socket, user]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeMentor = contacts.find((c) => c._id === activeMentorId);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-neutral-50 dark:bg-background py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Connection status badge */}
          <div className="flex items-center justify-end gap-2 mb-4 text-xs text-muted-foreground">
            {connected
              ? <><Wifi className="h-3.5 w-3.5 text-green-500" /> Real-time connected</>
              : <><WifiOff className="h-3.5 w-3.5 text-red-400" /> Offline — using REST fallback</>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contacts list */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Your Mentors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingContacts ? (
                  <p className="text-sm text-neutral-500">Loading mentors...</p>
                ) : contacts.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No chats yet. Book a session and start chatting with mentors.
                  </p>
                ) : (
                  contacts.map((mentor) => (
                    <button
                      key={mentor._id}
                      onClick={() => setActiveMentorId(mentor._id)}
                      className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${activeMentorId === mentor._id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                    >
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {mentor.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5">
                          <OnlineDot online={onlineUsers.has(mentor._id)} />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{mentor.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{mentor.lastMessage || mentor.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Conversation */}
            <Card className="md:col-span-2 flex flex-col">
              <CardHeader className="border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  {activeMentor && (
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {activeMentor.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5">
                        <OnlineDot online={onlineUsers.has(activeMentorId)} />
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-base">
                    {activeMentor
                      ? <>{activeMentor.name} <span className="text-xs font-normal text-muted-foreground ml-1">{onlineUsers.has(activeMentorId) ? '● online' : '○ offline'}</span></>
                      : 'Select a mentor to start chatting'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 flex-1 pt-4">
                {/* Message list */}
                <div className="h-80 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 bg-white dark:bg-neutral-900 overflow-y-auto text-sm space-y-2">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-neutral-500">Loading conversation...</div>
                  ) : !activeMentorId ? (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-xs">Choose a mentor to view messages.</div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-neutral-500">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map((msg) => {
                      const myId = user?._id || user?.id;
                      const fromId = typeof msg.from === 'string' ? msg.from : msg.from?._id;
                      const isMe = fromId === myId;
                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[72%] rounded-2xl px-3 py-2 ${msg._optimistic ? 'opacity-60' : ''
                              } ${isMe
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'
                              }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                            <p className="mt-1 text-[10px] opacity-60">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {msg._optimistic && ' · sending…'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing indicator */}
                  {peerTyping && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-bl-sm px-3 py-2">
                        <span className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input row */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message… (Enter to send)"
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={sending || !activeMentorId}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !message.trim() || !activeMentorId}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MenteeMessages;
