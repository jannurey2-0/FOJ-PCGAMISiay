import React, { useState } from 'react';
import {
  Send,
  Pin,
  Reply,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

import type { UserProfile, ChatMessage } from '../../App';

interface CommunityChatProps {
  currentUser: UserProfile;
  profilesList: UserProfile[];
  chatMessages: ChatMessage[];
  activeChannel: string;
  setActiveChannel: (chan: string) => void;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  chatSearchQuery: string;
  setChatSearchQuery: (query: string) => void;
  mobileChatView: 'list' | 'chat';
  setMobileChatView: (view: 'list' | 'chat') => void;
  handleSendMessage: (e?: React.FormEvent, customMsg?: ChatMessage) => void;
  toggleReaction: (msgId: string, emoji: string) => void;
  handleDeleteMessage?: (msgId: string) => void;
  handleTogglePinMessage?: (msgId: string) => void;
  addEmoji: (emoji: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  showToast: (m: string, t?: any, title?: string) => void;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({
  currentUser,
  profilesList,
  chatMessages,
  activeChannel,
  setActiveChannel,
  newMessage,
  setNewMessage,
  chatSearchQuery,
  setChatSearchQuery,
  mobileChatView,
  setMobileChatView,
  handleSendMessage,
  toggleReaction,
  handleDeleteMessage,
  handleTogglePinMessage,
  addEmoji,
  chatEndRef,
  showToast
}) => {
  // Local States
  const [tabType, setTabType] = useState<'channels' | 'dms'>('channels');
  const [replyTarget, setReplyTarget] = useState<{ id: string; sender: string; text: string } | null>(null);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState(false);
  const [inChatSearch, setInChatSearch] = useState('');
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{ type: 'image' | 'file'; url: string; fileName?: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const channels = [
    { id: '#general-fellowship', name: 'General Fellowship', desc: 'Main community chat channel', avatar: '💬', badge: 'Public' },
    { id: '#worship-team', name: 'Worship Team', desc: 'Worship and music planning', avatar: '🎵', badge: 'Ministry' },
    { id: '#media-team', name: 'Media Team', desc: 'Audio, video, and lyrics coordination', avatar: '📹', badge: 'Ministry' },
    { id: '#youth-leaders', name: 'Youth Leaders', desc: 'Youth group coordination & events', avatar: '🔥', badge: 'Ministry' },
    { id: '#prayer-requests', name: 'Prayer Requests', desc: 'Share and intercede in prayer', avatar: '🙏', badge: 'Prayer' }
  ];

  // Default mock members if profilesList is sparse
  const defaultMembers: UserProfile[] = [
    { id: 'pastor-thomas', name: 'Pastor Thomas', role: 'Pastor', approved: true },
    { id: 'chloe-miller', name: 'Chloe Miller', role: 'Musicians / Worship Team', approved: true },
    { id: 'devon-hughes', name: 'Devon Hughes', role: 'Media Team', approved: true },
    { id: 'ruth-bennett', name: 'Ruth Bennett', role: 'Youth Leaders', approved: true },
    { id: 'evelyn-bennett', name: 'Sister Evelyn', role: 'Church Member', approved: true }
  ];

  const displayMembers = profilesList.filter(p => p.approved && p.name !== currentUser?.name).length > 0
    ? profilesList.filter(p => p.approved && p.name !== currentUser?.name)
    : defaultMembers.filter(m => m.name !== currentUser?.name);

  // Helper to generate a deterministic DM channel ID between two users
  const getDmChannelId = (memberId?: string, memberName?: string) => {
    if (!currentUser) return `dm-${memberId || 'user'}`;
    const myId = (currentUser.id || currentUser.name).toLowerCase().trim().replace(/\s+/g, '-');
    const otherId = (memberId || memberName || 'user').toLowerCase().trim().replace(/\s+/g, '-');
    const sorted = [myId, otherId].sort();
    return `dm_${sorted[0]}__${sorted[1]}`;
  };

  // Generate DMs list based on active DM members
  const dmsList = displayMembers.map(m => {
    const dmChannelId = getDmChannelId(m.id, m.name);
    return {
      id: dmChannelId,
      rawId: (m.id || m.name).toLowerCase().trim().replace(/\s+/g, '-'),
      name: m.name,
      role: m.role,
      avatar: m.name.split(' ').map(n => n[0]).join('').substring(0, 2),
      isOnline: true
    };
  });

  const getLatestMessage = (channelId: string) => {
    const msgs = chatMessages.filter(m => {
      if (m.channel === channelId) return true;
      if (channelId.startsWith('dm') && m.channel.startsWith('dm')) {
        const dmItem = dmsList.find(d => d.id === channelId);
        if (dmItem && currentUser) {
          const otherId = dmItem.rawId;
          const otherName = dmItem.name.toLowerCase();
          const senderName = m.sender.toLowerCase();
          const senderId = (m.senderId || '').toLowerCase();
          const myName = currentUser.name.toLowerCase();
          const myId = (currentUser.id || '').toLowerCase();
          return (
            (senderName === otherName || senderId === otherId || m.channel.includes(otherId)) &&
            (m.channel.includes(myId) || m.channel.includes(myName.replace(/\s+/g, '-')) || senderName === myName || senderId === myId)
          );
        }
      }
      return false;
    });
    if (msgs.length === 0) return { text: 'No messages yet', sender: '', timestamp: '' };
    return msgs[msgs.length - 1];
  };

  const currentChannelInfo = channels.find(c => c.id === activeChannel) || {
    id: activeChannel,
    name: activeChannel.startsWith('dm')
      ? dmsList.find(d => d.id === activeChannel)?.name || 'Direct Message'
      : activeChannel,
    desc: activeChannel.startsWith('dm') ? 'Private 1-on-1 Conversation' : 'Church Discussion Channel',
    avatar: activeChannel.startsWith('dm') ? '👤' : '💬',
    badge: activeChannel.startsWith('dm') ? 'Direct Message' : 'Channel'
  };

  const channelMessages = chatMessages.filter(m => {
    if (m.channel === activeChannel) return true;
    if (activeChannel.startsWith('dm') && m.channel.startsWith('dm')) {
      const dmItem = dmsList.find(d => d.id === activeChannel);
      if (dmItem && currentUser) {
        const otherId = dmItem.rawId;
        const otherName = dmItem.name.toLowerCase();
        const senderName = m.sender.toLowerCase();
        const senderId = (m.senderId || '').toLowerCase();
        const myName = currentUser.name.toLowerCase();
        const myId = (currentUser.id || '').toLowerCase();
        return (
          (senderName === otherName || senderId === otherId || m.channel.includes(otherId)) &&
          (m.channel.includes(myId) || m.channel.includes(myName.replace(/\s+/g, '-')) || senderName === myName || senderId === myId)
        );
      }
    }
    return false;
  });

  const pinnedMessages = channelMessages.filter(m => m.isPinned);

  const filteredChannelMessages = channelMessages.filter(msg => {
    if (!inChatSearch.trim()) return true;
    return msg.text.toLowerCase().includes(inChatSearch.toLowerCase()) ||
      msg.sender.toLowerCase().includes(inChatSearch.toLowerCase());
  });

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const filteredDMs = dmsList.filter(d =>
    d.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
    d.role.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedMedia) || !currentUser) return;

    const msg: ChatMessage = {
      id: 'c_' + Date.now(),
      channel: activeChannel,
      sender: currentUser.name,
      senderRole: currentUser.role,
      senderId: currentUser.id,
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      replyTo: replyTarget ? { ...replyTarget } : undefined,
      attachment: attachedMedia ? { ...attachedMedia } : undefined
    };

    handleSendMessage(e, msg);
    setNewMessage('');
    setReplyTarget(null);
    setAttachedMedia(null);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const isImage = file.type.startsWith('image/');
      setAttachedMedia({
        type: isImage ? 'image' : 'file',
        url: dataUrl,
        fileName: file.name
      });
      showToast(`${isImage ? 'Image' : 'File'} "${file.name}" attached`, 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateAttachment = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800',
      'https://images.unsplash.com/photo-1504052434569-70ad58565b90?q=80&w=800'
    ];
    const randomUrl = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setAttachedMedia({
      type: 'image',
      url: randomUrl,
      fileName: 'Church_Event_Photo.jpg'
    });
    showToast('Sample image attached', 'info');
  };

  const startDMWithUser = (user: { id?: string; name: string }) => {
    const dmId = getDmChannelId(user.id, user.name);
    setActiveChannel(dmId);
    setTabType('dms');
    setMobileChatView('chat');
    setShowComposeModal(false);
    showToast(`Started direct conversation with ${user.name}`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-church-creamDark/80 shadow-lg flex flex-col md:flex-row h-[680px] overflow-hidden relative">
      
      {/* Sidebar (Channels & DMs) */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-church-creamDark/80 flex flex-col bg-white ${
        mobileChatView === 'chat' ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Header & Compose */}
        <div className="p-4 border-b border-church-creamDark/60 flex items-center justify-between bg-stone-50/50">
          <div>
            <h3 className="font-serif text-xl font-bold text-church-wood flex items-center gap-2">
              <span>Messages</span>
              <span className="text-xs bg-church-gold/20 text-church-wood px-2 py-0.5 rounded-full font-sans font-semibold">
                Live
              </span>
            </h3>
            <p className="text-[11px] text-stone-500">Fellowship & Team Channels</p>
          </div>
          <button
            type="button"
            onClick={() => setShowComposeModal(true)}
            className="p-2 bg-church-wood hover:bg-church-wood/90 text-white rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Start Direct Message"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New DM</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search channels & members..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-stone-200/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-church-gold/50 text-stone-800 transition-colors"
            />
          </div>
        </div>

        {/* Online Members Carousel */}
        <div className="py-2.5 border-y border-stone-100 bg-stone-50/40">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Active Fellowship Members
            </span>
            <span className="text-[10px] text-church-wood font-semibold">{displayMembers.length} online</span>
          </div>
          <div className="flex overflow-x-auto gap-3.5 px-4 scrollbar-none whitespace-nowrap">
            {displayMembers.map((user, idx) => {
              const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => startDMWithUser(user)}
                  className="flex flex-col items-center shrink-0 space-y-1 text-center cursor-pointer group"
                  title={`Direct Message ${user.name}`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-church-wood to-church-gold/80 flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 group-hover:ring-2 group-hover:ring-church-gold transition-all duration-200">
                      {initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-stone-700 font-medium max-w-[60px] truncate block group-hover:text-church-wood">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Switcher: Channels vs Direct Messages */}
        <div className="flex border-b border-stone-100 bg-stone-100/50 p-1 m-3 rounded-xl">
          <button
            type="button"
            onClick={() => setTabType('channels')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabType === 'channels'
                ? 'bg-white text-church-wood shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Channels ({channels.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTabType('dms')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabType === 'dms'
                ? 'bg-white text-church-wood shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Direct ({dmsList.length})</span>
          </button>
        </div>

        {/* List Content */}
        <div className="flex-grow overflow-y-auto divide-y divide-stone-100">
          {tabType === 'channels' ? (
            filteredChannels.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8">No channels found.</p>
            ) : (
              filteredChannels.map((chan) => {
                const latest = getLatestMessage(chan.id);
                const isActive = activeChannel === chan.id;

                return (
                  <button
                    key={chan.id}
                    type="button"
                    onClick={() => {
                      setActiveChannel(chan.id);
                      setMobileChatView('chat');
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all cursor-pointer ${
                      isActive ? 'bg-stone-100/80 border-l-4 border-church-wood' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-church-wood to-church-wood/80 flex items-center justify-center text-white text-base shrink-0 shadow-sm">
                      {chan.avatar}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="font-semibold text-xs text-stone-900 truncate block">
                          {chan.name}
                        </span>
                        {latest.timestamp && (
                          <span className="text-[9px] text-stone-400 shrink-0">
                            {latest.timestamp}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 truncate">
                        {latest.sender ? `${latest.sender.split(' ')[0]}: ${latest.text}` : chan.desc}
                      </p>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            filteredDMs.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8">No members found for DM.</p>
            ) : (
              filteredDMs.map((dm) => {
                const latest = getLatestMessage(dm.id);
                const isActive = activeChannel === dm.id;

                return (
                  <button
                    key={dm.id}
                    type="button"
                    onClick={() => {
                      setActiveChannel(dm.id);
                      setMobileChatView('chat');
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all cursor-pointer ${
                      isActive ? 'bg-stone-100/80 border-l-4 border-church-wood' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-stone-200 text-church-wood font-bold flex items-center justify-center text-xs border border-stone-300">
                        {dm.avatar}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="font-semibold text-xs text-stone-900 truncate block">
                          {dm.name}
                        </span>
                        {latest.timestamp && (
                          <span className="text-[9px] text-stone-400 shrink-0">
                            {latest.timestamp}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 truncate">
                        {latest.sender ? latest.text : `Role: ${dm.role}`}
                      </p>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>

      </div>

      {/* Main Chat Window */}
      <div className={`flex-grow flex flex-col bg-stone-50/30 overflow-hidden ${
        mobileChatView === 'list' ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Chat Header Bar */}
        <div className="bg-white px-5 py-3 border-b border-church-creamDark/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileChatView('list')}
              className="md:hidden p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-church-wood to-church-gold flex items-center justify-center text-white text-sm shrink-0 shadow-xs font-bold">
              {currentChannelInfo.avatar}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-church-wood text-base truncate">
                  {currentChannelInfo.name}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-church-creamDark text-church-wood font-semibold hidden sm:inline">
                  {currentChannelInfo.badge}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">{currentChannelInfo.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Search in chat toggle */}
            <button
              type="button"
              onClick={() => setShowInChatSearch(!showInChatSearch)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showInChatSearch ? 'bg-church-gold/20 text-church-wood' : 'text-stone-500 hover:bg-stone-100'
              }`}
              title="Search in this conversation"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Pinned Messages Toggle */}
            {pinnedMessages.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPinnedDrawer(!showPinnedDrawer)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  showPinnedDrawer
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
                }`}
              >
                <Pin className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                <span>{pinnedMessages.length} Pinned</span>
                {showPinnedDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Search In Chat Header Strip */}
        {showInChatSearch && (
          <div className="bg-amber-50/60 border-b border-amber-200/60 px-4 py-2 flex items-center justify-between gap-3">
            <div className="relative flex-grow">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Filter messages in this channel..."
                value={inChatSearch}
                onChange={(e) => setInChatSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-church-gold text-stone-800"
              />
            </div>
            <button
              type="button"
              onClick={() => { setInChatSearch(''); setShowInChatSearch(false); }}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Pinned Messages Collapsible Drawer */}
        {showPinnedDrawer && pinnedMessages.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-amber-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-700" />
                Pinned Channel Announcements
              </span>
              <span className="text-[10px] text-amber-700 font-medium">Visible to all channel members</span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {pinnedMessages.map(pm => (
                <div key={pm.id} className="bg-white/80 border border-amber-200/80 rounded-lg p-2 flex items-start justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="font-semibold text-stone-900 text-[11px]">{pm.sender} ({pm.timestamp}): </span>
                    <span className="text-stone-700 text-[11px]">{pm.text}</span>
                  </div>
                  {handleTogglePinMessage && (
                    <button
                      type="button"
                      onClick={() => handleTogglePinMessage(pm.id)}
                      className="text-amber-700 hover:text-red-600 text-[10px] underline shrink-0 cursor-pointer"
                    >
                      Unpin
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {filteredChannelMessages.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-12 h-12 rounded-full bg-church-wood/10 text-church-wood flex items-center justify-center mx-auto text-xl font-serif font-bold">
                ✝️
              </div>
              <p className="text-stone-500 font-medium text-xs">
                {inChatSearch ? 'No messages match your search criteria.' : 'Welcome to this channel! Start the conversation.'}
              </p>
            </div>
          ) : (
            filteredChannelMessages.map((msg) => {
              const isSelf = Boolean(
                currentUser && (
                  (msg.senderId && msg.senderId === currentUser.id) ||
                  (msg.sender && currentUser.name && msg.sender.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
                )
              );

              return (
                <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-church-wood flex items-center gap-1">
                      {msg.sender}
                      {msg.senderRole === 'Pastor' && <ShieldCheck className="w-3 h-3 text-amber-600 inline" />}
                    </span>
                    <span className="text-[8px] bg-church-creamDark/80 px-1.5 py-0.5 rounded text-church-wood font-semibold uppercase">
                      {msg.senderRole.split(' / ')[0]}
                    </span>
                    <span className="text-[9px] text-stone-400">{msg.timestamp}</span>
                    {msg.isPinned && (
                      <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`relative group max-w-[85%] rounded-2xl p-3.5 shadow-xs transition-all duration-200 ${
                    isSelf
                      ? 'bg-church-wood text-white rounded-tr-none'
                      : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-none'
                  }`}>

                    {/* Reply To Quote Box */}
                    {msg.replyTo && (
                      <div className={`mb-2 p-2 rounded-lg text-xs border-l-3 ${
                        isSelf
                          ? 'bg-white/10 border-amber-300 text-amber-100'
                          : 'bg-stone-100 border-church-wood text-stone-600'
                      }`}>
                        <p className="font-bold text-[10px] opacity-80">Replying to {msg.replyTo.sender}</p>
                        <p className="truncate text-[11px]">{msg.replyTo.text}</p>
                      </div>
                    )}

                    {/* Image Attachment Preview */}
                    {msg.attachment && msg.attachment.type === 'image' && (
                      <div className="mb-2 overflow-hidden rounded-xl border border-black/10">
                        <img
                          src={msg.attachment.url}
                          alt="Attachment"
                          className="w-full max-h-56 object-cover hover:scale-102 transition-transform duration-300 cursor-pointer"
                          onClick={() => window.open(msg.attachment?.url, '_blank')}
                        />
                      </div>
                    )}

                    {/* File Attachment Download Pill */}
                    {msg.attachment && msg.attachment.type === 'file' && (
                      <div className={`mb-2 p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                        isSelf ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-800 border border-stone-200'
                      }`}>
                        <Paperclip className="w-4 h-4" />
                        <span className="truncate flex-grow">{msg.attachment.fileName || 'Attachment Document'}</span>
                        <a href={msg.attachment.url} target="_blank" rel="noreferrer" className="text-xs underline hover:opacity-80">
                          Download
                        </a>
                      </div>
                    )}

                    {/* Message Body Text */}
                    <p className="leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{msg.text}</p>

                    {/* Reaction Badges */}
                    {msg.emojis && msg.emojis.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-2">
                        {msg.emojis.map((emoji, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleReaction(msg.id, emoji)}
                            className={`text-xs px-2 py-0.5 rounded-full border transition-transform cursor-pointer hover:scale-110 ${
                              isSelf
                                ? 'bg-white/20 border-white/30 text-white'
                                : 'bg-stone-100 border-stone-200 text-stone-800'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Hover Action Toolbar */}
                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-stone-200 shadow-md rounded-full px-2 py-1 flex items-center gap-1.5 z-20 ${
                      isSelf ? '-left-28' : '-right-28'
                    }`}>
                      {/* Emoji Reactions */}
                      {['🙏', '❤️', '🙌'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform text-xs cursor-pointer"
                          title="React"
                        >
                          {emoji}
                        </button>
                      ))}

                      {/* Reply Button */}
                      <button
                        type="button"
                        onClick={() => setReplyTarget({ id: msg.id, sender: msg.sender, text: msg.text })}
                        className="p-1 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                        title="Reply to message"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>

                      {/* Pin Toggle Button */}
                      {handleTogglePinMessage && (
                        <button
                          type="button"
                          onClick={() => handleTogglePinMessage(msg.id)}
                          className={`p-1 hover:bg-stone-100 rounded cursor-pointer ${
                            msg.isPinned ? 'text-amber-600' : 'text-stone-400 hover:text-amber-600'
                          }`}
                          title={msg.isPinned ? 'Unpin message' : 'Pin message'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Message Button */}
                      {handleDeleteMessage && (isSelf || currentUser.role === 'Admin') && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Attached Media Banner */}
        {attachedMedia && (
          <div className="bg-church-gold/10 border-t border-church-gold/30 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-church-wood font-semibold">
              <ImageIcon className="w-4 h-4 text-church-wood" />
              <span>Attached Image: {attachedMedia.fileName}</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedMedia(null)}
              className="text-stone-400 hover:text-red-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reply Target Context Bar */}
        {replyTarget && (
          <div className="bg-stone-100 border-t border-stone-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <Reply className="w-4 h-4 text-church-wood shrink-0" />
              <span className="font-semibold text-stone-800">Replying to {replyTarget.sender}:</span>
              <span className="text-stone-600 truncate">{replyTarget.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setReplyTarget(null)}
              className="text-stone-400 hover:text-red-600 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chat Input & Toolbar */}
        <form onSubmit={handleCustomSend} className="p-3 bg-white border-t border-church-creamDark/60 flex flex-col gap-2">
          
          {/* Quick Emoji Bar & Action Icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {['🙏', '❤️', '🙌', '👏', '✝️', '💡', '😊'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="hover:scale-125 transition-transform text-sm p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.zip"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-stone-500 hover:text-church-wood hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                title="Attach Local Image or File"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-stone-500 hover:text-church-wood hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                title="Attach Image / Media"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Input Row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${currentChannelInfo.name}...`}
              className="flex-grow px-4 py-2.5 bg-stone-100/70 hover:bg-stone-100 focus:bg-white rounded-xl border border-stone-200/80 focus:outline-none focus:ring-2 focus:ring-church-gold/50 text-xs sm:text-sm text-stone-800 transition-colors"
            />

            <button
              type="submit"
              className="p-2.5 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood rounded-xl shadow-sm transition-all duration-200 cursor-pointer shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>

      {/* Direct Message Member Selection Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-church-creamDark animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-church-wood flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Start Private Conversation
              </h3>
              <button
                type="button"
                onClick={() => setShowComposeModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Select a verified church member to initiate a 1-on-1 direct message:
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl">
              {displayMembers.map((member, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => startDMWithUser(member)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-church-wood/20 text-church-wood font-bold flex items-center justify-center text-xs">
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs text-stone-900">{member.name}</h5>
                      <p className="text-[10px] text-stone-500">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-church-wood hover:underline">Message →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
