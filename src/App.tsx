import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Users,
  X,
  ChevronRight,
  Heart,
  Info,
  Flame
} from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { Analytics } from "@vercel/analytics/react";

// Modular Components
import { Toast } from './components/Toast';
import { MobileBottomDock } from './components/MobileBottomDock';
import { PortalSidebar } from './components/PortalSidebar';
import { InvitationModal } from './components/InvitationModal';
import { CommunityChat } from './components/portal/CommunityChat';
import { ProfilePanel } from './components/portal/ProfilePanel';
import { AnnouncementsPanel } from './components/portal/AnnouncementsPanel';
import { UsersPanel } from './components/portal/UsersPanel';
import { SettingsPanel } from './components/portal/SettingsPanel';
import { RSVPPanel } from './components/portal/RSVPPanel';

// Types
export interface UserProfile {
  id: string;
  name: string;
  role: string;
  approved: boolean;
  email?: string;
}

export interface HeroPhoto {
  id: string;
  url: string;
  caption?: string;
  display_order: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export interface ActivitySchedule {
  id: string;
  title: string;
  description: string;
  event_date: string;
  created_at: string;
}

export interface SystemSettings {
  id: string;
  church_name: string;
  banner_title: string;
  banner_subtitle: string;
  pinned_event_id: string | null;
  updated_at: string;
}

export interface RSVP {
  id: string;
  name: string;
  adults: number;
  kids: number;
  volunteerTeams: string[];
  note: string;
  timestamp: string;
}

export interface GratitudeNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  approved: boolean;
}

export interface Photo {
  id: string;
  url: string;
  title: string;
  category: string;
  author: string;
  likes: number;
}

export interface ChatMessage {
  id: string;
  channel: string;
  sender: string;
  senderRole: string;
  senderId?: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
  emojis?: string[];
  replyTo?: { id: string; sender: string; text: string };
  attachment?: { type: 'image' | 'file' | 'audio'; url: string; fileName?: string };
  isPinned?: boolean;
}

// Initial Data
const INITIAL_PHOTOS: Photo[] = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800',
    title: 'Sunday Worship Service',
    category: 'Services',
    author: 'Sarah Jenkins',
    likes: 24
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800',
    title: 'Youth Summer Camp Campfire',
    category: 'Youth',
    author: 'Daniel Cross',
    likes: 42
  },
  {
    id: 'p3',
    url: 'https://images.unsplash.com/photo-1504052434569-70ad58565b90?q=80&w=800',
    title: 'Midweek Fellowship Group',
    category: 'Community',
    author: 'Grace Cho',
    likes: 18
  },
  {
    id: 'p4',
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800',
    title: 'Food Pantry Distribution Day',
    category: 'Outreach',
    author: 'Marcus Vance',
    likes: 31
  },
  {
    id: 'p5',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800',
    title: 'Harvest Thanksgiving Preview',
    category: 'Events',
    author: 'Lydia Bennett',
    likes: 38
  }
];

const INITIAL_GRATITUDE_NOTES: GratitudeNote[] = [
  {
    id: 'g1',
    author: 'The Peterson Family',
    text: 'So incredibly grateful for the warm welcome we received when we moved here this summer. This community has truly become our family.',
    timestamp: '2 hours ago',
    approved: true
  },
  {
    id: 'g2',
    author: 'Sister Evelyn',
    text: 'Praising God for His faithfulness through the youth program and the amazing leaders dedicated to shaping our children\'s lives.',
    timestamp: '1 day ago',
    approved: true
  },
  {
    id: 'g3',
    author: 'James K.',
    text: 'Thankful for the prayer support during my recovery. The meals and encouragement were a true manifestation of God\'s love.',
    timestamp: '2 days ago',
    approved: true
  },
  {
    id: 'g4',
    author: 'Grace Outreach Team',
    text: 'We raised enough supplies to help 80 local families this winter! Thank you, congregation, for your open hearts.',
    timestamp: 'Just now',
    approved: false // Moderation queue example
  }
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'c1',
    channel: '#general-fellowship',
    sender: 'Pastor Thomas',
    senderRole: 'Pastor',
    text: 'Welcome to our digital fellowship workspace! Looking forward to our joint planning for the Thanksgiving Celebration.',
    timestamp: '10:15 AM',
    isPinned: true,
    emojis: ['🙏', '❤️']
  },
  {
    id: 'c2',
    channel: '#general-fellowship',
    sender: 'Chloe Miller',
    senderRole: 'Musicians / Worship Team',
    text: 'Amen! The worship set list is finalized. We\'re blending some beautiful classic hymns with modern arrangements.',
    timestamp: '10:20 AM',
    emojis: ['🙌']
  },
  {
    id: 'c3',
    channel: '#worship-team',
    sender: 'Chloe Miller',
    senderRole: 'Musicians / Worship Team',
    text: 'Hey team, rehearsal starts this Thursday at 7:00 PM. Please practice "Great Is Thy Faithfulness" in the key of D.',
    timestamp: 'Yesterday',
    isPinned: true,
    attachment: {
      type: 'file',
      url: '#',
      fileName: 'Worship_Setlist_Nov.pdf'
    }
  },
  {
    id: 'c4',
    channel: '#media-team',
    sender: 'Devon Hughes',
    senderRole: 'Media Team',
    text: 'Worship lyrics slides are ready. Pastor, let me know if we are doing the communion slides too.',
    timestamp: 'Yesterday'
  },
  {
    id: 'c5',
    channel: '#youth-leaders',
    sender: 'Ruth Bennett',
    senderRole: 'Youth Leaders',
    text: 'Friday Youth Night is bonfire themed. Make sure to bring s\'mores kits!',
    timestamp: '3 hours ago',
    attachment: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800'
    }
  },
  {
    id: 'c6',
    channel: '#prayer-requests',
    sender: 'Sister Evelyn',
    senderRole: 'Church Member',
    text: 'Please pray for my sister Grace who is undergoing surgery tomorrow morning. Standing on God\'s promises!',
    timestamp: '1 hour ago',
    isPinned: true,
    emojis: ['🙏', '❤️', '🙌']
  },
  {
    id: 'dm-pastor-thomas',
    channel: 'dm-pastor-thomas',
    sender: 'Pastor Thomas',
    senderRole: 'Pastor',
    text: 'Shalom! Thank you for your dedication to the church ministry. Let me know if you ever need prayer or counseling.',
    timestamp: '9:30 AM'
  }
];

const INITIAL_RSVPS: RSVP[] = [
  {
    id: 'r1',
    name: 'The Harris Family',
    adults: 2,
    kids: 3,
    volunteerTeams: ['Welcoming', 'Clean-up'],
    note: 'Can\'t wait to fellowship with everyone!',
    timestamp: 'Yesterday'
  },
  {
    id: 'r2',
    name: 'Sister Evelyn',
    adults: 1,
    kids: 0,
    volunteerTeams: ['Audio-Visual'],
    note: 'Thankful for the fellowship and praise.',
    timestamp: '2 days ago'
  }
];

export default function App() {
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<'home' | 'gallery' | 'portal'>('home');
  const [portalSubTab, setPortalSubTab] = useState<'chat' | 'announcements' | 'rsvp' | 'users' | 'slideshow' | 'settings' | 'schedules' | 'profile'>('chat');
  const [urlFamilyName, setUrlFamilyName] = useState<string | null>(null);

  // Modals & Lights
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Data States
  const [rsvps, setRsvps] = useState<RSVP[]>(INITIAL_RSVPS);
  const [gratitudeNotes, setGratitudeNotes] = useState<GratitudeNote[]>(INITIAL_GRATITUDE_NOTES);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);

  // Form States
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpAdults, setRsvpAdults] = useState(1);
  const [rsvpKids, setRsvpKids] = useState(0);
  const [rsvpVolunteer, setRsvpVolunteer] = useState<string[]>([]);
  const [rsvpNote, setRsvpNote] = useState('');

  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const authRole = 'Church Member';
  const [authPassword, setAuthPassword] = useState('');

  // Real DB Auth States
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  // Toast System
  interface ToastItem {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    title?: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const justRegisteredRef = useRef(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Hero Slideshow States
  const [heroPhotos, setHeroPhotos] = useState<HeroPhoto[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [newHeroUrl, setNewHeroUrl] = useState('');
  const [newHeroCaption, setNewHeroCaption] = useState('');
  const [newHeroOrder, setNewHeroOrder] = useState(0);

  // Fetch hero photos
  const fetchHeroPhotos = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('hero_photos')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data) {
      setHeroPhotos(data);
    }
  }, []);

  // System Settings, Announcements, Schedules States
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);
  const [activitySchedulesList, setActivitySchedulesList] = useState<ActivitySchedule[]>([]);

  // Admin Form States
  const [editChurchName, setEditChurchName] = useState('');
  const [editBannerTitle, setEditBannerTitle] = useState('');
  const [editBannerSubtitle, setEditBannerSubtitle] = useState('');

  // Announcement Form States
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');

  // Schedule Form States
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const fetchSystemSettings = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'general')
      .single();
    if (!error && data) {
      setSystemSettings(data);
      setEditChurchName(data.church_name);
      setEditBannerTitle(data.banner_title);
      setEditBannerSubtitle(data.banner_subtitle);
    }
  }, []);

  const fetchAnnouncements = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setAnnouncementsList(data);
    }
  }, []);

  const fetchActivitySchedules = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('activity_schedules')
      .select('*')
      .order('event_date', { ascending: true });
    if (!error && data) {
      setActivitySchedulesList(data);
    }
  }, []);

  // Fetch all initial metadata on mount
  useEffect(() => {
    fetchHeroPhotos();
    fetchSystemSettings();
    fetchAnnouncements();
    fetchActivitySchedules();
  }, [fetchHeroPhotos, fetchSystemSettings, fetchAnnouncements, fetchActivitySchedules]);

  // Slideshow interval logic
  useEffect(() => {
    if (heroPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroPhotos]);

  // Monitor Auth State and fetch profile
  useEffect(() => {
    let active = true;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      if (data) {
        if (!data.approved) {
          if (!justRegisteredRef.current) {
            showToast('Your account is pending approval by the Admin.', 'info', 'Account Status');
          } else {
            // Reset the ref since we are skipping the redundant message
            justRegisteredRef.current = false;
          }
          await supabase.auth.signOut();
          setCurrentUser(null);
        } else {
          setCurrentUser({
            id: data.id,
            name: data.name,
            role: data.role,
            approved: data.approved,
            email: email
          });
          if (data.role === 'Admin' || data.role === 'Pastor') {
            setPortalSubTab('rsvp');
          } else {
            setPortalSubTab('announcements');
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch profiles for messaging and member directory
  const fetchProfiles = React.useCallback(async () => {
    if (!currentUser) return;
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (currentUser.role !== 'Admin') {
      query = query.eq('approved', true);
    }
    const { data, error } = await query;
    if (!error && data) {
      setProfilesList(data);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchProfiles();
    } else {
      setProfilesList([]);
    }
  }, [currentUser, fetchProfiles]);

  // System Settings, Announcements, and Schedules Admin Actions
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'Admin') return;
    const { error } = await supabase
      .from('system_settings')
      .update({
        church_name: editChurchName,
        banner_title: editBannerTitle,
        banner_subtitle: editBannerSubtitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'general');

    if (error) {
      showToast('Error updating settings: ' + error.message, 'error', 'Settings Error');
    } else {
      showToast('System Settings updated successfully!', 'success', 'Settings Updated');
      fetchSystemSettings();
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !['Admin', 'Pastor', 'Church Leader'].includes(currentUser.role)) return;
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    const { error } = await supabase
      .from('announcements')
      .insert({
        title: announcementTitle,
        content: announcementContent,
        author: currentUser.name
      });

    if (error) {
      showToast('Error creating announcement: ' + error.message, 'error', 'Error');
    } else {
      showToast('Announcement posted successfully!', 'success', 'Success');
      setAnnouncementTitle('');
      setAnnouncementContent('');
      fetchAnnouncements();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!currentUser || !['Admin', 'Pastor', 'Church Leader'].includes(currentUser.role)) return;
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Error deleting announcement: ' + error.message, 'error', 'Error');
    } else {
      showToast('Announcement deleted successfully!', 'success', 'Success');
      fetchAnnouncements();
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !['Admin', 'Pastor', 'Church Leader'].includes(currentUser.role)) return;
    if (!scheduleTitle.trim() || !scheduleDate) return;

    const { error } = await supabase
      .from('activity_schedules')
      .insert({
        title: scheduleTitle,
        description: scheduleDescription,
        event_date: new Date(scheduleDate).toISOString()
      });

    if (error) {
      showToast('Error creating schedule: ' + error.message, 'error', 'Error');
    } else {
      showToast('Activity schedule created successfully!', 'success', 'Success');
      setScheduleTitle('');
      setScheduleDescription('');
      setScheduleDate('');
      fetchActivitySchedules();
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!currentUser || !['Admin', 'Pastor', 'Church Leader'].includes(currentUser.role)) return;
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    const { error } = await supabase
      .from('activity_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Error deleting schedule: ' + error.message, 'error', 'Error');
    } else {
      showToast('Activity schedule deleted successfully!', 'success', 'Success');
      fetchActivitySchedules();
    }
  };

  const handlePinEvent = async (eventId: string | null) => {
    if (!currentUser || currentUser.role !== 'Admin') return;
    const { error } = await supabase
      .from('system_settings')
      .update({
        pinned_event_id: eventId,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'general');

    if (error) {
      showToast('Error updating pinned event: ' + error.message, 'error', 'Error');
    } else {
      showToast('Pinned event updated successfully!', 'success', 'Success');
      fetchSystemSettings();
    }
  };

  // Chat state
  const [activeChannel, setActiveChannel] = useState('#general-fellowship');
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [mobileChatView, setMobileChatView] = useState<'list' | 'chat'>('list');

  // Image Upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Services');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Parse URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      // Map mock IDs to names
      const families: Record<string, string> = {
        'fam_123': 'The Jenkins Family',
        'fam_789': 'The Henderson Family',
        'fam_101': 'The Sinclair Family',
        'pastor_t': 'Pastor Thomas & Family'
      };
      const name = families[id] || 'FOJ-PCGAMI Siay Friend';
      setUrlFamilyName(name);
      setRsvpName(name);
      setShowInvitationModal(true);
    }
  }, []);



  const pinnedEvent = systemSettings?.pinned_event_id
    ? activitySchedulesList.find(e => e.id === systemSettings.pinned_event_id)
    : null;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!pinnedEvent) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const targetDate = new Date(pinnedEvent.event_date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pinnedEvent]);

  // Refs for tracking channel & message state to prevent unnecessary scrolling
  const lastChannelRef = useRef(activeChannel);
  const lastMsgIdRef = useRef<string | null>(null);

  // Scroll chat to bottom ONLY when channel changes or a new message arrives
  useEffect(() => {
    const currentChannelMsgs = chatMessages.filter(m => m.channel === activeChannel);
    const lastMsg = currentChannelMsgs[currentChannelMsgs.length - 1];
    const lastMsgId = lastMsg?.id || null;

    const channelChanged = lastChannelRef.current !== activeChannel;
    const newMsgArrived = Boolean(lastMsgId && lastMsgId !== lastMsgIdRef.current);

    lastChannelRef.current = activeChannel;
    lastMsgIdRef.current = lastMsgId;

    if (channelChanged || newMsgArrived) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChannel]);

  // Handle RSVP and Gratitude Submission
  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    const newRsvp: RSVP = {
      id: 'r_' + Date.now(),
      name: rsvpName,
      adults: rsvpAdults,
      kids: rsvpKids,
      volunteerTeams: rsvpVolunteer,
      note: rsvpNote,
      timestamp: 'Just now'
    };

    setRsvps([newRsvp, ...rsvps]);

    if (rsvpNote.trim()) {
      const newNote: GratitudeNote = {
        id: 'g_' + Date.now(),
        author: rsvpName,
        text: rsvpNote,
        timestamp: 'Just now',
        approved: false // Must be approved by Admin
      };
      setGratitudeNotes([newNote, ...gratitudeNotes]);
    }

    // Reset Form
    setRsvpName(urlFamilyName || '');
    setRsvpAdults(1);
    setRsvpKids(0);
    setRsvpVolunteer([]);
    setRsvpNote('');
    setShowInvitationModal(false);

    showToast('Thank you! Your RSVP has been submitted and is sent to the volunteer planning teams.', 'success', 'RSVP Submitted');
  };

  // Toggle volunteer checkbox
  const handleVolunteerChange = (team: string) => {
    if (rsvpVolunteer.includes(team)) {
      setRsvpVolunteer(rsvpVolunteer.filter(t => t !== team));
    } else {
      setRsvpVolunteer([...rsvpVolunteer, team]);
    }
  };

  // Supabase Register/Login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      if (!authName || !authEmail || !authPassword) return;

      justRegisteredRef.current = true;

      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            name: authName,
            role: authRole,
          }
        }
      });

      if (error) {
        justRegisteredRef.current = false;
        showToast(error.message, 'error', 'Registration Error');
      } else {
        showToast('Registration successful! Your account is pending admin approval.', 'success', 'Welcome!');
        setAuthMode('login');
      }
    } else {
      if (!authEmail || !authPassword) return;
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (error) {
        showToast(error.message, 'error', 'Login Error');
      }
    }
    // Clear forms
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
  };

  // Helper to broadcast message updates across open tabs and windows
  const broadcastSync = (messagesList: ChatMessage[]) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('pcgami_chat_sync');
        channel.postMessage({ type: 'SYNC_MESSAGES', messages: messagesList });
        channel.close();
      } catch (e) {
        // ignore fallback
      }
    }
  };

  // Fetch and sync Chat Messages from Supabase DB & LocalStorage
  const fetchMessages = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: ChatMessage[] = data.map(m => ({
          id: String(m.id),
          channel: m.channel,
          sender: m.sender,
          senderRole: m.sender_role || 'Church Member',
          senderId: m.sender_id,
          text: m.text || '',
          timestamp: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created_at: m.created_at,
          emojis: m.emojis || [],
          replyTo: m.reply_to || undefined,
          attachment: m.attachment || undefined,
          isPinned: m.is_pinned || false
        }));
        setChatMessages(prev => {
          if (
            prev.length === mapped.length &&
            prev.every((msg, i) =>
              msg.id === mapped[i].id &&
              msg.text === mapped[i].text &&
              msg.isPinned === mapped[i].isPinned &&
              (msg.emojis || []).length === (mapped[i].emojis || []).length
            )
          ) {
            return prev;
          }
          localStorage.setItem('pcgami_chat_messages', JSON.stringify(mapped));
          return mapped;
        });
      } else {
        const cached = localStorage.getItem('pcgami_chat_messages');
        if (cached) {
          try {
            setChatMessages(JSON.parse(cached));
          } catch (e) {
            setChatMessages(INITIAL_CHAT);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching messages from Supabase, using cache or initial:', err);
      const cached = localStorage.getItem('pcgami_chat_messages');
      if (cached) {
        try {
          setChatMessages(JSON.parse(cached));
        } catch (e) {
          setChatMessages(INITIAL_CHAT);
        }
      }
    }
  }, []);

  // BroadcastChannel & LocalStorage Event Listeners for instant live tab sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('pcgami_chat_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_MESSAGES' && Array.isArray(event.data?.messages)) {
          setChatMessages(event.data.messages);
        } else if (event.data?.type === 'REFETCH') {
          fetchMessages();
        }
      };
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pcgami_chat_messages' && e.newValue) {
        try {
          setChatMessages(JSON.parse(e.newValue));
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchMessages]);

  // Realtime WebSocket Subscription & Fast Polling Engine (2.5s)
  useEffect(() => {
    fetchMessages();

    // 1. Supabase Postgres Realtime Subscription
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    // 2. High-Frequency Polling fallback (2.5 seconds) to ensure live sync without browser refresh
    const interval = setInterval(() => {
      fetchMessages();
    }, 2500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchMessages]);

  // Send Message with Supabase & Live Persistence
  const handleSendMessage = async (e?: React.FormEvent, customMsg?: ChatMessage) => {
    if (e) e.preventDefault();
    if (!currentUser && !customMsg) return;

    const msgToSend: ChatMessage = customMsg || {
      id: 'c_' + Date.now(),
      channel: activeChannel,
      sender: currentUser?.name || 'Anonymous',
      senderRole: currentUser?.role || 'Church Member',
      senderId: currentUser?.id,
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    if (!msgToSend.text && !msgToSend.attachment) return;

    setChatMessages(prev => {
      const updated = [...prev, msgToSend];
      localStorage.setItem('pcgami_chat_messages', JSON.stringify(updated));
      broadcastSync(updated);
      return updated;
    });
    setNewMessage('');

    try {
      await supabase.from('messages').insert({
        channel: msgToSend.channel,
        sender_id: currentUser?.id || msgToSend.senderId || null,
        sender: msgToSend.sender,
        sender_role: msgToSend.senderRole,
        text: msgToSend.text,
        emojis: msgToSend.emojis || [],
        reply_to: msgToSend.replyTo || null,
        attachment: msgToSend.attachment || null,
        is_pinned: msgToSend.isPinned || false
      });
      fetchMessages();
    } catch (err) {
      console.warn('Supabase insert message error:', err);
    }
  };

  // Add emoji to message input
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // Message Reaction Toggle
  const toggleReaction = async (msgId: string, emoji: string) => {
    let targetMsg: ChatMessage | undefined;
    setChatMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.id === msgId) {
          const currentEmojis = msg.emojis || [];
          const newEmojis = currentEmojis.includes(emoji)
            ? currentEmojis.filter(e => e !== emoji)
            : [...currentEmojis, emoji];
          targetMsg = { ...msg, emojis: newEmojis };
          return targetMsg;
        }
        return msg;
      });
      localStorage.setItem('pcgami_chat_messages', JSON.stringify(updated));
      broadcastSync(updated);
      return updated;
    });

    if (targetMsg && !targetMsg.id.startsWith('c_')) {
      try {
        await supabase
          .from('messages')
          .update({ emojis: targetMsg.emojis })
          .eq('id', targetMsg.id);
      } catch (err) {
        console.warn('Error updating reactions in Supabase:', err);
      }
    }
  };

  // Delete Message
  const handleDeleteMessage = async (msgId: string) => {
    setChatMessages(prev => {
      const updated = prev.filter(m => m.id !== msgId);
      localStorage.setItem('pcgami_chat_messages', JSON.stringify(updated));
      broadcastSync(updated);
      return updated;
    });
    showToast('Message deleted', 'info');

    if (!msgId.startsWith('c_')) {
      try {
        await supabase.from('messages').delete().eq('id', msgId);
      } catch (err) {
        console.warn('Error deleting message from Supabase:', err);
      }
    }
  };

  // Toggle Pin Message
  const handleTogglePinMessage = async (msgId: string) => {
    let updatedState = false;
    setChatMessages(prev => {
      const updated = prev.map(m => {
        if (m.id === msgId) {
          const isPinned = !m.isPinned;
          updatedState = isPinned;
          return { ...m, isPinned };
        }
        return m;
      });
      localStorage.setItem('pcgami_chat_messages', JSON.stringify(updated));
      broadcastSync(updated);
      return updated;
    });

    showToast(updatedState ? 'Message pinned to top' : 'Message unpinned', 'info');

    if (!msgId.startsWith('c_')) {
      try {
        await supabase
          .from('messages')
          .update({ is_pinned: updatedState })
          .eq('id', msgId);
      } catch (err) {
        console.warn('Error toggling pin in Supabase:', err);
      }
    }
  };

  // File drop/upload mock logic
  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview || !uploadTitle || !currentUser) return;

    const newPhoto: Photo = {
      id: 'p_' + Date.now(),
      url: uploadPreview,
      title: uploadTitle,
      category: uploadCategory,
      author: currentUser.name,
      likes: 0
    };

    setPhotos([newPhoto, ...photos]);
    setUploadTitle('');
    setUploadPreview(null);
    setShowUploadModal(false);
  };

  // Admin Actions
  const approveNote = (id: string) => {
    setGratitudeNotes(prev => prev.map(n => n.id === id ? { ...n, approved: true } : n));
  };

  const hideNote = (id: string) => {
    setGratitudeNotes(prev => prev.filter(n => n.id !== id));
  };

  // RSVPs Totals
  const totalAdults = rsvps.reduce((acc, curr) => acc + curr.adults, 0);
  const totalKids = rsvps.reduce((acc, curr) => acc + curr.kids, 0);
  const volunteersList = rsvps.flatMap(r => r.volunteerTeams.map(team => ({ name: r.name, team })));

  return (
    <div className="min-h-screen bg-church-bg text-church-charcoal flex flex-col font-sans selection:bg-church-gold/30">

      {/* Warm Golden Glow Top Bar Accent */}
      <div className="h-1.5 bg-gradient-to-r from-church-wood via-church-gold to-church-wood w-full"></div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-church-bg/95 backdrop-blur-md border-b border-church-creamDark/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-full bg-church-wood flex items-center justify-center text-church-gold shadow-md">
              <Flame className="w-5 h-5 text-church-gold fill-church-gold" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-church-wood block leading-none">
                {systemSettings?.church_name ? systemSettings.church_name.split('-')[0] : 'FOJ'}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-church-gold font-bold block">
                {systemSettings?.church_name && systemSettings.church_name.includes('-')
                  ? systemSettings.church_name.substring(systemSettings.church_name.indexOf('-') + 1)
                  : systemSettings?.church_name || 'PCGAMI Siay'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${activeTab === 'home'
                ? 'bg-church-wood text-church-bg shadow-sm'
                : 'text-church-charcoal/80 hover:text-church-wood hover:bg-church-creamDark/50'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${activeTab === 'gallery'
                ? 'bg-church-wood text-church-bg shadow-sm'
                : 'text-church-charcoal/80 hover:text-church-wood hover:bg-church-creamDark/50'
                }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className={`px-4 py-2 rounded-full font-medium text-sm flex items-center space-x-1.5 transition-all duration-300 ${activeTab === 'portal'
                ? 'bg-church-wood text-church-bg shadow-sm'
                : 'text-church-charcoal/80 hover:text-church-wood hover:bg-church-creamDark/50'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Portal</span>
              {currentUser && (
                <span className="w-2 h-2 rounded-full bg-church-gold animate-pulse"></span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">

        {/* ================= TAB 1: HOME PAGE ================= */}
        {activeTab === 'home' && (
          <div className="animate-fadeIn">
            {/* Hero / Vision Section */}
            <div className="relative text-church-bg py-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden min-h-[450px] flex items-center justify-center">
              {/* Background Slideshow */}
              {heroPhotos.length > 0 ? (
                <div className="absolute inset-0 z-0">
                  {heroPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      style={{ backgroundImage: `url(${photo.url})` }}
                    />
                  ))}
                  {/* Overlay to ensure text readability */}
                  <div className="absolute inset-0 bg-black/60 z-10"></div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-church-wood z-0">
                  {/* Decorative lighting glow backdrops */}
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-church-gold/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-church-gold/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>
                </div>
              )}

              <div className="max-w-4xl mx-auto relative z-20 space-y-6">
                <span className="text-xs uppercase tracking-widest text-church-gold font-bold bg-church-gold/10 px-3 py-1 rounded-full border border-church-gold/20">
                  Welcome to {systemSettings?.church_name || 'FOJ-PCGAMI Siay'}
                </span>
                <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
                  {systemSettings?.banner_title ? (
                    systemSettings.banner_title.includes('<br />') || systemSettings.banner_title.includes('\n') ? (
                      systemSettings.banner_title.split(/<br\s*\/?>|\n/).map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < systemSettings.banner_title.split(/<br\s*\/?>|\n/).length - 1 && <br />}
                        </React.Fragment>
                      ))
                    ) : (
                      systemSettings.banner_title
                    )
                  ) : (
                    <>A place to belong, grow, <br />and share God's warm love.</>
                  )}
                </h1>
                <p className="text-church-goldLight text-lg sm:text-xl font-light max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
                  {systemSettings?.banner_subtitle || `"Let us hold fast the confession of our hope without wavering, for He who promised is faithful. And let us consider how to stir up one another to love and good works." — Hebrews 10:23-24`}
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                  <button
                    onClick={() => setShowInvitationModal(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-church-gold hover:bg-church-goldDark text-church-wood hover:text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Thanksgiving Celebration RSVP
                  </button>
                  <button
                    onClick={() => setActiveTab('portal')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    Enter Community Portal
                  </button>
                </div>
              </div>
            </div>



            {/* Event Countdown Banner */}
            {pinnedEvent && (
              <div className="bg-church-creamDark/60 border-y border-church-gold/20 py-8 px-4 animate-fadeIn">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-church-gold/20 text-church-goldDark rounded-full flex items-center justify-center">
                      <span className="text-xl">⏳</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest text-church-goldDark font-bold block">Featured Event Countdown</span>
                      <h3 className="font-serif text-2xl font-bold text-church-wood">{pinnedEvent.title}</h3>
                      <p className="text-sm text-church-charcoal/70">
                        Join us on {new Date(pinnedEvent.event_date).toLocaleDateString([], { dateStyle: 'long' })} at {new Date(pinnedEvent.event_date).toLocaleTimeString([], { timeStyle: 'short' })}.
                      </p>
                    </div>
                  </div>

                  {/* Countdown numbers */}
                  <div className="flex items-center space-x-3 sm:space-x-6">
                    {[
                      { label: 'Days', value: timeLeft.days },
                      { label: 'Hours', value: timeLeft.hours },
                      { label: 'Mins', value: timeLeft.minutes },
                      { label: 'Secs', value: timeLeft.seconds }
                    ].map((unit, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-church-wood rounded-xl flex items-center justify-center text-church-gold font-serif text-2xl sm:text-3xl font-bold shadow-md border border-church-gold/20 transition-all duration-300">
                          {String(unit.value).padStart(2, '0')}
                        </div>
                        <span className="text-xs uppercase tracking-widest text-church-wood/80 font-bold mt-1.5">{unit.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="bg-church-creamDark/30 py-16 border-b border-church-creamDark/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                  {/* Left Column: Announcements */}
                  <div className="space-y-8">
                    <div className="border-b border-church-creamDark pb-4 flex items-center justify-between">
                      <h2 className="font-serif text-3xl font-bold text-church-wood flex items-center space-x-2">
                        <span className="text-2xl">📢</span>
                        <span>Announcements</span>
                      </h2>
                      <span className="text-xs uppercase tracking-widest text-church-gold font-bold bg-church-gold/10 px-2.5 py-1 rounded-full border border-church-gold/20">Latest Updates</span>
                    </div>

                    <div className="space-y-6">
                      {announcementsList.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl border border-church-creamDark/60 text-center text-church-charcoal/50 text-sm">
                          No active announcements at this time.
                        </div>
                      ) : (
                        announcementsList.slice(0, 3).map((ann) => (
                          <div key={ann.id} className="bg-white p-6 rounded-2xl border border-church-creamDark/60 shadow-sm space-y-3 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <h4 className="font-serif font-bold text-lg text-church-wood">{ann.title}</h4>
                              <span className="text-xs text-church-charcoal/40">
                                {new Date(ann.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
                              </span>
                            </div>
                            <p className="text-sm text-church-charcoal/80 leading-relaxed whitespace-pre-line">{ann.content}</p>
                            <div className="text-xs text-church-charcoal/50 text-right">
                              — Posted by <span className="font-semibold text-church-wood">{ann.author}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Church Schedules / Activities */}
                  <div className="space-y-8">
                    <div className="border-b border-church-creamDark pb-4 flex items-center justify-between">
                      <h2 className="font-serif text-3xl font-bold text-church-wood flex items-center space-x-2">
                        <span className="text-2xl">📅</span>
                        <span>Upcoming Activities</span>
                      </h2>
                      <span className="text-xs uppercase tracking-widest text-church-wood/80 font-bold bg-church-creamDark px-2.5 py-1 rounded-full">Calendar</span>
                    </div>

                    <div className="space-y-4">
                      {activitySchedulesList.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl border border-church-creamDark/60 text-center text-church-charcoal/50 text-sm">
                          No scheduled activities at this time.
                        </div>
                      ) : (
                        activitySchedulesList.map((sched) => {
                          const dateObj = new Date(sched.event_date);
                          const day = dateObj.toLocaleDateString([], { day: '2-digit' });
                          const month = dateObj.toLocaleDateString([], { month: 'short' });
                          return (
                            <div key={sched.id} className="bg-white p-5 rounded-2xl border border-church-creamDark/60 shadow-sm flex space-x-4 items-start hover:shadow-md transition-all duration-300">
                              <div className="w-12 h-12 bg-church-wood text-church-gold rounded-xl flex flex-col items-center justify-center font-bold shrink-0 shadow-sm">
                                <span className="text-sm leading-none">{day}</span>
                                <span className="text-[9px] uppercase tracking-wide mt-0.5">{month}</span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-serif font-bold text-church-wood text-base">{sched.title}</h4>
                                {sched.description && (
                                  <p className="text-xs text-church-charcoal/70 leading-relaxed">{sched.description}</p>
                                )}
                                <span className="inline-block text-[10px] text-church-goldDark bg-church-gold/10 px-2 py-0.5 rounded font-medium">
                                  {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Gratitude Wall Section */}
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-church-wood">The Gratitude Wall</h2>
                <div className="h-1 w-24 bg-church-gold mx-auto rounded-full"></div>
                <p className="text-church-charcoal/80">
                  Sharing our blessings and praising Him. Send your words of thanksgiving via our invitation form to encourage the church community.
                </p>
              </div>

              {/* Grid of Approved Gratitude Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gratitudeNotes.filter(n => n.approved).map((note) => (
                  <div key={note.id} className="bg-white p-8 rounded-2xl shadow-sm border border-church-creamDark relative group hover:shadow-md transition-all duration-300">
                    <Heart className="absolute top-6 right-6 w-5 h-5 text-church-gold/50 group-hover:text-church-gold transition-colors duration-300" />
                    <p className="font-serif text-church-charcoal/90 italic leading-relaxed text-lg mb-6">
                      "{note.text}"
                    </p>
                    <div className="flex items-center space-x-3 border-t border-church-creamDark/60 pt-4">
                      <div className="w-8 h-8 rounded-full bg-church-gold/10 flex items-center justify-center text-church-goldDark font-bold text-xs uppercase">
                        {note.author.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-church-wood">{note.author}</h4>
                        <span className="text-xs text-church-charcoal/50">{note.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={() => setShowInvitationModal(true)}
                  className="px-6 py-3 bg-church-creamDark hover:bg-church-gold/20 text-church-wood font-semibold rounded-lg border border-church-gold/30 hover:border-church-gold transition-all duration-300"
                >
                  Share Your Thanks & RSVP
                </button>
              </div>
            </div>

            {/* Gallery Preview Section */}
            <div className="bg-church-creamDark/30 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-baseline mb-10 border-b border-church-creamDark/60 pb-6">
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-church-wood">Capturing Blessed Memories</h2>
                    <p className="text-church-charcoal/70 mt-2">Moments of joy, prayer, and serving together.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="text-church-goldDark hover:text-church-wood font-semibold text-sm flex items-center space-x-1 hover:underline mt-4 sm:mt-0 transition-colors"
                  >
                    <span>View Full Gallery</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Masonry Grid Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.slice(0, 3).map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm border border-church-creamDark transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-church-wood/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <div>
                            <span className="text-xs uppercase tracking-widest text-church-gold font-bold block mb-1">{photo.category}</span>
                            <h4 className="text-white font-serif text-lg font-bold leading-tight">{photo.title}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PUBLIC GALLERY ================= */}
        {activeTab === 'gallery' && (
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-church-creamDark/80 pb-8 mb-10">
              <div>
                <h1 className="font-serif text-4xl font-bold text-church-wood">Blessed Memories Gallery</h1>
                <p className="text-church-charcoal/70 mt-1">A visual story of God's work in our community.</p>
              </div>

              {/* Upload Access & Filters */}
              <div className="flex items-center gap-3">
                {currentUser ? (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-church-wood hover:bg-church-gold hover:text-church-wood text-white font-semibold rounded-lg shadow-sm transition-all duration-300"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Memory</span>
                  </button>
                ) : (
                  <div className="text-xs bg-church-creamDark/50 border border-church-gold/20 text-church-wood px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Info className="w-4 h-4 text-church-goldDark" />
                    <span>Portal Members can upload photos.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Masonry Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm border border-church-creamDark cursor-pointer group hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-church-wood/90 via-church-wood/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <span className="text-xs uppercase tracking-widest text-church-gold font-bold mb-1">{photo.category}</span>
                      <h3 className="text-white font-serif text-xl font-bold leading-snug mb-2">{photo.title}</h3>
                      <div className="flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/20">
                        <span>Shared by {photo.author}</span>
                        <span className="flex items-center space-x-1 text-church-goldLight">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{photo.likes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SECURE COMMUNITY PORTAL ================= */}
        {activeTab === 'portal' && (
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
            {authLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-church-gold"></div>
              </div>
            ) : !currentUser ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-church-creamDark/80 overflow-hidden transform transition-all">
                <div className="bg-church-wood p-8 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-church-wood via-church-wood to-church-charcoal"></div>
                  <div className="relative z-10 space-y-2">
                    <h2 className="font-serif text-3xl font-bold text-white">Community Portal</h2>
                    <p className="text-church-goldLight text-sm font-light">Access your ministry schedules, real-time chat, and gallery uploads.</p>
                  </div>
                </div>

                <div className="p-8">
                  {/* Mode switcher */}
                  <div className="flex bg-church-creamDark/50 rounded-lg p-1 mb-6">
                    <button
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-2 text-center text-sm font-semibold rounded-md transition-all ${authMode === 'login'
                        ? 'bg-white text-church-wood shadow-sm'
                        : 'text-church-charcoal/60 hover:text-church-wood'
                        }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-2 text-center text-sm font-semibold rounded-md transition-all ${authMode === 'register'
                        ? 'bg-white text-church-wood shadow-sm'
                        : 'text-church-charcoal/60 hover:text-church-wood'
                        }`}
                    >
                      Register
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === 'register' && (
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Samuel Bennett"
                          className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g. samuel@grace.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold"
                      />
                    </div>



                    <div>
                      <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood font-bold rounded-lg shadow-md transition-all duration-300 mt-2"
                    >
                      {authMode === 'login' ? 'Access Portal' : 'Register Account'}
                    </button>
                  </form>


                </div>
              </div>
            ) : (

              // 3B: If Logged In -> Show Portal Layout
              <div className="space-y-8">

                {/* User Greeting & Header */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-church-creamDark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-church-gold/20 flex items-center justify-center text-church-goldDark font-bold text-lg sm:text-xl uppercase shrink-0">
                      {currentUser.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-church-wood truncate">Shalom, {currentUser.name}!</h2>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-church-charcoal/70">
                        <span className="px-2 py-0.5 bg-church-creamDark text-church-wood rounded-full text-[10px] sm:text-xs font-semibold shrink-0">
                          {currentUser.role}
                        </span>
                        <span className="hidden sm:inline text-church-charcoal/30">•</span>
                        <span className="truncate">Welcome back to fellowship.</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Portal Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8 pb-20 lg:pb-0">

                  {/* Left Column: Navigation Sidebar (Desktop only) */}
                  <PortalSidebar
                    currentUser={currentUser}
                    portalSubTab={portalSubTab}
                    setPortalSubTab={setPortalSubTab}
                    onLogout={() => supabase.auth.signOut()}
                  />

                  {/* Right Column: Dynamic Sub-tab Panel */}
                  <div className="flex-grow space-y-8">



                    {/* Sub-tab: Community Chat */}
                    {portalSubTab === 'chat' && (
                      <CommunityChat
                        currentUser={currentUser}
                        profilesList={profilesList}
                        chatMessages={chatMessages}
                        activeChannel={activeChannel}
                        setActiveChannel={setActiveChannel}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        chatSearchQuery={chatSearchQuery}
                        setChatSearchQuery={setChatSearchQuery}
                        mobileChatView={mobileChatView}
                        setMobileChatView={setMobileChatView}
                        handleSendMessage={handleSendMessage}
                        toggleReaction={toggleReaction}
                        handleDeleteMessage={handleDeleteMessage}
                        handleTogglePinMessage={handleTogglePinMessage}
                        addEmoji={addEmoji}
                        chatEndRef={chatEndRef}
                        showToast={showToast}
                      />
                    )}

                    {/* Sub-tab: Announcements & Schedules */}
                    {portalSubTab === 'announcements' && (
                      <AnnouncementsPanel
                        currentUser={currentUser}
                        announcementsList={announcementsList}
                        announcementTitle={announcementTitle}
                        setAnnouncementTitle={setAnnouncementTitle}
                        announcementContent={announcementContent}
                        setAnnouncementContent={setAnnouncementContent}
                        handleCreateAnnouncement={handleCreateAnnouncement}
                        handleDeleteAnnouncement={handleDeleteAnnouncement}
                        activitySchedulesList={activitySchedulesList}
                        systemSettings={systemSettings}
                        scheduleTitle={scheduleTitle}
                        setScheduleTitle={setScheduleTitle}
                        scheduleDescription={scheduleDescription}
                        setScheduleDescription={setScheduleDescription}
                        scheduleDate={scheduleDate}
                        setScheduleDate={setScheduleDate}
                        handleCreateSchedule={handleCreateSchedule}
                        handleDeleteSchedule={handleDeleteSchedule}
                        handlePinEvent={handlePinEvent}
                      />
                    )}

                    {/* Sub-tab: RSVP & Facilitator Dashboard */}
                    {portalSubTab === 'rsvp' && (currentUser.role === 'Admin' || currentUser.role === 'Pastor') && (
                      <RSVPPanel
                        currentUser={currentUser}
                        totalAdults={totalAdults}
                        totalKids={totalKids}
                        volunteersList={volunteersList}
                        gratitudeNotes={gratitudeNotes}
                        approveNote={approveNote}
                        hideNote={hideNote}
                      />
                    )}

                    {/* Sub-tab: User Approvals */}
                    {portalSubTab === 'users' && currentUser.role === 'Admin' && (
                      <UsersPanel
                        currentUser={currentUser}
                        profilesList={profilesList}
                        fetchProfiles={fetchProfiles}
                        showToast={showToast}
                      />
                    )}

                    {/* Sub-tab: System Settings & Slideshow */}
                    {portalSubTab === 'settings' && currentUser.role === 'Admin' && (
                      <SettingsPanel
                        currentUser={currentUser}
                        editChurchName={editChurchName}
                        setEditChurchName={setEditChurchName}
                        editBannerTitle={editBannerTitle}
                        setEditBannerTitle={setEditBannerTitle}
                        editBannerSubtitle={editBannerSubtitle}
                        setEditBannerSubtitle={setEditBannerSubtitle}
                        handleUpdateSettings={handleUpdateSettings}
                        heroPhotos={heroPhotos}
                        newHeroUrl={newHeroUrl}
                        setNewHeroUrl={setNewHeroUrl}
                        newHeroCaption={newHeroCaption}
                        setNewHeroCaption={setNewHeroCaption}
                        newHeroOrder={newHeroOrder}
                        setNewHeroOrder={setNewHeroOrder}
                        fetchHeroPhotos={fetchHeroPhotos}
                        showToast={showToast}
                      />
                    )}

                    {/* Sub-tab: Profile */}
                    {portalSubTab === 'profile' && currentUser?.role !== 'Admin' && (
                      <ProfilePanel currentUser={currentUser} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-church-wood text-church-bg border-t border-church-gold/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-lg font-bold text-white">FOJ-PCGAMI Siay</h3>
            <p className="text-xs text-church-goldLight mt-1">Sharing the warmth of God's love across the community.</p>
          </div>
          <div className="text-center md:text-right text-xs text-church-goldLight/80">
            <p>© {new Date().getFullYear()} FOJ-PCGAMI Siay. All rights reserved.</p>
            <p className="mt-1">Thanksgiving Celebration Entry Parameter: <a href="?id=fam_123" className="underline hover:text-church-gold transition-colors">?id=fam_123</a></p>
          </div>
        </div>
      </footer>

      {/* ================= MODAL: DIGITAL INVITATION / RSVP ================= */}
      <InvitationModal
        showInvitationModal={showInvitationModal}
        setShowInvitationModal={setShowInvitationModal}
        urlFamilyName={urlFamilyName}
        rsvpName={rsvpName}
        setRsvpName={setRsvpName}
        rsvpAdults={rsvpAdults}
        setRsvpAdults={setRsvpAdults}
        rsvpKids={rsvpKids}
        setRsvpKids={setRsvpKids}
        rsvpVolunteer={rsvpVolunteer}
        handleVolunteerChange={handleVolunteerChange}
        rsvpNote={rsvpNote}
        setRsvpNote={setRsvpNote}
        handleRSVPSubmit={handleRSVPSubmit}
      />

      {/* ================= LIGHTBOX MODAL: PHOTO VIEW ================= */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 animate-fadeIn"
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-4xl mx-auto flex items-center justify-center flex-grow">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="max-h-[75svh] max-w-full rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="bg-church-charcoal/90 text-white p-6 max-w-2xl mx-auto rounded-t-2xl w-full text-center space-y-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs uppercase tracking-widest text-church-gold font-bold">{selectedPhoto.category}</span>
            <h3 className="font-serif text-2xl font-bold">{selectedPhoto.title}</h3>
            <p className="text-xs text-white/70">Shared by {selectedPhoto.author}</p>
          </div>
        </div>
      )}

      {/* ================= MODAL: PHOTO UPLOADER (DROPZONE) ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-church-charcoal/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-church-bg max-w-md w-full rounded-2xl shadow-2xl border border-church-creamDark overflow-hidden">
            <div className="bg-church-wood p-6 text-center text-white relative">
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-2xl font-bold">Upload Blessed Memories</h2>
              <p className="text-xs text-church-goldLight mt-1">Share photos from youth gatherings, services, and camps.</p>
            </div>

            <form onSubmit={handlePhotoSubmit} className="p-6 space-y-4">

              {/* Dropzone area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handlePhotoDrop}
                className="border-2 border-dashed border-church-gold/40 hover:border-church-gold rounded-xl p-6 text-center bg-white/50 cursor-pointer transition-all duration-300 relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                {uploadPreview ? (
                  <div className="space-y-2">
                    <img
                      src={uploadPreview}
                      alt="Upload Preview"
                      className="max-h-36 mx-auto rounded-lg object-cover"
                    />
                    <p className="text-xs text-church-wood font-semibold">Change selected photo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 text-church-gold mx-auto" />
                    <p className="text-sm font-semibold text-church-wood">Drag & drop photo here or click to browse</p>
                    <p className="text-xs text-church-charcoal/50">Supports JPEG, PNG up to 10MB</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Photo Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Fellowship Picnic"
                  className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-sm"
                >
                  <option value="Services">Services</option>
                  <option value="Youth">Youth</option>
                  <option value="Community">Community</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 border border-church-creamDark text-church-charcoal text-sm font-semibold rounded-lg hover:bg-church-creamDark transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadPreview || !uploadTitle}
                  className={`flex-1 py-2.5 font-bold rounded-lg text-sm transition-all duration-300 ${uploadPreview && uploadTitle
                    ? 'bg-church-wood hover:bg-church-gold text-white hover:text-church-wood shadow-md'
                    : 'bg-church-creamDark text-church-charcoal/40 cursor-not-allowed'
                    }`}
                >
                  Publish Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Mobile Bottom Navigation Dock (Instagram Style) */}
      <MobileBottomDock
        currentUser={currentUser}
        activeTab={activeTab}
        portalSubTab={portalSubTab}
        setPortalSubTab={setPortalSubTab}
        onLogout={() => supabase.auth.signOut()}
      />

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}
