import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { toast } from '../components/ui/toaster';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MentorMessages = () => {
  const location = useLocation();
  const { user } = useAuth();
  const menteeFromQuery = new URLSearchParams(location.search).get('mentee');
  const [contacts, setContacts] = useState([]);
  const [activeMenteeId, setActiveMenteeId] = useState(menteeFromQuery || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Load contact list (mentees this mentor has chatted with)
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true);
        const res = await api.get('/messages/contacts');
        const allContacts = (res.data?.data || []).filter((c) => c.role === 'mentee');

        let initialActiveId = '';

        if (menteeFromQuery) {
          const exists = allContacts.find(c => c._id === menteeFromQuery);
          if (exists) {
            initialActiveId = menteeFromQuery;
          } else {
            // Fetch mentee details if not in contact list
            try {
              const userRes = await api.get(`/auth/${menteeFromQuery}`);
              const userData = userRes.data.data;
              if (userData) {
                allContacts.unshift({ ...userData, role: 'mentee' });
                initialActiveId = menteeFromQuery;
              }
            } catch (e) {
              console.error('Failed to fetch mentee details', e);
            }
          }
        } else if (allContacts.length > 0) {
          initialActiveId = allContacts[0]._id;
        }

        setContacts(allContacts);
        if (initialActiveId) setActiveMenteeId(initialActiveId);

      } catch (error) {
        console.error('Fetch contacts error', error);
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, [menteeFromQuery]);

  // Load conversation when active mentee changes
  useEffect(() => {
    if (!activeMenteeId) return;

    const fetchConversation = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/messages/conversation/${activeMenteeId}`);
        setMessages(res.data?.data || []);
      } catch (error) {
        console.error('Fetch messages error', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchConversation();
  }, [activeMenteeId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!activeMenteeId) {
      toast('No mentee selected', 'error');
      return;
    }
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/messages', { to: activeMenteeId, body: message.trim() });
      const savedMessage = res.data?.data;

      toast('Message sent', 'success');
      setMessage('');
      if (savedMessage) {
        setMessages((prev) => [...prev, savedMessage]);
      }
    } catch (error) {
      console.error('Send message error', error);
      toast(error.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-neutral-50 dark:bg-background py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contacts list */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Your Mentees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingContacts ? (
                  <p className="text-sm text-neutral-500">Loading mentees...</p>
                ) : contacts.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No chats yet. Once a mentee messages you, they will appear here.
                  </p>
                ) : (
                  contacts.map((mentee) => (
                    <button
                      key={mentee._id}
                      onClick={() => setActiveMenteeId(mentee._id)}
                      className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${activeMenteeId === mentee._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                        }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {mentee.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{mentee.name}</p>
                        <p className="text-xs text-neutral-500">{mentee.email}</p>
                        {mentee.lastMessage && (
                          <p className="mt-1 text-xs text-neutral-500 truncate">
                            {mentee.lastMessage}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Conversation */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  {activeMenteeId
                    ? 'Chat'
                    : 'Select a mentee to start chatting'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 bg-white dark:bg-neutral-900 overflow-y-auto text-sm space-y-2">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      Loading conversation...
                    </div>
                  ) : !activeMenteeId ? (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-xs">
                      Choose a mentee from the list to view your messages.
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const myId = user?._id || user?.id;
                      const fromId =
                        typeof msg.from === 'string' ? msg.from : msg.from?._id;
                      const isMe = fromId === myId;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-3 py-2 ${isMe
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'
                              }`}
                          >
                            <p>{msg.body}</p>
                            <p className="mt-1 text-[10px] opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending || !activeMenteeId}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !message.trim() || !activeMenteeId}
                  >
                    {sending ? 'Sending...' : 'Send'}
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

export default MentorMessages;

