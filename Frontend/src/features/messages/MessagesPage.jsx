import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Search,
  Users,
  Pin,
  PinOff,
  MoreVertical,
  Plus,
  Smile,
  ShieldCheck,
  Radio,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  CheckCheck,
  Check,
  UserCheck,
  Layers,
  UserPlus,
  Trash2,
  Reply,
  Copy,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import {
  listMyGroups,
  getGroupDetails,
  getGroupMembers,
  getGroupMessages,
  sendMessage,
  markAsRead,
  pinMessage,
  deleteMessage,
  deleteMessageForEveryone,
} from '../../lib/api/chatApi';
import { chatSocket } from '../../lib/chatSocket';
import { CreateGroupModal } from './CreateGroupModal';
import { EditGroupModal } from './EditGroupModal';
import { ManageMembersModal } from './ManageMembersModal';

const QUICK_EMOJIS = ['😀', '💡', '👏', '👍', '📚', '❓', '🎯', '🔥', '🚀', '🙌'];

const COLOR_CLASSES = {
  indigo: 'bg-indigo-500 text-white',
  emerald: 'bg-emerald-500 text-white',
  amber: 'bg-amber-500 text-white',
  coral: 'bg-rose-500 text-white',
  rose: 'bg-rose-500 text-white',
  violet: 'bg-violet-500 text-white',
  sky: 'bg-sky-500 text-white',
  blue: 'bg-blue-500 text-white',
};

export function MessagesPage() {
  const { user, role } = useAuthStore();
  const { threadId } = useParams();
  const navigate = useNavigate();

  const isTeacher = role === 'PROFESSOR' || role === 'FACULTY';

  // Group list & selection
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(threadId ? Number(threadId) : null);
  const [activeGroup, setActiveGroup] = useState(null);

  const canManage = isTeacher && Boolean(
    activeGroup?.isTeacherOwner ||
    activeGroup?.teacherOwner ||
    activeGroup?.teacherId === user?.id ||
    !activeGroup?.teacherId
  );

  // Messages & Members
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  const [mobileView, setMobileView] = useState(threadId ? 'chat' : 'list');

  // WhatsApp-Style Features State
  const [messageCache, setMessageCache] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatScrollContainerRef = useRef(null);
  const [reactions, setReactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('openlms_chat_reactions') || '{}');
    } catch {
      return {};
    }
  });

  // Real-time & Typing
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageModalTab, setManageModalTab] = useState('current');

  // Loading & Error states
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Delete for Everyone state
  const [deleteConfirmMsg, setDeleteConfirmMsg] = useState(null); // message object to confirm deletion
  const [deleting, setDeleting] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 1. Connect WebSocket on mount
  useEffect(() => {
    chatSocket.connect();
    const unsubscribeStatus = chatSocket.onStatusChange((status) => {
      setIsWsConnected(status);
    });

    return () => {
      unsubscribeStatus();
    };
  }, []);

  // Reconnect WebSocket whenever the logged-in user changes.
  // The chatSocket singleton keeps a STOMP connection tied to the JWT token at
  // connect time. If the user switches accounts without a full page reload the
  // old connection carries the previous user's identity, causing the backend to
  // attribute sent messages to the wrong person.
  useEffect(() => {
    if (user?.id) {
      chatSocket.reconnect();
    }
  }, [user?.id]);

  // 2. Fetch groups
  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      setError(null);
      const data = await listMyGroups();
      const list = Array.isArray(data) ? data : [];
      setGroups(list);

      if (list.length > 0) {
        if (!activeGroupId || !list.some((g) => g.groupId === activeGroupId)) {
          setActiveGroupId(list[0].groupId);
        }
      } else {
        setActiveGroupId(null);
        setActiveGroup(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load group chats');
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [role, user?.id]);

  // Sync activeGroupId from URL param if available
  useEffect(() => {
    if (threadId) {
      const parsed = Number(threadId);
      if (!isNaN(parsed) && parsed !== activeGroupId) {
        setActiveGroupId(parsed);
      }
    }
  }, [threadId]);

  // 3. Instant Cache + Async Load active group details, messages, and members
  useEffect(() => {
    if (!activeGroupId) {
      setActiveGroup(null);
      setMessages([]);
      setMembers([]);
      setPinnedMessages([]);
      return;
    }

    const currentGrp = groups.find((g) => g.groupId === activeGroupId);
    if (currentGrp) {
      setActiveGroup(currentGrp);
    }

    // Zero delay: Show cached conversation immediately if available!
    const cached = messageCache[activeGroupId];
    if (cached && cached.length > 0) {
      setMessages(cached);
      setPinnedMessages(cached.filter((m) => m.isPinned));
      setLoadingMessages(false);
    } else {
      setLoadingMessages(true);
    }

    setTypingUsers(new Set());
    setReplyingTo(null);

    // 1. Fetch messages first and immediately show them
    getGroupMessages(activeGroupId)
      .then((msgs) => {
        const msgList = Array.isArray(msgs) ? msgs : [];
        setMessages(msgList);
        setMessageCache((prev) => ({ ...prev, [activeGroupId]: msgList }));
        setPinnedMessages(msgList.filter((m) => m.isPinned));
      })
      .catch((err) => console.error('Failed to load messages:', err))
      .finally(() => {
        setLoadingMessages(false);
      });

    // 2. Fetch group details & members concurrently without blocking message view
    getGroupDetails(activeGroupId)
      .then((details) => {
        if (details) setActiveGroup(details);
      })
      .catch(() => {});

    getGroupMembers(activeGroupId)
      .then((mbrs) => {
        setMembers(Array.isArray(mbrs) ? mbrs : []);
      })
      .catch(() => {});

    // 3. Mark as read and notify sidebar to clear unread badge
    markAsRead(activeGroupId)
      .then(() => {
        setGroups((prev) =>
          prev.map((g) => (g.groupId === activeGroupId ? { ...g, unreadCount: 0 } : g))
        );
        window.dispatchEvent(new Event('chat_read_updated'));
      })
      .catch(() => {});
  }, [activeGroupId]);

  // 4. Real-time STOMP Subscription for active group
  useEffect(() => {
    if (!activeGroupId) return;

    // Subscribe to messages & group events
    const unsubGroup = chatSocket.subscribeToGroup(activeGroupId, (payload) => {
      if (payload.event === 'MESSAGE_PINNED' || payload.event === 'MESSAGE_UNPINNED') {
        const updatedMsg = payload.data;
        setMessages((prev) =>
          prev.map((m) => (m.messageId === updatedMsg.messageId ? updatedMsg : m))
        );
        setPinnedMessages((prev) => {
          if (updatedMsg.isPinned) {
            return [updatedMsg, ...prev.filter((m) => m.messageId !== updatedMsg.messageId)];
          }
          return prev.filter((m) => m.messageId !== updatedMsg.messageId);
        });
      } else if (payload.event === 'MESSAGE_DELETED') {
        const deletedId = payload.data?.messageId;
        if (deletedId != null) {
          setMessages((prev) => prev.filter((m) => m.messageId !== deletedId));
          setPinnedMessages((prev) => prev.filter((m) => m.messageId !== deletedId));
        }
      } else if (payload.event === 'GROUP_UPDATED') {
        setActiveGroup(payload.data);
        setGroups((prev) =>
          prev.map((g) => (g.groupId === payload.groupId ? { ...g, ...payload.data } : g))
        );
      } else if (payload.event === 'GROUP_DELETED') {
        fetchGroups();
      } else if (payload.event === 'MESSAGE_DELETED') {
        const deletedId = Number(payload.data?.messageId || payload.data);
        setMessages((prev) => prev.filter((m) => m.messageId !== deletedId));
        setPinnedMessages((prev) => prev.filter((m) => m.messageId !== deletedId));
      } else if (payload.messageId) {
        // Direct incoming message
        const newMsg = payload;
        setMessages((prev) => {
          if (prev.some((m) => m.messageId === newMsg.messageId)) return prev;
          return [...prev, newMsg];
        });

        if (newMsg.isPinned) {
          setPinnedMessages((prev) => [newMsg, ...prev]);
        }

        // Update group list latest message snippet
        setGroups((prev) =>
          prev.map((g) =>
            g.groupId === activeGroupId
              ? {
                  ...g,
                  lastMessage: {
                    messageId: newMsg.messageId,
                    senderId: newMsg.senderId,
                    senderName: newMsg.senderName,
                    senderRole: newMsg.senderRole,
                    messageContent: newMsg.messageContent,
                    createdAt: newMsg.createdAt,
                  },
                  updatedAt: newMsg.createdAt,
                }
              : g
          )
        );

        // Mark read if active
        markAsRead(activeGroupId).catch(() => {});
      }
    });

    // Subscribe to typing indicator
    const unsubTyping = chatSocket.subscribeToTyping(activeGroupId, (typingPayload) => {
      if (typingPayload.userId === user?.id) return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (typingPayload.isTyping) {
          next.add(typingPayload.userName || 'Student');
        } else {
          next.delete(typingPayload.userName || 'Student');
        }
        return next;
      });
    });

    return () => {
      unsubGroup();
      unsubTyping();
    };
  }, [activeGroupId, user?.id]);

  // Fast polling fallback: 3 seconds when disconnected, 12 seconds when connected as safety net
  useEffect(() => {
    if (!activeGroupId) return;

    const intervalMs = isWsConnected ? 12000 : 3000;
    const interval = setInterval(async () => {
      try {
        const msgs = await getGroupMessages(activeGroupId);
        if (Array.isArray(msgs)) {
          setMessages((prev) => {
            if (prev.length !== msgs.length || prev[prev.length - 1]?.messageId !== msgs[msgs.length - 1]?.messageId) {
              return msgs;
            }
            return prev;
          });
        }
      } catch (e) {}
    }, intervalMs);

    return () => clearInterval(interval);
  }, [activeGroupId, isWsConnected]);

  // Auto-scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing debounce
  const handleTypingChange = (e) => {
    setMessageText(e.target.value);
    if (!activeGroupId) return;

    chatSocket.sendTyping(activeGroupId, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      chatSocket.sendTyping(activeGroupId, false);
    }, 1800);
  };

  // Send message handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const content = messageText.trim();
    if (!content || !activeGroupId || sending) return;

    if (activeGroup?.status === 'ARCHIVED') {
      alert('This group is archived and read-only.');
      return;
    }

    try {
      setSending(true);
      setMessageText('');
      setShowEmojiPicker(false);
      chatSocket.sendTyping(activeGroupId, false);

      // Try sending via STOMP; if not connected or supported, send via REST API
      const sentViaStomp = chatSocket.sendMessage(activeGroupId, content, 'TEXT');
      if (!sentViaStomp) {
        const savedMsg = await sendMessage(activeGroupId, {
          messageContent: content,
          messageType: 'TEXT',
        });
        setMessages((prev) => {
          if (prev.some((m) => m.messageId === savedMsg.messageId)) return prev;
          return [...prev, savedMsg];
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
      setMessageText(content);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle message pin (Teacher only)
  const handleTogglePin = async (msg) => {
    if (!isTeacher || !activeGroupId) return;
    try {
      const willPin = !msg.isPinned;
      const updated = await pinMessage(activeGroupId, msg.messageId, willPin);
      setMessages((prev) =>
        prev.map((m) => (m.messageId === msg.messageId ? { ...m, isPinned: willPin } : m))
      );
      setPinnedMessages((prev) => {
        if (willPin) {
          return [updated, ...prev.filter((m) => m.messageId !== msg.messageId)];
        }
        return prev.filter((m) => m.messageId !== msg.messageId);
      });
    } catch (err) {
      alert(err.message || 'Failed to update pin status');
    }
  };

  // Delete message (Sender or Teacher)
  const handleDeleteMessage = async (msg) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteMessage(activeGroupId, msg.messageId);
      setMessages((prev) => prev.filter((m) => m.messageId !== msg.messageId));
      setPinnedMessages((prev) => prev.filter((m) => m.messageId !== msg.messageId));
    } catch (err) {
      alert(err.message || 'Failed to delete message');
    }
  };

  // WhatsApp Reaction Handler
  const handleToggleReaction = (msgId, emoji) => {
    setReactions((prev) => {
      const msgReactions = { ...(prev[msgId] || {}) };
      const userList = msgReactions[emoji] || [];
      const myId = user?.id || 1;
      const exists = userList.includes(myId);

      if (exists) {
        msgReactions[emoji] = userList.filter((id) => id !== myId);
        if (msgReactions[emoji].length === 0) delete msgReactions[emoji];
      } else {
        msgReactions[emoji] = [...userList, myId];
      }

      const updated = { ...prev, [msgId]: msgReactions };
      try {
        localStorage.setItem('openlms_chat_reactions', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // WhatsApp Copy Message Handler
  const handleCopyMessage = (msg) => {
    if (!msg?.messageContent) return;
    navigator.clipboard.writeText(msg.messageContent);
    setCopiedId(msg.messageId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // WhatsApp Scroll Tracking
  const handleChatScroll = (e) => {
    const el = e.currentTarget;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distanceToBottom > 160);
  };

  // WhatsApp Helper: parse quoted reply
  const parseQuotedMessage = (content) => {
    if (!content || !content.startsWith('[quote: ')) return null;
    const endIdx = content.indexOf(']\n');
    if (endIdx === -1) return null;
    const header = content.substring(8, endIdx);
    const body = content.substring(endIdx + 2);
    const colonIdx = header.indexOf(': "');
    if (colonIdx === -1) return { author: 'Reply', snippet: header, body };
    const author = header.substring(0, colonIdx);
    const snippet = header.substring(colonIdx + 3, header.length - 1);
    return { author, snippet, body };
  };

  // Delete for Everyone handlers
  const handleDeleteForEveryone = (msg) => {
    setDeleteConfirmMsg(msg);
  };

  const confirmDeleteForEveryone = async () => {
    if (!deleteConfirmMsg || !activeGroupId || deleting) return;
    try {
      setDeleting(true);
      await deleteMessageForEveryone(activeGroupId, deleteConfirmMsg.messageId);
      // Optimistically remove from local state (WebSocket also triggers for all other clients)
      setMessages((prev) => prev.filter((m) => m.messageId !== deleteConfirmMsg.messageId));
      setPinnedMessages((prev) => prev.filter((m) => m.messageId !== deleteConfirmMsg.messageId));
      setDeleteConfirmMsg(null);
    } catch (err) {
      alert(err.message || 'Failed to delete message. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const insertEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  // Filter groups
  const courseOptions = Array.from(new Set(groups.map((g) => g.courseCode).filter(Boolean)));
  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.courseName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      selectedCourseFilter === 'ALL' || g.courseCode === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  const getInitials = (title) => {
    if (!title) return 'GP';
    const words = title.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.slice(0, 2).toUpperCase();
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Teacher Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">Course Group Chats</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                isWsConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Radio className={`w-3 h-3 ${isWsConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              {isWsConnected ? 'Live Real-Time' : 'Connecting...'}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            {isTeacher
              ? 'Create and manage dedicated course discussion groups with your enrolled students.'
              : 'Join discussions in your assigned course groups and connect with your instructor and classmates.'}
          </p>
        </div>

        {/* Create Group Button (Strictly Teacher/Faculty Only) */}
        {isTeacher && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
            className="shadow-sm font-semibold"
          >
            Create Group
          </Button>
        )}
      </div>

      {/* Main Chat Layout Container */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl border border-ink-border shadow-xs overflow-hidden flex h-[calc(100dvh-14rem)] min-h-[480px] sm:min-h-[580px]">
        {/* ------------------------------------------------------------- */}
        {/* LEFT PANEL: Group Channels List                               */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`w-full md:w-80 shrink-0 border-r border-ink-border flex flex-col bg-slate-50/40 ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Search & Course Filter */}
          <div className="p-3.5 border-b border-ink-border bg-white space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
              <input
                type="text"
                placeholder="Search groups or courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-ink-border rounded-xl text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>

            {/* Course Filter Pills */}
            {courseOptions.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  onClick={() => setSelectedCourseFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                    selectedCourseFilter === 'ALL'
                      ? 'bg-navy-900 text-white'
                      : 'bg-slate-100 text-ink-muted hover:text-ink'
                  }`}
                >
                  All ({groups.length})
                </button>
                {courseOptions.map((code) => (
                  <button
                    key={code}
                    onClick={() => setSelectedCourseFilter(code)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                      selectedCourseFilter === code
                        ? 'bg-navy-900 text-white'
                        : 'bg-slate-100 text-ink-muted hover:text-ink'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Groups Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-ink-border/40">
            {loadingGroups ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">No groups found</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {isTeacher
                      ? 'Click "+ Create Group" above to start your first course group.'
                      : 'Your teachers have not added you to any course groups yet.'}
                  </p>
                </div>
                {isTeacher && (
                  <Button
                    size="xs"
                    variant="outline"
                    icon={Plus}
                    onClick={() => setShowCreateModal(true)}
                  >
                    New Group
                  </Button>
                )}
              </div>
            ) : (
              filteredGroups.map((g) => {
                const isActive = g.groupId === activeGroupId;
                const avatarColor = COLOR_CLASSES[g.groupImage] || 'bg-brand-500 text-white';

                return (
                  <div
                    key={g.groupId}
                    onClick={() => {
                      setActiveGroupId(g.groupId);
                      navigate(`/messages/${g.groupId}`, { replace: true });
                      setMobileView('chat');
                    }}
                    className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isActive
                        ? 'bg-white shadow-xs border-l-4 border-l-brand-500'
                        : 'hover:bg-slate-100/70 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Avatar Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-xs ${avatarColor}`}
                    >
                      {getInitials(g.groupName)}
                    </div>

                    {/* Group Info Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold tracking-wider text-brand-600 uppercase truncate">
                          {g.courseCode} · {g.section || 'Sec 01'}
                        </span>
                        {g.lastMessage?.createdAt && (
                          <span className="text-[10px] text-ink-muted whitespace-nowrap">
                            {formatTimestamp(g.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-ink truncate mb-1">
                        {g.groupName}
                      </h4>

                      <p className="text-[11px] text-ink-muted truncate">
                        {g.lastMessage ? (
                          <>
                            <span className="font-semibold text-ink-muted/90">
                              {g.lastMessage.senderName?.split(' ')[0]}:{' '}
                            </span>
                            {g.lastMessage.messageContent}
                          </>
                        ) : (
                          <span className="italic">No messages yet</span>
                        )}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {g.memberCount}
                        </span>
                        {g.status === 'ARCHIVED' && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Archived
                          </span>
                        )}
                        {g.isTeacherOwner && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unread Message Pill Badge */}
                    {g.unreadCount > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                        {g.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CENTER PANEL: Active Group Chat Window                        */}
        {/* ------------------------------------------------------------- */}
        <div className={`flex-1 flex flex-col min-w-0 bg-white ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}`}>
          {activeGroup ? (
            <>
              {/* Chat Header */}
              <div className="p-3 px-3 sm:p-3.5 sm:px-5 border-b border-ink-border bg-white flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="md:hidden shrink-0 p-1.5 -ml-1 rounded-lg text-ink-muted hover:text-ink hover:bg-slate-50"
                    title="Back to groups"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-xs ${
                      COLOR_CLASSES[activeGroup.groupImage] || 'bg-brand-500 text-white'
                    }`}
                  >
                    {getInitials(activeGroup.groupName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-ink truncate">
                        {activeGroup.groupName}
                      </h3>
                      {activeGroup.status === 'ARCHIVED' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted truncate">
                      {activeGroup.courseCode} · {activeGroup.courseName} · Instructor:{' '}
                      <span className="font-semibold text-ink">{activeGroup.teacherName}</span>
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {pinnedMessages.length > 0 && (
                    <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                      <Pin className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                      {pinnedMessages.length} Pinned
                    </span>
                  )}

                  {/* Teacher Management Actions */}
                  {canManage && (
                    <div className="hidden sm:flex items-center gap-1.5">
                      <Button
                        variant="primary"
                        size="xs"
                        icon={UserPlus}
                        onClick={() => {
                          setManageModalTab('add');
                          setShowManageModal(true);
                        }}
                        className="font-bold shadow-xs bg-brand-600 hover:bg-brand-700 text-white"
                      >
                        + Add Member
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        icon={Users}
                        onClick={() => {
                          setManageModalTab('current');
                          setShowManageModal(true);
                        }}
                      >
                        Members
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Settings}
                        onClick={() => setShowEditModal(true)}
                        title="Group Settings"
                      />
                    </div>
                  )}

                  {/* Toggle Members Drawer */}
                  <button
                    onClick={() => setShowMembersPanel(!showMembersPanel)}
                    className={`hidden md:block p-1.5 rounded-lg border transition-colors ${
                      showMembersPanel
                        ? 'bg-slate-100 text-ink border-ink-border'
                        : 'text-ink-muted hover:text-ink hover:bg-slate-50 border-transparent'
                    }`}
                    title="Toggle Members & Details"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowMembersPanel(true);
                      setMobileView('details');
                    }}
                    className="md:hidden p-1.5 rounded-lg border border-transparent text-ink-muted hover:text-ink hover:bg-slate-50"
                    title="View group details"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* WhatsApp In-Chat Search Input Bar */}
              {isChatSearchOpen && (
                <div className="bg-slate-50 border-b border-ink-border px-4 py-2 flex items-center gap-2 shrink-0 animate-in fade-in duration-150">
                  <Search className="w-4 h-4 text-ink-muted shrink-0" />
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    placeholder="Search in this conversation..."
                    className="flex-1 bg-transparent text-xs text-ink focus:outline-none"
                    autoFocus
                  />
                  {chatSearchQuery && (
                    <span className="text-[10px] text-ink-muted font-semibold shrink-0">
                      {messages.filter(m => m.messageContent?.toLowerCase().includes(chatSearchQuery.toLowerCase())).length} found
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setChatSearchQuery('');
                      setIsChatSearchOpen(false);
                    }}
                    className="text-ink-muted hover:text-ink p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Pinned Announcements Collapsible Banner */}
              {pinnedMessages.length > 0 && (
                <div className="bg-amber-50/70 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Pin className="w-4 h-4 fill-amber-600 text-amber-600 shrink-0" />
                    <span className="font-bold shrink-0">Announcement:</span>
                    <span className="truncate italic">
                      "{pinnedMessages[0].messageContent}"
                    </span>
                    <span className="text-[10px] text-amber-700/80 shrink-0">
                      — {pinnedMessages[0].pinnedByName || pinnedMessages[0].senderName}
                    </span>
                  </div>
                  {pinnedMessages.length > 1 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full shrink-0">
                      +{pinnedMessages.length - 1} more
                    </span>
                  )}
                </div>
              )}

              {/* Message Feed Area */}
              <div ref={chatScrollContainerRef} onScroll={handleChatScroll} className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50/40 relative">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-ink-muted">
                    Loading conversation history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 p-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-ink">Welcome to {activeGroup.groupName}!</p>
                    <p className="text-xs text-ink-muted max-w-sm">
                      {isTeacher
                        ? 'Post your first announcement or message to start the discussion.'
                        : 'No messages yet. Say hello to your instructor and classmates!'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = String(msg.senderId) === String(user?.id);
                    const isSystem = msg.messageType === 'SYSTEM';
                    const showDateHeader =
                      index === 0 ||
                      formatDateHeader(messages[index - 1].createdAt) !==
                        formatDateHeader(msg.createdAt);

                    if (isSystem) {
                      return (
                        <div key={msg.messageId} className="space-y-3">
                          {showDateHeader && (
                            <div className="flex items-center justify-center">
                              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-ink-border/60 shadow-2xs">
                                {formatDateHeader(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-center">
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-full">
                              {msg.messageContent}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.messageId} className="space-y-3">
                        {/* Date Divider */}
                        {showDateHeader && (
                          <div className="flex items-center justify-center">
                            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-ink-border/60 shadow-2xs">
                              {formatDateHeader(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble Item */}
                        {(() => {
                          const isMsgTeacher = Boolean(msg.isTeacherSender || msg.teacherSender || msg.senderRole === 'PROFESSOR' || msg.senderRole === 'FACULTY');
                          const isMsgPinned = Boolean(msg.isPinned || msg.pinned);
                          return (
                            <div
                              className={`flex items-start gap-2.5 group ${
                                isMe ? 'flex-row-reverse' : 'flex-row'
                              }`}
                            >
                              <Avatar
                                name={msg.senderName}
                                size="sm"
                                color={isMsgTeacher ? 'navy' : isMe ? 'brand' : 'sky'}
                              />

                              <div
                                className={`max-w-[75%] sm:max-w-[65%] space-y-1 relative ${
                                  isMe ? 'items-end text-right' : 'items-start text-left'
                                }`}
                              >
                                {/* Author & Timestamp Header */}
                                <div
                                  className={`flex items-center gap-1.5 text-[11px] ${
                                    isMe ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  <span className="font-bold text-ink">{msg.senderName}</span>
                                  {isMsgTeacher && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-md">
                                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                      Instructor
                                    </span>
                                  )}
                                  <span className="text-[10px] text-ink-muted">
                                    {formatTimestamp(msg.createdAt)}
                                  </span>
                                  {isMsgPinned && (
                                    <span
                                      className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md"
                                      title="Pinned by teacher"
                                    >
                                      <Pin className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                                      Pinned
                                    </span>
                                  )}
                                </div>

                                {/* Message Bubble Body */}
                                <div
                                  className={`rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed relative ${
                                    isMe
                                      ? 'bg-brand-500 text-white rounded-tr-xs'
                                      : isMsgTeacher
                                      ? 'bg-gradient-to-br from-indigo-50/90 to-white border-2 border-indigo-200/80 text-ink rounded-tl-xs shadow-sm font-medium'
                                      : 'bg-white border border-ink-border text-ink rounded-tl-xs'
                                  }`}
                                >
                                  {msg.messageContent}
                                </div>

                                {/* Hover Quick Actions: Pin (Teacher) & Delete (Sender or Teacher) */}
                                {(canManage || isMe) && (
                                  <div
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] pt-0.5 ${
                                      isMe ? 'justify-end' : 'justify-start'
                                    }`}
                                  >
                                    {canManage && (
                                      <button
                                        type="button"
                                        onClick={() => handleTogglePin(msg)}
                                        className="inline-flex items-center gap-1 text-ink-muted hover:text-amber-700 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                                        title={isMsgPinned ? 'Unpin message' : 'Pin announcement to top'}
                                      >
                                        {isMsgPinned ? (
                                          <>
                                            <PinOff className="w-3 h-3" /> Unpin
                                          </>
                                        ) : (
                                          <>
                                            <Pin className="w-3 h-3" /> Pin
                                          </>
                                        )}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(msg)}
                                      className="inline-flex items-center gap-1 text-ink-muted hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-50 transition-colors"
                                      title="Delete message"
                                    >
                                      <Trash2 className="w-3 h-3 text-rose-500" /> Delete
                                    </button>
                                  </div>
                                )}

                                {/* Delete for Everyone — only shown on current user's own messages */}
                                {isMe && (
                                  <div
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] pt-0.5 justify-end`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteForEveryone(msg)}
                                      className="inline-flex items-center gap-1 text-ink-muted hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
                                      title="Delete for everyone"
                                    >
                                      <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })
                )}

                {/* Real-Time Typing Indicator Bubble */}
                {typingUsers.size > 0 && (
                  <div className="flex items-center gap-2 text-xs text-ink-muted italic pl-11">
                    <div className="flex items-center gap-1 bg-white border border-ink-border/60 px-3 py-1.5 rounded-full shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] font-medium text-slate-600 ml-1.5">
                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <div className="p-3.5 bg-white border-t border-ink-border shrink-0 space-y-2">
                {/* Quick Emoji Bar Toggle */}
                {showEmojiPicker && (
                  <div className="flex items-center gap-1 p-1.5 bg-slate-50 border border-ink-border rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-2">
                      Quick React:
                    </span>
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="text-base hover:scale-125 hover:bg-white rounded p-1 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2">
                  <div className="flex-1 relative flex items-center bg-slate-50 border border-ink-border rounded-xl focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white transition-all">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2.5 rounded-l-xl text-ink-muted hover:text-ink transition-colors ${
                        showEmojiPicker ? 'text-brand-600' : ''
                      }`}
                      title="Emojis"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <textarea
                      ref={textareaRef}
                      rows={1}
                      disabled={activeGroup?.status === 'ARCHIVED'}
                      placeholder={
                        activeGroup?.status === 'ARCHIVED'
                          ? 'This group is archived and read-only.'
                          : `Message ${activeGroup.groupName}... (Enter to send)`
                      }
                      value={messageText}
                      onChange={handleTypingChange}
                      onKeyDown={handleKeyDown}
                      className="w-full min-w-0 py-2.5 pr-3 bg-transparent text-xs text-ink placeholder:text-ink-muted focus:outline-none resize-none max-h-32 font-medium"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!messageText.trim() || sending || activeGroup?.status === 'ARCHIVED'}
                    isLoading={sending}
                    icon={Send}
                    className="h-10 px-3 sm:px-4 rounded-xl shadow-xs"
                  >
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-ink">Select a Course Chat Group</h3>
              <p className="text-xs text-ink-muted max-w-sm">
                Choose a group from the left sidebar to view announcements, connect with your classmates, or manage members.
              </p>
              {isTeacher && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create New Group
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT PANEL: Group Info & Enrolled Members                    */}
        {/* ------------------------------------------------------------- */}
        {activeGroup && showMembersPanel && (
          <div className={`absolute inset-0 z-10 w-full md:static md:w-72 shrink-0 border-l border-ink-border bg-slate-50/50 flex flex-col overflow-y-auto ${
            mobileView === 'details' ? 'flex' : 'hidden md:flex'
          }`}>
            {/* Header */}
            <div className="p-4 border-b border-ink-border bg-white flex items-center justify-between">
              <span className="text-xs font-extrabold text-ink uppercase tracking-wider">
                Group Details
              </span>
              <button
                onClick={() => {
                  setShowMembersPanel(false);
                  setMobileView('chat');
                }}
                className="text-xs text-ink-muted hover:text-ink"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Description Card */}
              <div>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                  About Group
                </p>
                <p className="text-xs text-ink leading-relaxed bg-white p-3 rounded-xl border border-ink-border">
                  {activeGroup.description || 'No description provided for this group.'}
                </p>
              </div>

              {/* Course Info Card */}
              <div>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                  Course
                </p>
                <div className="bg-white p-3 rounded-xl border border-ink-border space-y-1">
                  <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                    {activeGroup.courseCode} · {activeGroup.section || 'Sec 01'}
                  </p>
                  <p className="text-[11px] text-ink-muted">{activeGroup.courseName}</p>
                </div>
              </div>

              {/* Instructor Card */}
              <div>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                  Instructor / Owner
                </p>
                <div className="bg-white p-3 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/50 to-white flex items-center gap-2.5">
                  <Avatar name={activeGroup.teacherName} size="sm" color="navy" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink truncate flex items-center gap-1">
                      {activeGroup.teacherName}
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    </p>
                    <span className="text-[10px] font-semibold text-indigo-600">
                      Faculty Lead
                    </span>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Members ({members.length})
                  </p>
                  {canManage && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setManageModalTab('add');
                          setShowManageModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-brand-600 font-bold hover:text-brand-700 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" />
                        Add
                      </button>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          setManageModalTab('current');
                          setShowManageModal(true);
                        }}
                        className="text-[11px] text-ink-muted font-bold hover:text-ink transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1 bg-white rounded-xl border border-ink-border p-2 divide-y divide-ink-border/50 max-h-56 overflow-y-auto">
                  {members.map((m) => {
                    const isMemTeacher = Boolean(m.isTeacher || m.teacher || m.role === 'PROFESSOR' || m.role === 'FACULTY');
                    return (
                      <div key={m.userId} className="flex items-center gap-2 py-2 first:pt-1 last:pb-1">
                        <Avatar name={m.name} size="xs" color={isMemTeacher ? 'navy' : 'sky'} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-ink truncate flex items-center gap-1">
                            {m.name}
                            {m.userId === user?.id && <span className="text-[10px] text-brand-600 font-bold">(You)</span>}
                            {isMemTeacher && <ShieldCheck className="w-3 h-3 text-indigo-600 inline" />}
                          </p>
                          <p className="text-[10px] text-ink-muted truncate">
                            {isMemTeacher ? 'Professor' : 'Student'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add Button at bottom of member list */}
                {canManage && (
                  <button
                    type="button"
                    onClick={() => {
                      setManageModalTab('add');
                      setShowManageModal(true);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-lg border border-dashed border-brand-300 bg-brand-50/50 hover:bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-brand-600" />
                    + Add Enrolled Student
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Modals: Create, Edit, Manage Members                          */}
      {/* ------------------------------------------------------------- */}
      {isTeacher && (
        <>
          <CreateGroupModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onGroupCreated={(newGroup) => {
              fetchGroups();
              setActiveGroupId(newGroup.groupId);
            }}
          />

          <EditGroupModal
            isOpen={showEditModal}
            group={activeGroup}
            onClose={() => setShowEditModal(false)}
            onGroupUpdated={(updated) => {
              setActiveGroup(updated);
              fetchGroups();
            }}
            onGroupDeleted={() => {
              setActiveGroupId(null);
              fetchGroups();
            }}
          />

          <ManageMembersModal
            isOpen={showManageModal}
            initialTab={manageModalTab}
            group={activeGroup}
            onClose={() => setShowManageModal(false)}
            onMembersChanged={() => {
              if (activeGroupId) {
                getGroupMembers(activeGroupId).then(setMembers);
                fetchGroups();
              }
            }}
          />
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Delete for Everyone Confirmation Dialog                        */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteConfirmMsg(null)}
          />

          {/* Dialog Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-ink-border w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-100 mx-auto">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>

            {/* Title */}
            <div className="text-center space-y-1.5">
              <h3 id="delete-dialog-title" className="text-sm font-extrabold text-ink">
                Delete for Everyone?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Are you sure you want to delete this message for everyone? This action cannot be undone.
              </p>
            </div>

            {/* Message Preview */}
            <div className="bg-slate-50 border border-ink-border rounded-xl px-4 py-2.5 text-xs text-ink-muted italic truncate max-w-full">
              "{deleteConfirmMsg.messageContent}"
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmMsg(null)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-ink-border text-xs font-bold text-ink hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteForEveryone}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm"
              >
                {deleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
