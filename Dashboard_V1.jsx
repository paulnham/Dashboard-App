import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  CloudSun,
  LayoutDashboard,
  CalendarDays,
  Image as ImageIcon,
  CloudRain,
  Sun,
  Video,
  ArrowRight,
  Wind,
  Droplets,
  SunDim,
  Eye,
  Sunrise,
  Sunset,
  GripHorizontal,
  Maximize,
  Minimize,
  Scaling,
  Upload,
  X,
  LogIn,
  LogOut,
  Loader2,
  Navigation,
  Sparkles,
  Thermometer,
  Cloud,
  Umbrella,
  Waves,
  Tornado,
  Zap,
  Star,
  ListTodo,
  Activity,
  Moon,
  AlignLeft,
  Home,
  Check,
  Target,
  BarChart3,
  Trophy,
  History,
  ShieldCheck,
  Users,
  Lock,
  UserPlus,
  ShieldAlert,
  ShieldHalf
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously,
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, onSnapshot, addDoc, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'personal-dashboard-v3';
const apiKey = ""; 

// --- Constants ---
const INITIAL_WIDGETS = [
  { id: 'clock', type: 'clock', x: 1, y: 1, colSpan: 4, rowSpan: 1 },
  { id: 'weather', type: 'weather', x: 5, y: 1, colSpan: 8, rowSpan: 1 },
  { id: 'habits', type: 'habits', x: 9, y: 2, colSpan: 4, rowSpan: 2 },
  { id: 'calendar', type: 'calendar', x: 1, y: 2, colSpan: 4, rowSpan: 2 },
  { id: 'events', type: 'events', x: 5, y: 2, colSpan: 4, rowSpan: 1 },
  { id: 'todo', type: 'todo', x: 5, y: 3, colSpan: 4, rowSpan: 1 },
];

const MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
];

// --- Helper Functions ---
const getWeatherFromCode = (code) => {
  const mapping = {
    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing Rime Fog', 51: 'Light Drizzle', 53: 'Moderate Drizzle',
    55: 'Dense Drizzle', 61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers', 82: 'Violent Rain Showers', 95: 'Thunderstorm',
    96: 'Thunderstorm with Hail', 99: 'Thunderstorm with Heavy Hail'
  };
  return mapping[code] || 'Unknown Condition';
};

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width; let height = img.height;
        const max = 800; 
        if (width > height) { if (width > max) { height *= max / width; width = max; } }
        else { if (height > max) { width *= max / height; height = max; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const getLocalDateString = (date = new Date()) => {
  return date.toLocaleDateString('sv-SE');
};

const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  const start = new Date(d.setDate(diff));
  start.setHours(0,0,0,0);
  return start;
};

const getCurrentWeekDays = () => {
  const start = getStartOfWeek();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(getLocalDateString(d));
  }
  return days;
};

// --- Functional Sub-Components ---

const LoginView = ({ onLogin, loading, darkMode }) => (
  <div className={`h-screen w-full flex items-center justify-center ${darkMode ? 'bg-[#0a0a0b]' : 'bg-[#f3f4f6]'} p-4 animation-fade-in transition-colors duration-500 font-plus-jakarta`}>
    <div className="bg-white dark:bg-[#1c1c1f] p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 w-full max-w-md text-center transition-colors duration-500">
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 font-extrabold">
        <LayoutDashboard size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Personal Dashboard</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm md:text-base leading-relaxed font-medium font-inter">Sign in to initialize your dashboard sync.</p>
      <button 
        onClick={onLogin}
        disabled={loading}
        className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-50 shadow-sm hover:shadow-md font-inter"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles className="text-white" size={20} />}
        {loading ? "Connecting..." : "Authorize Sync"}
      </button>
    </div>
  </div>
);

const UnauthorizedView = ({ user, onSignOut, darkMode }) => (
  <div className={`h-screen w-full flex items-center justify-center ${darkMode ? 'bg-[#0a0a0b]' : 'bg-[#f3f4f6]'} p-4 animation-fade-in transition-colors duration-500 font-plus-jakarta`}>
    <div className="bg-white dark:bg-[#1c1c1f] p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 w-full max-w-md text-center transition-colors duration-500">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
        <Lock size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Access Requested</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm leading-relaxed font-inter font-medium">
        Hello, <span className="font-bold text-slate-800 dark:text-white">{user?.displayName || 'Friend'}</span>.
      </p>
      <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm leading-relaxed font-medium font-inter">
        Your account status is currently <span className="text-amber-500 uppercase font-black font-plus-jakarta">Pending</span>. Access to the dashboard is restricted until an administrator approves your account.
      </p>
      <div className="flex flex-col gap-3">
        <button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg active:scale-95 font-inter">Check Status</button>
        <button onClick={onSignOut} className="text-slate-400 hover:text-red-500 text-sm font-bold mt-4 font-inter">Sign Out</button>
      </div>
    </div>
  </div>
);

const AdminView = ({ users, onUpdateUserStatus }) => (
  <div className="bg-white dark:bg-[#252529] rounded-[3.5rem] p-8 md:p-12 shadow-sm border border-slate-100 dark:border-white/5 min-h-full font-inter transition-colors duration-500">
    <div className="flex flex-col gap-2 mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-plus-jakarta tracking-tight flex items-center gap-4">
            <ShieldCheck size={32} className="text-blue-600" /> System Registry
        </h2>
        <p className="text-slate-400 dark:text-slate-500 font-medium font-plus-jakarta">Manage user roles and dashboard access levels.</p>
    </div>

    <div className="flex flex-col gap-4">
      {users.map(u => (
        <div key={u.id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group transition-all">
          <div className="flex items-center gap-5 min-w-0 w-full md:w-auto font-plus-jakarta">
             <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1c1c1f] flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/5 shrink-0">
               {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-300" />}
             </div>
             <div className="min-w-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">{u.name || 'Anonymous User'}</h3>
               <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-inter">{u.email || u.id}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
             {[
               { id: 'pending', label: 'Pending', icon: Lock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/10' },
               { id: 'authorized', label: 'Authorized', icon: Check, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/10' },
               { id: 'admin', label: 'Admin', icon: ShieldHalf, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/10' }
             ].map(role => (
               <button 
                 key={role.id}
                 onClick={() => onUpdateUserStatus(u.id, role.id)}
                 className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 
                 ${u.status === role.id 
                    ? `${role.color} ring-2 ring-current` 
                    : 'bg-transparent text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}
               >
                 <role.icon size={12} /> {role.label}
               </button>
             ))}
          </div>
        </div>
      ))}
      {users.length === 0 && <p className="text-slate-300 italic text-center py-10 font-medium font-plus-jakarta">No other users in the registry.</p>}
    </div>
  </div>
);

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="bg-white dark:bg-[#252529] rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-white/5 flex flex-col justify-center gap-4 h-full w-full overflow-hidden transition-colors duration-500">
      <div className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none text-center font-plus-jakarta transition-colors">
        {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s[AP]M/, '')}
      </div>
      <div className="flex items-center justify-center gap-2 font-inter">
        <div className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm font-plus-jakarta">
          {time.toLocaleDateString([], { weekday: 'short' })}
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-xs font-bold tracking-tight">
          {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

const HabitWidget = ({ habits, onToggle, onExpand }) => {
  const currentWeekDays = getCurrentWeekDays();
  const startOfWeek = getStartOfWeek();
  const todayStr = getLocalDateString();
  return (
    <div onClick={onExpand} className="bg-white dark:bg-[#252529] rounded-[2rem] p-7 shadow-sm border border-slate-100 dark:border-white/5 h-full flex flex-col overflow-hidden font-inter transition-colors duration-500 cursor-pointer group">
      <div className="flex items-center justify-between mb-6 font-plus-jakarta">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight"><BarChart3 size={18} className="text-blue-600" /> Habits</h2>
        <ArrowRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-blue-600 transition-colors" />
      </div>
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
        {habits.slice(0, 3).map(habit => {
          const comps = habit.completedDates || [];
          const weeklyCount = comps.filter(d => new Date(d) >= startOfWeek).length;
          const goal = habit.weeklyGoal || 3;
          const progress = Math.min((weeklyCount / goal) * 100, 100);
          return (
            <div key={habit.id} className="flex flex-col gap-3">
              <div className="flex justify-between items-baseline font-plus-jakarta">
                 <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-2 leading-none">{habit.name}</span>
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none">{weeklyCount} / {goal}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <div className="flex justify-between items-center px-0.5">
                 {currentWeekDays.map(day => {
                    const isDone = comps.includes(day);
                    const letter = new Date(day + 'T12:00:00').toLocaleDateString([], { weekday: 'short' })[0];
                    return (
                      <div key={day} onClick={(e) => { e.stopPropagation(); onToggle(habit.id, day); }} className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-[10px] font-black uppercase ${isDone ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-white/10'} ${day === todayStr && !isDone ? 'ring-2 ring-blue-600/30 text-blue-600' : ''}`}>
                        {letter}
                      </div>
                    );
                 })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarWidget = ({ events = [] }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
    const dayEvents = events.filter(e => {
        const d = e.rawDate;
        return d && d.getDate() === i && d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
    });
    const hasEvent = dayEvents.length > 0;

    days.push(
      <button key={i} disabled={!hasEvent} onClick={() => {
        const clicked = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
        setSelectedDayEvents({ date: clicked, items: dayEvents });
      }} className={`aspect-square rounded-full text-xs font-bold transition-all relative ${isToday ? 'bg-blue-600 text-white shadow-lg' : hasEvent ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold' : 'text-slate-400 font-medium'}`}>
        <div className="flex flex-col items-center justify-center w-full h-full relative font-plus-jakarta">
            {/* FIXED: Precision centering for event dot on TOP of number */}
            {hasEvent && (
              <div className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-blue-600'}`} />
            )}
            <span className="mt-1">{i}</span>
        </div>
      </button>
    );
  }
  return (
    <div className="bg-white dark:bg-[#252529] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 h-full relative font-inter transition-colors duration-500">
      <div className="flex justify-between items-center mb-6 font-plus-jakarta">
        <h2 className="text-base font-extrabold">{monthNames[viewDate.getMonth()]}</h2>
        <div className="flex gap-2">
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-inter"><ChevronLeft size={16}/></button>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-inter"><ChevronRight size={16}/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[9px] font-black opacity-30 uppercase tracking-widest font-plus-jakarta">{d}</div>
        ))}
        {days}
      </div>
      {selectedDayEvents && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animation-fade-in font-inter" onClick={() => setSelectedDayEvents(null)}>
          <div className="bg-white dark:bg-[#1c1c1f] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/5" onClick={e=>e.stopPropagation()}>
             <div className="flex justify-between items-center mb-8 font-plus-jakarta">
               <h3 className="text-2xl font-black">{selectedDayEvents.date.toLocaleDateString([], { month: 'long', day: 'numeric' })}</h3>
               <button onClick={() => setSelectedDayEvents(null)}><X size={20} className="text-slate-400"/></button>
             </div>
             <div className="space-y-4 font-plus-jakarta">
                 {selectedDayEvents.items.map(e=>(
                    <div key={e.id} className="p-5 rounded-3xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 font-plus-jakarta font-bold">
                        <p className="text-lg leading-tight mb-2">{e.title}</p>
                        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest font-inter">{e.time}</p>
                    </div>
                 ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TodoList = ({ user, onExpand }) => {
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'todos'), (s) => { if(s.exists()) setTodos(s.data().items || []) });
    return () => unsub();
  }, [user]);
  return (
    <div onClick={onExpand} className="bg-white dark:bg-[#252529] rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-white/5 h-full cursor-pointer overflow-hidden transition-colors duration-500 font-inter">
      <div className="flex items-center justify-between mb-6 font-plus-jakarta">
        <h2 className="text-base font-extrabold">Todo</h2>
        <ArrowRight size={18} className="text-slate-200" />
      </div>
      <div className="space-y-3 font-medium">
        {todos.slice(0, 3).map(t=>(
          <div key={t.id} className="flex gap-3 items-center">
            <div className={`w-4 h-4 rounded border-2 shrink-0 ${t.completed ? 'bg-blue-600 border-blue-600' : 'border-slate-200 dark:border-slate-700'}`} />
            <span className={`text-xs font-bold truncate font-plus-jakarta ${t.completed ? 'opacity-30 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HabitView = ({ user, habits, onToggle, onSyncUpdate }) => {
  const [habitInput, setHabitInput] = useState("");
  const currentWeekDays = getCurrentWeekDays();
  const startOfWeek = getStartOfWeek();
  const today = new Date();
  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const addHabit = async (e) => {
    e.preventDefault();
    if (!habitInput.trim()) return;
    const newHabit = { id: Date.now().toString(), name: habitInput.trim(), completedDates: [], weeklyGoal: 3, createdAt: new Date().toISOString() };
    const updated = [...habits, newHabit];
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'habits'), { items: updated });
    setHabitInput("");
    onSyncUpdate();
  };

  const updateGoal = async (id, newGoal) => {
    const updated = habits.map(h => h.id === id ? { ...h, weeklyGoal: parseInt(newGoal) || 1 } : h);
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'habits'), { items: updated });
    onSyncUpdate();
  };

  return (
    <div className="bg-white dark:bg-[#252529] rounded-[3.5rem] p-12 shadow-sm border border-slate-100 dark:border-white/5 min-h-full font-inter transition-colors duration-500">
      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-12 font-plus-jakarta tracking-tight">Habit Targets</h2>
      <form onSubmit={addHabit} className="flex gap-4 mb-12 max-w-2xl font-inter font-medium">
        <input value={habitInput} onChange={e => setHabitInput(e.target.value)} placeholder="New habit goal..." className="flex-1 bg-slate-50 dark:bg-black/20 text-lg font-medium rounded-[1.5rem] px-8 py-5 outline-none border border-slate-100 dark:border-white/5 transition-all focus:ring-2 focus:ring-blue-500/20 font-plus-jakarta" />
        <button type="submit" className="p-5 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-500 shadow-lg transition-all active:scale-95"><Plus size={24} /></button>
      </form>
      <div className="grid grid-cols-1 gap-6 font-plus-jakarta">
        {habits.map(habit => {
          const comps = habit.completedDates || [];
          const weekCount = comps.filter(d => new Date(d) >= startOfWeek).length;
          const monthCount = comps.filter(d => new Date(d) >= firstMonth).length;
          const lastMonthCount = comps.filter(d => { const dt = new Date(d); return dt >= lastMonthStart && dt <= lastMonthEnd; }).length;
          return (
            <div key={habit.id} className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-start mb-6 font-plus-jakarta">
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white truncate">{habit.name}</h3>
                <div className="flex gap-6 items-center">
                  <div className="text-center font-inter font-bold"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-inter">Weekly</p><p className="text-base font-black text-blue-600 font-plus-jakarta">{weekCount} / {habit.weeklyGoal}</p></div>
                  <div className="text-center font-plus-jakarta font-bold"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-inter font-plus-jakarta">Last Mo.</p><p className="text-base font-black text-slate-400 font-inter font-plus-jakarta">{lastMonthCount}</p></div>
                </div>
              </div>
              <div className="flex gap-2 font-plus-jakarta">
                {currentWeekDays.map(day => (
                  <button key={day} onClick={() => onToggle(habit.id, day)} className={`flex-1 py-4 rounded-2xl transition-all border font-plus-jakarta ${comps.includes(day) ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white dark:bg-[#1c1c1f] border border-slate-100 dark:border-white/5 text-slate-300'}`}>
                    <p className="text-[10px] font-black uppercase mb-1 opacity-60 font-inter font-plus-jakarta">{new Date(day + 'T12:00:00').toLocaleDateString([], { weekday: 'short' })}</p>
                    <p className="text-lg font-bold font-plus-jakarta">{new Date(day + 'T12:00:00').getDate()}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-4 font-inter font-medium">
                 <label className="text-[10px] font-black uppercase text-slate-400 font-inter">Update Target:</label>
                 <input type="number" min="1" max="7" value={habit.weeklyGoal} onChange={e => updateGoal(habit.id, e.target.value)} className="w-16 bg-white dark:bg-black/40 rounded-xl p-2 text-center font-bold text-sm font-inter" />
                 <button onClick={async () => { const up = habits.filter(h => h.id !== habit.id); await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'habits'), { items: up }); onSyncUpdate(); }} className="ml-auto text-red-400 hover:text-red-500 font-bold text-xs transition-colors font-inter">Delete Habit</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TodoView = ({ user, onSyncUpdate }) => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'todos'), (s) => { if(s.exists()) setTodos(s.data().items || []) });
    return () => unsub();
  }, [user]);
  const save = (nt) => { setTodos(nt); setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'todos'), { items: nt }); onSyncUpdate(); };
  return (
    <div className="bg-white dark:bg-[#252529] rounded-[3.5rem] p-12 shadow-sm border border-slate-100 dark:border-white/5 min-h-full transition-colors duration-500 font-inter">
      <h2 className="text-3xl font-extrabold mb-12 font-plus-jakarta tracking-tight font-plus-jakarta">Tasks</h2>
      <form onSubmit={e=>{e.preventDefault(); if(input.trim()) { save([...todos, {id: Date.now(), text: input.trim(), completed: false}]); setInput(""); }}} className="flex gap-4 mb-12 max-w-2xl font-medium">
        <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 bg-slate-50 dark:bg-black/20 p-6 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold font-plus-jakarta" placeholder="New task..." />
        <button type="submit" className="p-6 bg-blue-600 text-white rounded-3xl shadow-lg active:scale-95 font-plus-jakarta"><Plus size={24}/></button>
      </form>
      <div className="space-y-4">
        {todos.map(t=>(
          <div key={t.id} className="p-8 bg-slate-50 dark:bg-black/20 rounded-[2.5rem] flex items-center gap-6 group cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 font-plus-jakarta" onClick={() => save(todos.map(x=>x.id===t.id?{...x, completed:!x.completed}:x))}>
            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-700'}`}>{t.completed && <Check size={20} className="text-white" />}</div>
            <span className={`text-xl font-bold ${t.completed ? 'opacity-30 line-through' : 'text-slate-800 dark:text-slate-100'}`}>{t.text}</span>
            <button onClick={e=>{e.stopPropagation(); save(todos.filter(x=>x.id!==t.id))}} className="ml-auto opacity-0 group-hover:opacity-40 hover:opacity-100 transition-all"><Trash2 size={24}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PhotosView = ({ photos, onAddPhotos, onDeletePhoto }) => (
  <div className="bg-white dark:bg-[#252529] rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/5 min-h-full transition-colors duration-500 font-plus-jakarta">
    <div className="flex justify-between items-center mb-12 transition-colors font-plus-jakarta font-extrabold">
      <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-4 font-plus-jakarta">Library</h2>
      <label className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest cursor-pointer flex items-center gap-2 shadow-lg active:scale-95 transition-all font-plus-jakarta font-extrabold"><Upload size={16} /> Upload<input type="file" multiple accept="image/*" className="hidden" onChange={onAddPhotos} /></label>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 font-plus-jakarta font-extrabold">{photos.map(p => (<div key={p.id} className="aspect-[16/10] rounded-[3rem] overflow-hidden relative group shadow-sm border border-slate-100 dark:border-white/5 transition-all font-plus-jakarta font-extrabold"><img src={p.url} className="w-full h-full object-cover" alt="" /><button onClick={() => onDeletePhoto(p.id)} className="absolute top-6 right-6 p-4 bg-red-500 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-all shadow-xl active:scale-90 font-plus-jakarta font-extrabold"><X size={24} /></button></div>))}</div>
  </div>
);

const WeatherConditionOverlayInternal = ({ condition, darkMode }) => {
  const cond = (condition || '').toLowerCase();
  const isRainy = cond.includes('rain') || cond.includes('drizzle') || cond.includes('showers');
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <style>{`
        @keyframes rainFall { 0% { transform: translateY(-100px) skewX(-15deg); } 100% { transform: translateY(400px) skewX(-15deg); } }
        .rain-streak { position: absolute; width: 1.5px; height: 15px; background: linear-gradient(transparent, rgba(255,255,255,0.4)); animation: rainFall 0.7s linear infinite; }
      `}</style>
      {isRainy && [...Array(30)].map((_, i) => (
        <div key={i} className="rain-streak" style={{ left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%`, animationDelay: `${i * 0.1}s`, opacity: 0.4 }} />
      ))}
    </div>
  );
};

const WidgetWrapper = ({ widget, index, children, onDragStart, onDrop, draggedIndex, onResizeUpdate }) => {
  const [isDraggable, setIsDraggable] = useState(false);
  const handleResizeStart = (e) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const startCols = widget.colSpan;
    const startRows = widget.rowSpan;
    const handleMove = (mv) => {
      const moveX = mv.type.includes('touch') ? mv.touches[0].clientX : mv.clientX;
      const moveY = mv.type.includes('touch') ? mv.touches[0].clientY : mv.clientY;
      const colDelta = Math.round((moveX - startX) / 100);
      const rowDelta = Math.round((moveY - startY) / 148);
      onResizeUpdate(index, Math.max(2, Math.min(13 - widget.x, startCols + colDelta)), Math.max(1, Math.min(8, startRows + rowDelta)));
    };
    const handleStop = () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleStop); };
    window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleStop);
  };
  return (
    <div draggable={isDraggable} onDragStart={onDragStart} onDrop={onDrop} style={{ gridColumn: `${widget.x} / span ${widget.colSpan}`, gridRow: `${widget.y} / span ${widget.rowSpan}` }} className={`h-full relative transition-all duration-500 group ${draggedIndex === index ? 'opacity-40 scale-95' : 'opacity-100'}`}>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all font-plus-jakarta"><div onMouseEnter={() => setIsDraggable(true)} onMouseLeave={() => setIsDraggable(false)} className="p-3 bg-white dark:bg-[#1c1c1f] shadow-xl rounded-full border border-slate-100 dark:border-white/5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-600 transition-colors font-plus-jakarta font-extrabold"><GripHorizontal size={14} /></div></div>
      <div className="h-full w-full">{children}</div>
      <div onMouseDown={handleResizeStart} className="absolute bottom-2 right-2 w-8 h-8 cursor-nwse-resize z-40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-slate-200 hover:text-blue-600 transition-all"><Scaling size={20} /></div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [widgets, setWidgets] = useState(INITIAL_WIDGETS);
  const [photos, setPhotos] = useState(MOCK_PHOTOS.map((url, i) => ({ id: `mock-${i}`, url })));
  const [habits, setHabits] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [weatherImage, setWeatherImage] = useState(null);
  const [isGeneratingWeather, setIsGeneratingWeather] = useState(false);
  const [events, setEvents] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [weather, setWeather] = useState({ temp: '--', condition: 'Syncing...', location: 'Global', wind: '--', humidity: '--', high: '--', low: '--' });
  const gridRef = useRef(null);

  const updateSyncTime = useCallback(() => setLastSync(new Date()), []);

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } 
    catch (err) { console.error(err); } finally { setLoginLoading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedIndex === null || !gridRef.current) return;
    const r = gridRef.current.getBoundingClientRect();
    const x = Math.max(1, Math.min(12, Math.floor((e.clientX - r.left) / (r.width / 12)) + 1));
    const y = Math.max(1, Math.floor((e.clientY - r.top) / 148) + 1);
    const nw = [...widgets];
    nw[draggedIndex] = { ...nw[draggedIndex], x: Math.min(13 - nw[draggedIndex].colSpan, x), y };
    setWidgets(nw);
    setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'layout'), { widgets: nw });
    setDraggedIndex(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); }
      else { await signInAnonymously(auth); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const usersSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'permissions'));
        const noUsersExist = usersSnap.empty;
        const permissionRef = doc(db, 'artifacts', appId, 'public', 'data', 'permissions', u.uid);
        const snap = await getDoc(permissionRef);
        
        if (!snap.exists()) {
          const initialStatus = noUsersExist ? 'admin' : 'pending';
          await setDoc(permissionRef, { 
            id: u.uid, name: u.displayName || 'Friend', email: u.email || 'No email', 
            photoURL: u.photoURL || '', status: initialStatus
          });
        }
        
        const userData = (await getDoc(permissionRef)).data() || { status: 'pending' };
        setIsAdmin(userData.status === 'admin');
        setIsAuthorized(userData.status === 'authorized' || userData.status === 'admin');
      }
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'permissions'), (snap) => {
      const list = []; snap.forEach(d => list.push(d.data())); setAllUsers(list);
    });
    return () => unsub();
  }, [user, isAdmin]);

  const onUpdateUserStatus = async (targetUid, newStatus) => { 
    if (!isAdmin) return; 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'permissions', targetUid), { status: newStatus }); 
  };

  useEffect(() => {
    if (!user || !isAuthorized) return;
    const unsubLayout = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'layout'), (snap) => { if (snap.exists() && snap.data().widgets) { setWidgets(snap.data().widgets); updateSyncTime(); } });
    const unsubPhotos = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'photos'), (snap) => { const dbPhotos = []; snap.forEach(d => dbPhotos.push({ id: d.id, url: d.data().url })); if (dbPhotos.length > 0) { setPhotos(dbPhotos); updateSyncTime(); } });
    const unsubHabits = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'habits'), (snap) => { if (snap.exists()) { setHabits(snap.data().items || []); updateSyncTime(); } });
    return () => { unsubLayout(); unsubPhotos(); unsubHabits(); };
  }, [user, isAuthorized, updateSyncTime]);

  useEffect(() => {
    if (!user || !isAuthorized) return;
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph`);
        const data = await res.json();
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const geoData = await geoRes.json();
        setWeather({ temp: Math.round(data.current.temperature_2m), condition: getWeatherFromCode(data.current.weather_code), location: geoData.address.city || geoData.address.town || 'Area', high: Math.round(data.daily.temperature_2m_max[0]), low: Math.round(data.daily.temperature_2m_min[0]), wind: `${Math.round(data.current.wind_speed_10m)} mph`, humidity: `${data.current.relative_humidity_2m}%` });
        updateSyncTime();
      } catch (err) { console.error(err); }
    };
    if (navigator.geolocation) { navigator.geolocation.getCurrentPosition((pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude), () => fetchWeather(37.7749, -122.4194)); }
    else { fetchWeather(37.7749, -122.4194); }
  }, [user, isAuthorized, updateSyncTime]);

  useEffect(() => {
    if (!user || !isAuthorized || weather.condition === 'Syncing...') return;
    const generateImage = async () => {
      setIsGeneratingWeather(true);
      const prompt = `Wide isometric miniature 3D cartoon of ${weather.location}, landmarks, weather: ${weather.condition}. Soft PBR textures, cinematic lighting. No text.`;
      try {
        const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, { method: 'POST', body: JSON.stringify({ instances: { prompt }, parameters: { sampleCount: 1 } }) }).then(res => res.json());
        if (result.predictions?.[0]) { setWeatherImage(`data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`); updateSyncTime(); }
      } catch (err) { console.error(err); } finally { setIsGeneratingWeather(false); }
    };
    generateImage();
  }, [user, isAuthorized, weather.condition, weather.location, updateSyncTime]);

  useEffect(() => {
    if (!user || !isAuthorized) return;
    const fetchCal = async () => {
      const CAL_ID = '25ce083023bb8a0e753dcd25755783e8813bd65cf3babcefb157cc70bdffa20d@group.calendar.google.com';
      const KEY = 'AIzaSyCVAsb2KfNP_vSXx2iAzJEiJO89Arhs4xQ';
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events?key=${KEY}&timeMin=${new Date().toISOString()}&maxResults=50&singleEvents=true&orderBy=startTime`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const formatted = (data.items || []).map(item => {
          let dateObj = item.start.date ? new Date(...item.start.date.split('-').map((v, i) => i === 1 ? parseInt(v) - 1 : parseInt(v))) : new Date(item.start.dateTime);
          return { id: item.id, title: item.summary || 'Shared Event', time: item.start.date ? 'All Day' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), rawDate: dateObj, location: item.location || '', description: item.description || '' };
        });
        setEvents(formatted); updateSyncTime();
      } catch (err) { console.error(err); }
    };
    fetchCal();
  }, [user, isAuthorized, updateSyncTime]);

  const toggleHabit = async (habitId, dateStr) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const dates = h.completedDates || [];
        const newDates = dates.includes(dateStr) ? dates.filter(d => d !== dateStr) : [...dates, dateStr];
        return { ...h, completedDates: newDates };
      }
      return h;
    });
    setHabits(updated);
    if (user) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'dashboard', 'habits'), { items: updated });
    updateSyncTime();
  };

  if (authLoading) return <div className={`h-screen w-full flex items-center justify-center ${darkMode ? 'bg-[#0a0a0b]' : 'bg-[#f3f4f6]'} transition-colors duration-500 font-inter font-medium`}><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (!user) return <LoginView onLogin={handleGoogleLogin} darkMode={darkMode} loading={loginLoading} />;
  if (!isAuthorized && !isAdmin) return <UnauthorizedView user={user} onSignOut={() => signOut(auth)} darkMode={darkMode} />;

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen w-full ${darkMode ? 'bg-[#0a0a0b]' : 'bg-[#f3f4f6]'} flex overflow-hidden font-inter text-slate-900 transition-colors duration-500`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&family=Inter:wght@300;400;500;700;900&display=swap');
        .font-plus-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .animation-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <nav className={`w-16 md:w-20 shrink-0 bg-white dark:bg-[#1c1c1f] border-r border-slate-200/50 dark:border-white/5 flex flex-col items-center py-8 gap-6 z-50 transition-all duration-500 ${isFullScreen ? '-ml-20' : 'ml-0'}`}>
        <div className="w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200 dark:shadow-blue-900/40 mb-2 transition-all font-plus-jakarta font-extrabold"><Activity size={20} strokeWidth={2.5} /></div>
        {[
          {id: 'dashboard', i: LayoutDashboard}, {id: 'events', i: CalendarDays}, {id: 'todo', i: ListTodo}, {id: 'habits', i: BarChart3}, {id: 'weather', i: CloudSun}, {id: 'photos', i: ImageIcon}
        ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`p-3.5 md:p-4 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-sky-50 dark:bg-[#252529] text-blue-600 dark:text-blue-400 shadow-sm border border-transparent dark:border-white/5 font-plus-jakarta' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}><tab.i size={22} /></button>
        ))}
        
        {isAdmin && (<button onClick={() => setActiveTab('admin')} className={`p-3.5 md:p-4 rounded-xl transition-all duration-300 ${activeTab === 'admin' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 shadow-sm border border-transparent dark:border-white/5' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'}`}><ShieldCheck size={22} /></button>)}
        <button onClick={() => setDarkMode(!darkMode)} className="p-3.5 md:p-4 mt-auto rounded-xl bg-slate-50 dark:bg-[#252529] text-slate-400 hover:text-blue-500 transition-all border border-slate-200 dark:border-white/5 shadow-sm font-plus-jakarta">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
        <div className="mt-2 font-plus-jakarta"><button onClick={() => signOut(auth)} className="p-4 rounded-xl text-slate-300 dark:text-slate-700 hover:text-red-500 transition-colors font-plus-jakarta"><LogOut size={22} /></button></div>
      </nav>
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${isFullScreen ? 'p-10 md:p-14 lg:p-20' : 'p-8 md:p-12 lg:p-16'}`}>
        <header className="mb-12 flex justify-between items-center shrink-0 font-plus-jakarta transition-colors font-extrabold">
          <div className="flex items-center gap-6">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter capitalize transition-colors font-plus-jakarta">{activeTab}</h1>
            <div className="flex gap-2">
              {isFullScreen && activeTab !== 'dashboard' && (<button onClick={() => setActiveTab('dashboard')} className="p-3 bg-blue-600 text-white shadow-lg shadow-blue-500/20 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all active:scale-95 font-plus-jakarta font-extrabold"><Home size={16} /> Dashboard</button>)}
              <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-3 bg-white dark:bg-[#252529] shadow-sm border border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 hover:text-blue-600 transition-all active:scale-90" title={isFullScreen ? "Restore Sidebar" : "Focus Mode"}>{isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right transition-colors font-plus-jakarta"><p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none mb-1 font-plus-jakarta">Last Updated</p><p className="text-sm font-bold text-slate-900 dark:text-slate-100 transition-colors font-plus-jakarta">{lastSync ? lastSync.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--:--'}</p></div>
             {user.photoURL && <img src={user.photoURL} alt="" className="w-12 h-12 rounded-2xl border-4 border-white dark:border-[#252529] shadow-lg transition-colors font-plus-jakarta" />}
          </div>
        </header>
        <div className="flex-1 min-h-0 relative transition-colors duration-500 font-plus-jakarta">
          {activeTab === 'dashboard' ? (
            <div ref={gridRef} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="h-full grid grid-cols-1 md:grid-cols-12 auto-rows-[148px] gap-4 overflow-y-auto animation-fade-in custom-scrollbar pr-4 pb-32">
              {widgets.map((w, i) => (
                <WidgetWrapper key={w.id} widget={w} index={i} draggedIndex={draggedIndex} onDragStart={() => setDraggedIndex(i)} onDrop={handleDrop} onResizeUpdate={(idx, cols, rows) => { const nw = [...widgets]; nw[idx] = { ...nw[idx], colSpan: cols, rowSpan: rows }; setWidgets(nw); }}>
                  {w.type === 'clock' && <ClockWidget />}
                  {w.type === 'weather' && (
                    <div onClick={() => setActiveTab('weather')} className="bg-white dark:bg-[#252529] rounded-[2rem] shadow-sm h-full flex overflow-hidden cursor-pointer group hover:shadow-lg transition-all border border-slate-100 dark:border-white/5 font-inter duration-500 font-plus-jakarta">
                      <div className="w-1/2 md:w-[55%] relative overflow-hidden bg-slate-50 dark:bg-black/40 flex items-center justify-center transition-colors font-plus-jakarta">
                        {weatherImage ? (<div className="absolute inset-0 w-full h-full font-plus-jakarta font-extrabold"><img src={weatherImage} alt="AI Scene" className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-1000" /><WeatherConditionOverlayInternal condition={weather.condition} darkMode={darkMode} /></div>) : (<div className="flex flex-col items-center text-slate-200 dark:text-slate-800 gap-2 transition-colors duration-500 font-plus-jakarta font-extrabold"><Cloud size={40} /></div>)}
                        <div className={`absolute top-0 right-0 h-full w-32 bg-gradient-to-r from-transparent via-${darkMode ? '[#252529]' : 'white'}/40 to-${darkMode ? '[#252529]' : 'white'} pointer-events-none z-20 transition-colors duration-500 font-plus-jakarta`} />
                      </div>
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-[#252529] z-10 relative transition-colors duration-500 overflow-hidden font-plus-jakarta">
                        <div className="flex justify-between items-start font-plus-jakarta">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 leading-none font-plus-jakarta">{weather.condition}</span>
                          <ArrowRight size={20} className="text-slate-200 dark:text-slate-700 group-hover:text-blue-600 transition-colors font-plus-jakarta" />
                        </div>
                        <div className="flex flex-1 items-center gap-3 transition-colors duration-500 font-plus-jakarta font-extrabold">
                          <div className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none">{weather.temp}°</div>
                          <div className="flex flex-col gap-1 font-plus-jakarta">
                            <div className="flex items-center gap-1 font-plus-jakarta font-extrabold"><span className="text-[9px] font-black text-red-500 uppercase leading-none font-plus-jakarta font-extrabold">H</span><span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-none font-plus-jakarta font-extrabold">{weather.high}°</span></div>
                            <div className="flex items-center gap-1 font-plus-jakarta font-extrabold"><span className="text-[9px] font-black text-blue-500 uppercase leading-none font-plus-jakarta font-extrabold">L</span><span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-none font-plus-jakarta font-extrabold">{weather.low}°</span></div>
                          </div>
                        </div>
                        <div className="pb-1 font-plus-jakarta font-extrabold"><div className="flex items-center gap-1.5 min-w-0 font-plus-jakarta font-extrabold"><Navigation size={12} className="text-blue-600 dark:text-blue-400 shrink-0 font-plus-jakarta font-extrabold" /><span className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white truncate leading-none font-plus-jakarta font-extrabold">{weather.location}</span></div></div>
                      </div>
                    </div>
                  )}
                  {w.type === 'calendar' && <CalendarWidget events={events} />}
                  {w.type === 'events' && (
                    <div onClick={() => setActiveTab('events')} className="bg-white dark:bg-[#252529] rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-white/5 h-full flex flex-col cursor-pointer group hover:shadow-xl transition-all font-inter overflow-hidden duration-500">
                      <div className="flex items-center justify-between mb-6 font-plus-jakarta font-extrabold tracking-tight"><h2 className="text-base font-extrabold">Timeline</h2><ArrowRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-blue-600 transition-colors font-plus-jakarta font-extrabold" /></div>
                      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar font-plus-jakarta font-bold">{events.slice(0, 2).map(e => (<div key={e.id} className="flex items-center gap-4"><div className="w-1 h-10 bg-blue-600 rounded-full shrink-0 font-plus-jakarta font-bold" /><div className="min-w-0 flex-1 font-plus-jakarta font-bold"><p className="text-sm text-slate-800 dark:text-slate-200 truncate leading-tight font-plus-jakarta font-bold">{e.title}</p><p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 font-plus-jakarta font-bold">{e.time}</p></div></div>))}</div>
                    </div>
                  )}
                  {w.type === 'todo' && <TodoList user={user} onExpand={() => setActiveTab('todo')} />}
                  {w.type === 'habits' && <HabitWidget habits={habits} onToggle={toggleHabit} onExpand={() => setActiveTab('habits')} />}
                </WidgetWrapper>
              ))}
            </div>
          ) : (
            <div className="h-full animation-fade-in overflow-y-auto pr-4 custom-scrollbar pb-20 font-plus-jakarta font-extrabold transition-colors">
              {activeTab === 'events' && (<div className="bg-white dark:bg-[#252529] rounded-[3.5rem] p-12 shadow-sm border border-slate-100 dark:border-white/5 min-h-full transition-colors duration-500 font-plus-jakarta"><h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-12 tracking-tight">Calendar Stream</h2><div className="flex flex-col gap-6">{events.map(e => (<div key={e.id} className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 dark:bg-white/5 hover:border-blue-100 dark:hover:border-blue-900 transition-all flex flex-col md:flex-row gap-8 items-start group"><div className="w-16 h-16 bg-slate-900 dark:bg-black rounded-3xl flex flex-col items-center justify-center shadow-lg shrink-0 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{e.rawDate?.toLocaleDateString([], { month: 'short' })}</span><span className="text-xl font-black text-white font-plus-jakarta">{e.rawDate?.getDate()}</span></div><div className="flex-1 min-w-0 font-plus-jakarta font-extrabold"><div className="flex flex-col gap-2 font-plus-jakarta font-extrabold"><h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{e.title}</h3><div className="flex flex-wrap gap-4 items-center font-plus-jakarta font-extrabold"><p className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest font-plus-jakarta font-extrabold font-medium"><Clock size={14} className="text-blue-600 font-plus-jakarta font-extrabold" /> {e.time}</p>{e.location && <p className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-2 uppercase text-[10px] tracking-widest font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><MapPin size={14} className="text-red-400" /> {e.location}</p>}</div>{e.description && <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 flex gap-3 items-start font-medium font-inter font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><AlignLeft size={16} className="text-slate-300 shrink-0 mt-1 font-plus-jakarta font-extrabold" /><p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic whitespace-pre-wrap font-medium font-inter font-plus-jakarta font-extrabold">{e.description}</p></div>}</div></div></div>))}{events.length === 0 && <p className="text-slate-400 text-center py-20 font-medium font-plus-jakarta">No events synced for the selected period.</p>}</div></div>)}
              {activeTab === 'todo' && <TodoView user={user} onSyncUpdate={updateSyncTime} />}
              {activeTab === 'habits' && <HabitView user={user} habits={habits} onToggle={toggleHabit} onSyncUpdate={updateSyncTime} />}
              {activeTab === 'admin' && isAdmin && <AdminView users={allUsers} onUpdateUserStatus={onUpdateUserStatus} />}
              {activeTab === 'weather' && (<div className="flex flex-col gap-8 min-h-full font-inter pb-24 transition-colors font-plus-jakarta font-extrabold"><div className="bg-white dark:bg-[#252529] rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden relative min-h-[500px] flex flex-col md:flex-row transition-colors duration-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="w-full md:w-[48%] relative bg-[#f1f5f9] dark:bg-black flex items-center justify-center overflow-hidden border-r border-slate-50 dark:border-white/5 transition-colors duration-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold">{weatherImage ? (<div className="absolute inset-0 w-full h-full font-plus-jakarta font-extrabold"><img src={weatherImage} alt="AI City View" className="w-full h-full object-cover" /><WeatherConditionOverlayInternal condition={weather.condition} darkMode={darkMode} /></div>) : (<div className="flex flex-col items-center text-slate-200 dark:text-slate-800 gap-2 transition-colors duration-500 font-plus-jakarta font-extrabold"><Cloud size={100} /></div>)}<div className={`absolute top-0 right-0 h-full w-48 bg-gradient-to-r from-transparent via-${darkMode ? '[#252529]' : 'white'}/40 to-${darkMode ? '[#252529]' : 'white'} hidden md:block transition-colors duration-500 font-plus-jakarta font-extrabold`} /></div><div className="flex-1 p-8 md:p-14 lg:p-16 flex flex-col justify-between bg-white dark:bg-[#252529] transition-colors duration-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="leading-none transition-colors duration-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><span className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none font-plus-jakarta font-extrabold">{weather.condition}</span></div><div className="flex items-baseline gap-6 transition-colors duration-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="text-[10rem] font-light text-slate-800 dark:text-white tracking-tighter leading-none transition-colors duration-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold">{weather.temp}°</div><div className="flex flex-col gap-2 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 font-black text-xs uppercase leading-none h-7 flex items-center font-plus-jakarta font-extrabold">H: {weather.high}°</div><div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 font-black text-xs uppercase leading-none h-7 flex items-center font-plus-jakarta font-extrabold">L: {weather.low}°</div></div></div><div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-12 border-t border-slate-100 dark:border-white/5 transition-colors duration-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="flex flex-col gap-2 group font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="flex items-center gap-2 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><Droplets size={18} /></div><span className="text-sm font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold">Humidity</span></div><span className="text-3xl font-black text-slate-800 dark:text-white pl-1 leading-none font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold">{weather.humidity}</span></div><div className="flex flex-col gap-2 group font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="flex items-center gap-2 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500 font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold"><Wind size={18} /></div><span className="text-sm font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold">Wind Speed</span></div><span className="text-3xl font-black text-slate-800 dark:text-white pl-1 leading-none font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold">Wind Speed</span></div><span className="text-3xl font-black text-slate-800 dark:text-white pl-1 leading-none font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold">{weather.wind}</span></div></div><div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 leading-none flex items-center gap-3 transition-colors font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-plus-jakarta font-extrabold font-font-family: 'Plus Jakarta Sans', sans-serif; }
              