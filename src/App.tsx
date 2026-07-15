import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  Upload,
  Users,
  LogOut,
  Send,
  Check,
  X,
  ChevronRight,
  Heart,
  Info,
  Shield,
  BookOpen,
  Flame
} from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { Analytics } from "@vercel/analytics/react"

// Types
interface UserProfile {
  id: string;
  name: string;
  role: string;
  approved: boolean;
  email?: string;
}

interface HeroPhoto {
  id: string;
  url: string;
  caption?: string;
  display_order: number;
}

interface RSVP {
  id: string;
  name: string;
  adults: number;
  kids: number;
  volunteerTeams: string[];
  note: string;
  timestamp: string;
}

interface GratitudeNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  approved: boolean;
}

interface Photo {
  id: string;
  url: string;
  title: string;
  category: string;
  author: string;
  likes: number;
}

interface ChatMessage {
  id: string;
  channel: string;
  sender: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
  emojis?: string[];
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
    timestamp: '10:15 AM'
  },
  {
    id: 'c2',
    channel: '#general-fellowship',
    sender: 'Chloe Miller',
    senderRole: 'Musicians / Worship Team',
    text: 'Amen! The worship set list is finalized. We\'re blending some beautiful classic hymns with modern arrangements.',
    timestamp: '10:20 AM'
  },
  {
    id: 'c3',
    channel: '#worship-team',
    sender: 'Chloe Miller',
    senderRole: 'Musicians / Worship Team',
    text: 'Hey team, rehearsal starts this Thursday at 7:00 PM. Please practice "Great Is Thy Faithfulness" in the key of D.',
    timestamp: 'Yesterday'
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
    timestamp: '3 hours ago'
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
  const [authRole, setAuthRole] = useState('Church Member');
  const [authPassword, setAuthPassword] = useState('');

  // Real DB Auth States
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Fetch hero photos on mount
  useEffect(() => {
    fetchHeroPhotos();
  }, [fetchHeroPhotos]);

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
          alert('Your account is pending approval by the Admin.');
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
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch all profiles for Admin
  const fetchProfiles = React.useCallback(async () => {
    if (currentUser?.role === 'Admin') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProfilesList(data);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === 'Admin') {
      fetchProfiles();
    } else {
      setProfilesList([]);
    }
  }, [currentUser, fetchProfiles]);

  // Chat state
  const [activeChannel, setActiveChannel] = useState('#general-fellowship');
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Countdown timer logic to Thanksgiving Celebration (November 26, 2026)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const eventDate = new Date('November 26, 2026 10:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom when channel or messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChannel, activeTab]);

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

    alert('Thank you! Your RSVP has been submitted and is sent to the volunteer planning teams.');
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
        alert(error.message);
      } else {
        if (authEmail === 'admin@pcgami.org') {
          alert('Registration successful! Auto-approved as Admin. You can now log in.');
        } else {
          alert('Registration successful! Your account is pending admin approval.');
        }
        setAuthMode('login');
      }
    } else {
      if (!authEmail || !authPassword) return;
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (error) {
        alert(error.message);
      }
    }
    // Clear forms
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
  };

  // Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msg: ChatMessage = {
      id: 'c_' + Date.now(),
      channel: activeChannel,
      sender: currentUser.name,
      senderRole: currentUser.role,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    setChatMessages([...chatMessages, msg]);
    setNewMessage('');
  };

  // Add emoji to message input
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // Message Reaction Toggle
  const toggleReaction = (msgId: string, emoji: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === msgId) {
        const currentEmojis = msg.emojis || [];
        if (currentEmojis.includes(emoji)) {
          return { ...msg, emojis: currentEmojis.filter(e => e !== emoji) };
        } else {
          return { ...msg, emojis: [...currentEmojis, emoji] };
        }
      }
      return msg;
    }));
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
              <span className="font-serif text-2xl font-bold tracking-tight text-church-wood block leading-none">FOJ</span>
              <span className="text-[10px] uppercase tracking-widest text-church-gold font-bold block">PCGAMI Siay</span>
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
                  Welcome to FOJ-PCGAMI Siay
                </span>
                <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
                  A place to belong, grow, <br />and share God's warm love.
                </h1>
                <p className="text-church-goldLight text-lg sm:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                  "Let us hold fast the confession of our hope without wavering, for He who promised is faithful. And let us consider how to stir up one another to love and good works." — Hebrews 10:23-24
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
            <div className="bg-church-creamDark/60 border-y border-church-gold/20 py-8 px-4">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-church-gold/20 text-church-goldDark rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-church-wood">Church Thanksgiving Celebration</h3>
                    <p className="text-sm text-church-charcoal/70">Join us on November 26, 2026 at 10:00 AM for our annual harvest gathering.</p>
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

                    {authMode === 'register' && (
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Ministry Role / Title</label>
                        <select
                          value={authRole}
                          onChange={(e) => setAuthRole(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Pastor">Pastor</option>
                          <option value="Church Leader">Church Leader</option>
                          <option value="Youth Leader">Youth Leader</option>
                          <option value="Church Member">Church Member</option>
                          <option value="Young People">Young People</option>
                        </select>
                      </div>
                    )}

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

                  {/* Help box */}
                  <div className="mt-6 p-4 bg-church-creamDark/40 rounded-xl border border-church-gold/20 text-xs text-church-charcoal/80 space-y-1">
                    <span className="font-bold flex items-center text-church-wood">
                      <Shield className="w-3.5 h-3.5 mr-1 text-church-goldDark" />
                      Prototype Helper Tips:
                    </span>
                    <p>• To test **Pastor / Admin** view, log in with an email containing `pastor` or `admin`.</p>
                    <p>• Other roles like `worship`, `media`, or `youth` will unlock appropriate portal access levels.</p>
                  </div>
                </div>
              </div>
            ) : (

              // 3B: If Logged In -> Show Portal Layout
              <div className="space-y-8">

                {/* User Greeting & Header */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-church-creamDark flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full bg-church-gold/20 flex items-center justify-center text-church-goldDark font-bold text-xl uppercase">
                      {currentUser.name.substring(0, 2)}
                    </div>
                    <div>
                      <h2 className="font-serif text-3xl font-bold text-church-wood">Shalom, {currentUser.name}!</h2>
                      <div className="flex items-center space-x-2 text-sm text-church-charcoal/70">
                        <span className="px-2.5 py-0.5 bg-church-creamDark text-church-wood rounded-full text-xs font-semibold">
                          {currentUser.role}
                        </span>
                        <span>•</span>
                        <span>Welcome back to fellowship.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="flex items-center space-x-1.5 px-4 py-2 border border-church-creamDark text-church-charcoal/80 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left & Middle Column: Welcome Message, Announcements & Chat */}
                  <div className="lg:col-span-2 space-y-8">

                    {/* Welcome Notice Card */}
                    <div className="bg-gradient-to-br from-church-wood to-church-charcoal text-white p-8 rounded-2xl shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-church-gold/15 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="relative z-10 space-y-4">
                        <h3 className="font-serif text-2xl font-bold text-church-goldLight">Ministry Hub Notes</h3>

                        {/* Custom message based on Role */}
                        {currentUser.role === 'Admin' && (
                          <p className="text-sm text-white/95 leading-relaxed">
                            Hello Administrator. You have full system oversight. You can approve or revoke member access, modify user roles, and review gratitude notes.
                          </p>
                        )}
                        {currentUser.role === 'Pastor' && (
                          <p className="text-sm text-white/95 leading-relaxed">
                            Hello Pastor. Welcome back. You have access to thanksgiving RSVP tally sheets, volunteer arrangements, and gratitude notes.
                          </p>
                        )}
                        {currentUser.role === 'Church Leader' && (
                          <p className="text-sm text-white/95 leading-relaxed">
                            Greetings, Church Leader. You can view schedules, join fellowship channels, and share guidelines for ministry work.
                          </p>
                        )}
                        {currentUser.role === 'Youth Leader' && (
                          <p className="text-sm text-white/95 leading-relaxed">
                            Youth Team Leader: Let us continue to guide and mentor our youth with passion. Coordinate bonfire nights and fellowships in the chat channels.
                          </p>
                        )}
                        {currentUser.role === 'Young People' && (
                          <p className="text-sm text-white/95 leading-relaxed">
                            Hey! Glad to have you in the fellowship. Feel free to chat with your friends and join the Youth Activities.
                          </p>
                        )}
                        {currentUser.role === 'Church Member' && (
                          <p className="text-sm text-white/95 leading-relaxed">
                            Dear Church Member: Thank you for being a part of the fellowship. You can upload photo memories to the gallery and participate in fellowship channels.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Announcement Board */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-church-creamDark/80 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-church-creamDark pb-4">
                        <h3 className="font-serif text-2xl font-bold text-church-wood flex items-center space-x-2">
                          <BookOpen className="w-5 h-5 text-church-gold" />
                          <span>Church Announcements</span>
                        </h3>
                        <span className="text-xs uppercase tracking-widest text-church-gold font-bold">Latest Updates</span>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-church-creamDark/20 rounded-xl border-l-4 border-church-gold space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-church-wood">Thanksgiving Choir Signup</h4>
                            <span className="text-xs text-church-charcoal/50">Today</span>
                          </div>
                          <p className="text-xs text-church-charcoal/80">Rehearsals start next Tuesday. Sing or play instruments to glorify God!</p>
                        </div>
                        <div className="p-4 bg-church-creamDark/20 rounded-xl border-l-4 border-church-wood space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-church-wood">Midweek Bible Study Series</h4>
                            <span className="text-xs text-church-charcoal/50">3 days ago</span>
                          </div>
                          <p className="text-xs text-church-charcoal/80">We are diving into the Book of Ephesians. Join online or in the main fellowship hall.</p>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Interactive Chat */}
                    <div className="bg-white rounded-2xl border border-church-creamDark shadow-md flex flex-col h-[500px] overflow-hidden">
                      {/* Chat Header */}
                      <div className="bg-church-creamDark/50 px-6 py-4 border-b border-church-creamDark flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="font-serif font-bold text-church-wood text-lg">{activeChannel}</span>
                        </div>
                        <span className="text-xs text-church-charcoal/60">Active Channel Chat</span>
                      </div>

                      {/* Chat Body Grid */}
                      <div className="flex-grow flex overflow-hidden">
                        {/* Chat Sidebar Channels */}
                        <div className="w-1/3 sm:w-1/4 border-r border-church-creamDark bg-church-bg/30 p-3 space-y-4 overflow-y-auto">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-church-charcoal/50 tracking-widest block px-2 mb-2">Channels</span>
                            {[
                              '#general-fellowship',
                              '#worship-team',
                              '#media-team',
                              '#youth-leaders'
                            ].map((chan) => (
                              <button
                                key={chan}
                                onClick={() => setActiveChannel(chan)}
                                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${activeChannel === chan
                                    ? 'bg-church-wood text-white shadow-sm'
                                    : 'text-church-charcoal hover:bg-church-creamDark'
                                  }`}
                              >
                                {chan}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Chat Message Stream */}
                        <div className="w-2/3 sm:w-3/4 flex flex-col bg-white overflow-hidden">
                          <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {chatMessages
                              .filter(msg => msg.channel === activeChannel)
                              .map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                                  <div className="flex items-center space-x-1.5 mb-1">
                                    <span className="text-[10px] font-bold text-church-wood">{msg.sender}</span>
                                    <span className="text-[8px] bg-church-creamDark px-1.5 py-0.5 rounded text-church-charcoal/70 uppercase scale-90">{msg.senderRole.split(' / ')[0]}</span>
                                    <span className="text-[8px] text-church-charcoal/40">{msg.timestamp}</span>
                                  </div>

                                  {/* Chat bubble - coloring based on sender */}
                                  <div className={`relative group max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ${msg.isSelf
                                      ? 'bg-church-wood text-white rounded-tr-none'
                                      : 'bg-church-creamDark/70 text-church-charcoal rounded-tl-none'
                                    }`}>
                                    <p className="leading-relaxed">{msg.text}</p>

                                    {/* Emojis Reactions list */}
                                    {msg.emojis && msg.emojis.length > 0 && (
                                      <div className="flex items-center space-x-1 mt-1">
                                        {msg.emojis.map((e, i) => (
                                          <span key={i} className="text-xs bg-white/20 px-1 py-0.5 rounded">{e}</span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Quick Hover Reactions */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-church-creamDark shadow-md rounded-full px-2 py-1 flex items-center space-x-1 z-10 ${msg.isSelf ? '-left-20' : '-right-20'
                                      }`}>
                                      {['🙏', '❤️', '🙌'].map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => toggleReaction(msg.id, emoji)}
                                          className="hover:scale-125 transition-transform text-xs"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            <div ref={chatEndRef} />
                          </div>

                          {/* Chat Input Bar */}
                          <form onSubmit={handleSendMessage} className="p-3 border-t border-church-creamDark flex items-center space-x-2 bg-church-creamDark/30">
                            {/* Quick emoji popovers */}
                            <div className="flex items-center space-x-1 border-r border-church-creamDark/60 pr-2">
                              {['🙏', '❤️', '🙌', '✨'].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => addEmoji(emoji)}
                                  className="hover:scale-125 transition-transform text-base p-1"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>

                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder={`Message ${activeChannel}...`}
                              className="flex-grow px-3 py-2 bg-white rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold text-sm"
                            />

                            <button
                              type="submit"
                              className="p-2 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood rounded-lg transition-all"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Ministry Calendar & Admin Controls */}
                  <div className="space-y-8">

                    {/* Admin User Approval and Moderation Panel */}
                    {currentUser.role === 'Admin' && (
                      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-church-wood shadow-md space-y-6">
                        <div className="flex items-center space-x-2 text-church-wood border-b border-church-creamDark pb-4">
                          <Users className="w-6 h-6 text-church-gold" />
                          <h3 className="font-serif text-2xl font-bold">User Moderation</h3>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Pending Approvals ({profilesList.filter(p => !p.approved).length})</h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {profilesList.filter(p => !p.approved).length === 0 ? (
                              <p className="text-xs text-church-charcoal/50 text-center py-2">No pending user registrations.</p>
                            ) : (
                              profilesList.filter(p => !p.approved).map((profile) => (
                                <div key={profile.id} className="bg-church-bg p-3 rounded-lg border border-church-creamDark space-y-2 text-xs">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-bold text-church-wood block">{profile.name}</span>
                                      <span className="text-[10px] text-church-charcoal/50 block">Requested: {profile.role}</span>
                                    </div>
                                    <div className="flex space-x-1.5">
                                      <button
                                        onClick={async () => {
                                          const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
                                          if (error) alert(error.message);
                                          else fetchProfiles();
                                        }}
                                        className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                                        title="Deny / Delete"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const { error } = await supabase.from('profiles').update({ approved: true }).eq('id', profile.id);
                                          if (error) alert(error.message);
                                          else fetchProfiles();
                                        }}
                                        className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded"
                                        title="Approve User"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-church-creamDark">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">All Approved Members ({profilesList.filter(p => p.approved).length})</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {profilesList.filter(p => p.approved).map((profile) => (
                              <div key={profile.id} className="flex justify-between items-center text-xs p-2 bg-church-bg/50 rounded-lg">
                                <div>
                                  <span className="font-semibold text-church-wood block">{profile.name}</span>
                                  <span className="text-[10px] text-church-charcoal/50">{profile.role}</span>
                                </div>
                                {profile.email !== 'admin@pcgami.org' && (
                                  <div className="flex space-x-1 items-center">
                                    <select
                                      value={profile.role}
                                      onChange={async (e) => {
                                        const newRole = e.target.value;
                                        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id);
                                        if (error) alert(error.message);
                                        else fetchProfiles();
                                      }}
                                      className="px-1.5 py-0.5 border border-church-creamDark rounded text-[10px] bg-white text-church-charcoal focus:outline-none"
                                    >
                                      <option value="Admin">Admin</option>
                                      <option value="Pastor">Pastor</option>
                                      <option value="Church Leader">Church Leader</option>
                                      <option value="Youth Leader">Youth Leader</option>
                                      <option value="Church Member">Church Member</option>
                                      <option value="Young People">Young People</option>
                                    </select>
                                    <button
                                      onClick={async () => {
                                        const { error } = await supabase.from('profiles').update({ approved: false }).eq('id', profile.id);
                                        if (error) alert(error.message);
                                        else fetchProfiles();
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                      title="Revoke Access"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Hero Slideshow Management Panel */}
                    {currentUser.role === 'Admin' && (
                      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-church-wood shadow-md space-y-6">
                        <div className="flex items-center space-x-2 text-church-wood border-b border-church-creamDark pb-4">
                          <Upload className="w-6 h-6 text-church-gold" />
                          <h3 className="font-serif text-2xl font-bold">Hero Slideshow</h3>
                        </div>

                        {/* Add new slide form */}
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newHeroUrl.trim()) return;

                            const { error } = await supabase.from('hero_photos').insert([
                              {
                                url: newHeroUrl,
                                caption: newHeroCaption,
                                display_order: newHeroOrder
                              }
                            ]);

                            if (error) {
                              alert(error.message);
                            } else {
                              setNewHeroUrl('');
                              setNewHeroCaption('');
                              setNewHeroOrder(0);
                              fetchHeroPhotos();
                            }
                          }}
                          className="space-y-3"
                        >
                          <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Add New Slide</h4>
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                              value={newHeroUrl}
                              onChange={(e) => setNewHeroUrl(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded border border-church-creamDark focus:outline-none focus:border-church-gold bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Caption"
                              value={newHeroCaption}
                              onChange={(e) => setNewHeroCaption(e.target.value)}
                              className="col-span-2 px-3 py-2 text-xs rounded border border-church-creamDark focus:outline-none focus:border-church-gold bg-white"
                            />
                            <input
                              type="number"
                              placeholder="Order"
                              value={newHeroOrder}
                              onChange={(e) => setNewHeroOrder(parseInt(e.target.value) || 0)}
                              className="px-3 py-2 text-xs rounded border border-church-creamDark focus:outline-none focus:border-church-gold bg-white"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood font-bold rounded text-xs transition-all shadow"
                          >
                            Add Slide Image
                          </button>
                        </form>

                        {/* Current slides list */}
                        <div className="space-y-4 pt-4 border-t border-church-creamDark">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Active Slides ({heroPhotos.length})</h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {heroPhotos.length === 0 ? (
                              <p className="text-xs text-church-charcoal/50 text-center py-2">No custom slideshow images. Falling back to default cover.</p>
                            ) : (
                              heroPhotos.map((photo) => (
                                <div key={photo.id} className="flex items-center space-x-3 p-2 bg-church-bg/50 rounded-lg">
                                  <img
                                    src={photo.url}
                                    alt={photo.caption || 'Slide'}
                                    className="w-12 h-12 object-cover rounded border border-church-creamDark"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800';
                                    }}
                                  />
                                  <div className="flex-grow min-w-0">
                                    <span className="font-semibold text-xs text-church-wood block truncate">{photo.caption || 'No Caption'}</span>
                                    <span className="text-[10px] text-church-charcoal/50 block">Order: {photo.display_order}</span>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      const { error } = await supabase.from('hero_photos').delete().eq('id', photo.id);
                                      if (error) alert(error.message);
                                      else fetchHeroPhotos();
                                    }}
                                    className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                                    title="Delete Slide"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Facilitator Admin Dashboard Button and Tally */}
                    {(currentUser.role === 'Admin' || currentUser.role === 'Pastor') && (
                      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-church-gold shadow-md space-y-6">
                        <div className="flex items-center space-x-2 text-church-wood border-b border-church-creamDark pb-4">
                          <Shield className="w-6 h-6 text-church-gold" />
                          <h3 className="font-serif text-2xl font-bold">Facilitator Dashboard</h3>
                        </div>

                        {/* RSVP Analytics Tally */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Thanksgiving Attendance Tally</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-church-creamDark/40 p-4 rounded-xl text-center">
                              <span className="text-2xl font-bold text-church-wood block">{totalAdults}</span>
                              <span className="text-xs text-church-charcoal/60">Total Adults</span>
                            </div>
                            <div className="bg-church-creamDark/40 p-4 rounded-xl text-center">
                              <span className="text-2xl font-bold text-church-wood block">{totalKids}</span>
                              <span className="text-xs text-church-charcoal/60">Total Children</span>
                            </div>
                          </div>
                        </div>

                        {/* Volunteers List sorted by team */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Volunteers By Team</h4>
                          <div className="max-h-44 overflow-y-auto space-y-2 bg-church-bg p-3 rounded-lg text-xs">
                            {volunteersList.length === 0 ? (
                              <p className="text-church-charcoal/50 text-center">No volunteers registered yet.</p>
                            ) : (
                              volunteersList.map((v, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-church-creamDark pb-1.5 last:border-0 last:pb-0">
                                  <span className="font-semibold text-church-wood">{v.name}</span>
                                  <span className="bg-church-gold/20 text-church-goldDark px-2 py-0.5 rounded text-[10px] font-bold uppercase">{v.team}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Gratitude Notes Moderation queue */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-church-charcoal/70">Gratitude Moderation Queue</h4>
                          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                            {gratitudeNotes.filter(n => !n.approved).length === 0 ? (
                              <p className="text-xs text-church-charcoal/50 text-center py-2">No pending gratitude notes.</p>
                            ) : (
                              gratitudeNotes.filter(n => !n.approved).map((note) => (
                                <div key={note.id} className="bg-church-bg p-3 rounded-lg border border-church-creamDark space-y-2 text-xs">
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-church-wood">{note.author}</span>
                                    <span className="text-[10px] text-church-charcoal/50">{note.timestamp}</span>
                                  </div>
                                  <p className="italic text-church-charcoal/90">"{note.text}"</p>
                                  <div className="flex space-x-2 justify-end">
                                    <button
                                      onClick={() => hideNote(note.id)}
                                      className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                                      title="Reject/Hide"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => approveNote(note.id)}
                                      className="p-1 bg-green-50 text-green-600 hover:bg-green-100 rounded"
                                      title="Approve note"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ministry Schedule & Calendar */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-church-creamDark shadow-sm space-y-6">
                      <h3 className="font-serif text-2xl font-bold text-church-wood flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-church-gold" />
                        <span>Ministry Schedules</span>
                      </h3>

                      <div className="space-y-4">
                        <div className="flex space-x-3 text-sm">
                          <div className="w-10 h-10 bg-church-creamDark/80 rounded-lg flex flex-col items-center justify-center font-bold text-church-wood shrink-0">
                            <span className="text-xs leading-none">12</span>
                            <span className="text-[9px] uppercase tracking-wide">Jul</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-church-wood text-sm">Sunday Worship Service</h4>
                            <p className="text-xs text-church-charcoal/70">Worship, Sermon by Pastor Thomas. Communion service.</p>
                          </div>
                        </div>

                        <div className="flex space-x-3 text-sm">
                          <div className="w-10 h-10 bg-church-creamDark/80 rounded-lg flex flex-col items-center justify-center font-bold text-church-wood shrink-0">
                            <span className="text-xs leading-none">16</span>
                            <span className="text-[9px] uppercase tracking-wide">Jul</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-church-wood text-sm">Youth Leaders Bonfire</h4>
                            <p className="text-xs text-church-charcoal/70">Team gathering and bonfire planning checkup.</p>
                          </div>
                        </div>

                        <div className="flex space-x-3 text-sm">
                          <div className="w-10 h-10 bg-church-creamDark/80 rounded-lg flex flex-col items-center justify-center font-bold text-church-wood shrink-0">
                            <span className="text-xs leading-none">23</span>
                            <span className="text-[9px] uppercase tracking-wide">Jul</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-church-wood text-sm">Media & Audio Calibration</h4>
                            <p className="text-xs text-church-charcoal/70">System testing and setup for winter concert preparations.</p>
                          </div>
                        </div>
                      </div>
                    </div>

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
      {showInvitationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-church-charcoal/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-church-bg max-w-lg w-full max-h-[calc(100vh-2rem)] rounded-2xl shadow-2xl border border-church-gold overflow-hidden flex flex-col">

            {/* Header / Vibe Banner */}
            <div className="bg-church-wood p-8 text-center text-white relative flex-shrink-0">
              <button
                onClick={() => setShowInvitationModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-xs uppercase tracking-widest text-church-gold font-bold">Thanksgiving Celebration Invitation</span>
              <h2 className="font-serif text-3xl font-bold mt-2">Church Thanksgiving Celebration</h2>

              {/* Scripture Intro */}
              <div className="mt-4 border-t border-church-gold/30 pt-4 max-w-sm mx-auto">
                <p className="text-xs italic text-church-goldLight leading-relaxed">
                  "Enter His gates with thanksgiving and His courts with praise; give thanks to Him and praise His name. For the Lord is good..." — Psalm 100:4-5
                </p>
              </div>
            </div>

            {/* RSVP Form Body */}
            <form onSubmit={handleRSVPSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-grow">

              {urlFamilyName && (
                <div className="p-3 bg-church-gold/10 border border-church-gold/30 rounded-xl text-center text-sm font-semibold text-church-wood flex items-center justify-center space-x-2">
                  <span>Welcome, {urlFamilyName}! We are blessed to invite you.</span>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Name / Family Name</label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="e.g. The Jenkins Family"
                  className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-sm"
                />
              </div>

              {/* Headcount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Adults Attendance</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rsvpAdults}
                    onChange={(e) => setRsvpAdults(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Children Attendance</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={rsvpKids}
                    onChange={(e) => setRsvpKids(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white text-sm"
                  />
                </div>
              </div>

              {/* Volunteers checkboxes */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-2">Volunteer Interest Teams</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {['Set-up', 'Welcoming', 'Audio-Visual', 'Clean-up'].map((team) => (
                    <label key={team} className="flex items-start space-x-2.5 p-2.5 bg-white rounded-lg border border-church-creamDark/80 hover:border-church-gold/60 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={rsvpVolunteer.includes(team)}
                        onChange={() => handleVolunteerChange(team)}
                        className="rounded border-church-creamDark text-church-gold focus:ring-church-gold mt-0.5 shrink-0"
                      />
                      <span className="text-church-charcoal leading-snug">{team} Team</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gratitude note */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-church-charcoal/70 font-semibold mb-1">Submit a Gratitude Wall Note</label>
                <textarea
                  value={rsvpNote}
                  onChange={(e) => setRsvpNote(e.target.value)}
                  placeholder="Share a blessing or simple note of thanksgiving... (will go live on the wall upon moderation approval)"
                  className="w-full px-4 py-2 rounded-lg border border-church-creamDark focus:outline-none focus:border-church-gold bg-white h-20 text-sm resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvitationModal(false)}
                  className="flex-1 py-3 border border-church-creamDark text-church-charcoal font-semibold rounded-lg hover:bg-church-creamDark transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-church-wood hover:bg-church-gold text-white hover:text-church-wood font-bold rounded-lg shadow-md transition-all duration-300 cursor-pointer text-sm"
                >
                  Submit RSVP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}
