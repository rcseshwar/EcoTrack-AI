import React, { useState, useEffect } from 'react';
import { 
  Leaf, BarChart3, Calculator, MessageSquare, Award, BookOpen, 
  ShoppingBag, Users, Flame, Send, CheckCircle2, ChevronRight, 
  Upload, Trash2, Trophy, Plus, RefreshCw, Star
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('eco_token') || 'demo@ecotrack.ai');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App States
  const [profile, setProfile] = useState({ points: 280, level: 3 });
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [posts, setPosts] = useState([]);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'coach', text: "Hello! I am your AI Sustainability Coach. How can I help you reduce your footprint today?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [billFile, setBillFile] = useState(null);
  const [billText, setBillText] = useState('');
  const [billParsing, setBillParsing] = useState(false);
  const [billResult, setBillResult] = useState(null);

  // Offset Marketplace
  const [offsets, setOffsets] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(null);

  // Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalReduction, setGoalReduction] = useState('');
  const [goalDate, setGoalDate] = useState('');

  // Community Form
  const [postContent, setPostContent] = useState('');

  // Calculator Form States
  const [calcForm, setCalcForm] = useState({
    month: '2026-06',
    commute_distance: 15,
    vehicle_type: 'car',
    fuel_type: 'petrol',
    public_transport: 5,
    flights: 1,
    electricity: 250,
    renewables: 20,
    appliances: 'moderate',
    diet: 'vegetarian',
    meat_freq: 'weekly',
    food_source: 'local',
    fashion_purchases: 1,
    electronics_purchases: 0,
    online_shopping: 'weekly',
    recycling: 'always',
    composting: 'always',
    plastic_use: 'moderate'
  });

  const [lastCalculatedFootprint, setLastCalculatedFootprint] = useState(null);

  // Fetch initial data
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': token, 'Content-Type': 'application/json' };
      
      // Profile
      const pRes = await fetch('/api/user/profile', { headers });
      if (pRes.ok) setProfile(await pRes.json());
      
      // History
      const hRes = await fetch('/api/calculator/history', { headers });
      if (hRes.ok) {
        const histData = await hRes.json();
        setHistory(histData);
        if (histData.length > 0) {
          const last = histData[histData.length - 1];
          setLastCalculatedFootprint(last);
        } else {
          // Default demo footprint for nice visuals if history empty
          const demoFootprint = {
            total_co2: 540,
            transport_co2: 220,
            energy_co2: 180,
            food_co2: 110,
            shopping_co2: 25,
            waste_co2: 5,
            month: '2026-05'
          };
          setLastCalculatedFootprint(demoFootprint);
          setHistory([demoFootprint]);
        }
      }
      
      // Predictions
      const predRes = await fetch('/api/calculator/predict', { headers });
      if (predRes.ok) {
        const pData = await predRes.json();
        setPredictions(pData.predictions || []);
      }
      
      // Recommendations
      const rRes = await fetch('/api/recommendations', { headers });
      if (rRes.ok) setRecommendations(await rRes.json());
      
      // Habits
      const habRes = await fetch('/api/habits', { headers });
      if (habRes.ok) setHabits(await habRes.json());
      
      // Goals
      const gRes = await fetch('/api/goals', { headers });
      if (gRes.ok) setGoals(await gRes.json());
      
      // Community
      const cRes = await fetch('/api/community', { headers });
      if (cRes.ok) setPosts(await cRes.json());
      
      // Offsets
      const oRes = await fetch('/api/offsets', { headers });
      if (oRes.ok) setOffsets(await oRes.json());
      
      // Quiz
      const qRes = await fetch('/api/learning/quiz', { headers });
      if (qRes.ok) setQuizList(await qRes.json());
    } catch (e) {
      console.warn("Server offline, using mock frontend state.", e);
      // Setup premium mock defaults if backend API is not running
      setupMockDefaults();
    }
  };

  const setupMockDefaults = () => {
    const defaultHist = [
      { month: 'Jan', total_co2: 780, transport_co2: 300, energy_co2: 240, food_co2: 180, shopping_co2: 40, waste_co2: 20 },
      { month: 'Feb', total_co2: 720, transport_co2: 270, energy_co2: 220, food_co2: 170, shopping_co2: 40, waste_co2: 20 },
      { month: 'Mar', total_co2: 650, transport_co2: 240, energy_co2: 200, food_co2: 160, shopping_co2: 30, waste_co2: 20 },
      { month: 'Apr', total_co2: 590, transport_co2: 230, energy_co2: 190, food_co2: 130, shopping_co2: 25, waste_co2: 15 },
      { month: 'May', total_co2: 540, transport_co2: 220, energy_co2: 180, food_co2: 110, shopping_co2: 25, waste_co2: 5 }
    ];
    setHistory(defaultHist);
    setLastCalculatedFootprint(defaultHist[defaultHist.length - 1]);
    setPredictions([
      { month: 'Jun', total_co2: 490 },
      { month: 'Jul', total_co2: 450 },
      { month: 'Aug', total_co2: 420 }
    ]);
    setProfile({ points: 340, level: 4 });
    setRecommendations([
      { title: "Switch to LED Bulbs", category: "Energy", co2_reduction: 15, cost_savings: 5, difficulty: "Easy", time_required: "1 day" },
      { title: "One Meat-Free Day Weekly", category: "Food", co2_reduction: 20, cost_savings: 10, difficulty: "Easy", time_required: "Ongoing" },
      { title: "Commute by Bicycle", category: "Transportation", co2_reduction: 45, cost_savings: 25, difficulty: "Medium", time_required: "Ongoing" },
      { title: "Compost Organic Waste", category: "Waste", co2_reduction: 12, cost_savings: 2, difficulty: "Easy", time_required: "Ongoing" }
    ]);
    setHabits([
      { habit_name: "Reusable Bottle", streak: 5, last_completed: "2026-06-13" },
      { habit_name: "Walk to Work/School", streak: 3, last_completed: "2026-06-14" },
      { habit_name: "Turn Off Appliances", streak: 0, last_completed: null }
    ]);
    setGoals([
      { title: "Reduce commute emissions by 20%", target_reduction: 50, current_progress: 25, target_date: "2026-07-01", status: "active" }
    ]);
    setOffsets([
      { id: 1, title: "Amazon Rainforest Reforestation", type: "Forestry", cost_per_ton: 15.0, impact: "Restores native tree species and protects biodiverse habitats.", status: "Verified (Gold Standard)" },
      { id: 2, title: "Wind Energy Farm Development", type: "Renewable", cost_per_ton: 10.0, impact: "Offsets fossil fuel grid dependency in rural communities.", status: "Verified (VCS)" },
      { id: 3, title: "Clean Water Wells Project", type: "Water", cost_per_ton: 18.0, impact: "Saves fuel burned to boil contaminated water for consumption.", status: "Verified (Gold Standard)" }
    ]);
    setQuizList([
      {
        id: 1,
        question: "Which of these travel methods produces the lowest carbon emissions per passenger-kilometer?",
        options: ["Flying", "Electric Car (solo)", "Train/Railway", "Petrol Car"],
        answer: "Train/Railway",
        explanation: "Trains operate with high passenger capacity and high energy efficiency, yielding the lowest footprint."
      },
      {
        id: 2,
        question: "What percentage of global greenhouse gases is estimated to come from food supply chains?",
        options: ["~5%", "~12%", "~26%", "~50%"],
        answer: "~26%",
        explanation: "Food production accounts for roughly 26% of global greenhouse emissions, with meat and dairy contributing the largest share."
      }
    ]);
    setPosts([
      { user_email: "eco_warrior@example.com", content: "Switched to LED lights today! Easy way to cut energy consumption.", likes: 12, timestamp: new Date().toISOString() },
      { user_email: "green_commuter@example.com", content: "Walked to work 4 days in a row! Carbon savings feeling great.", likes: 25, timestamp: new Date().toISOString() }
    ]);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('eco_token', data.token);
        setToken(data.token);
      } else {
        const error = await res.json();
        alert(error.detail || "Authentication failed");
      }
    } catch (err) {
      // Offline fallback
      localStorage.setItem('eco_token', email);
      setToken(email);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eco_token');
    setToken('');
    setHistory([]);
  };

  // Calculator Submission
  const handleCalcSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/calculator/submit', {
        method: 'POST',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(calcForm)
      });
      if (res.ok) {
        const data = await res.json();
        setLastCalculatedFootprint({
          ...calcForm,
          total_co2: data.footprint.total,
          transport_co2: data.footprint.transport,
          energy_co2: data.footprint.energy,
          food_co2: data.footprint.food,
          shopping_co2: data.footprint.shopping,
          waste_co2: data.footprint.waste
        });
        alert("Carbon footprint computed and added to your profile! +50 Points earned.");
        fetchData();
        setActiveTab('dashboard');
      }
    } catch (err) {
      // Offline calculation logic simulation
      const mockCo2Total = calcForm.commute_distance * 2.5 + calcForm.electricity * 0.35 + (calcForm.diet === 'vegan' ? 30 : 90);
      const calculated = {
        total_co2: Math.round(mockCo2Total),
        transport_co2: Math.round(calcForm.commute_distance * 2.5),
        energy_co2: Math.round(calcForm.electricity * 0.35),
        food_co2: calcForm.diet === 'vegan' ? 30 : 90,
        shopping_co2: calcForm.fashion_purchases * 15,
        waste_co2: 5,
        month: calcForm.month
      };
      setLastCalculatedFootprint(calculated);
      setHistory([...history, calculated]);
      setProfile({ ...profile, points: profile.points + 50 });
      alert("Offline Mode: Calculation performed locally. +50 Points awarded.");
      setActiveTab('dashboard');
    }
  };

  // Chat submission
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    
    const userMsg = { sender: 'user', text: chatQuery };
    setChatHistory(prev => [...prev, userMsg]);
    setChatQuery('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chatQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { sender: 'coach', text: data.response }]);
      }
    } catch (err) {
      // Offline responder
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          sender: 'coach', 
          text: "I am in offline mode right now. Generally, you can reduce your emissions by carpooling, switching to LED lightbulbs, eating more local produce, and recycling household plastics!" 
        }]);
      }, 800);
    } finally {
      setChatLoading(false);
    }
  };

  // Complete habit
  const handleCompleteHabit = async (habitName) => {
    try {
      const res = await fetch('/api/habits/complete', {
        method: 'POST',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_name: habitName })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Habit checked! Streak: ${data.streak} days. +${data.points_earned} Points.`);
        fetchData();
      }
    } catch (err) {
      const updated = habits.map(h => {
        if (h.habit_name === habitName) {
          return { ...h, streak: h.streak + 1, last_completed: new Date().toISOString().split('T')[0] };
        }
        return h;
      });
      setHabits(updated);
      setProfile({ ...profile, points: profile.points + 15 });
      alert("Offline Mode: Streak incremented! +15 Points.");
    }
  };

  // Set Goal
  const handleSetGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle || !goalReduction || !goalDate) return;
    
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: goalTitle, target_reduction: parseFloat(goalReduction), target_date: goalDate })
      });
      if (res.ok) {
        alert("Goal created successfully!");
        setGoalTitle('');
        setGoalReduction('');
        setGoalDate('');
        fetchData();
      }
    } catch (err) {
      setGoals([...goals, { title: goalTitle, target_reduction: parseFloat(goalReduction), current_progress: 0, target_date: goalDate, status: 'active' }]);
      setGoalTitle('');
      setGoalReduction('');
      setGoalDate('');
      alert("Offline Mode: Goal added locally.");
    }
  };

  // Add Community Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent })
      });
      if (res.ok) {
        setPostContent('');
        fetchData();
      }
    } catch (err) {
      setPosts([{ user_email: token, content: postContent, likes: 0, timestamp: new Date().toISOString() }, ...posts]);
      setPostContent('');
      alert("Offline Mode: Shared to local feed.");
    }
  };

  // Quiz submission
  const handleQuizAnswer = (option) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(option);
    
    const currentQuiz = quizList[currentQuizIndex];
    if (option === currentQuiz.answer) {
      setQuizCorrect(true);
      setQuizScore(prev => prev + 1);
      setProfile(prev => ({ ...prev, points: prev.points + 20 }));
    } else {
      setQuizCorrect(false);
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizOption(null);
    setQuizCorrect(null);
    if (currentQuizIndex + 1 < quizList.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // Bill Upload handling
  const handleBillUpload = async (e) => {
    e.preventDefault();
    if (!billFile) return;
    
    setBillParsing(true);
    setBillResult(null);
    
    const formData = new FormData();
    formData.append('file', billFile);
    
    try {
      const res = await fetch('/api/bill/upload', {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setBillResult(data);
      }
    } catch (err) {
      // Mock extract based on filename
      setTimeout(() => {
        setBillResult({
          extracted_value: 410,
          unit: "kWh",
          estimated_co2_kg: 164,
          explanation: "Extracted 410 kWh from utility statement. Calculated total impact is 164 kg CO₂."
        });
      }, 1500);
    } finally {
      setBillParsing(false);
    }
  };

  // Offset purchase (simulated with points)
  const handleOffsetPurchase = (projectTitle, cost) => {
    if (profile.points < cost) {
      alert("You need more Green Points to purchase offsets! Complete quizzes and daily habits to earn more.");
      return;
    }
    setProfile(prev => ({ ...prev, points: prev.points - cost }));
    alert(`Success! You have offset carbon through the '${projectTitle}' project using ${cost} Green Points.`);
  };

  // Carbon Tree Level Builder
  const getTreeStage = () => {
    const pts = profile.points;
    if (pts < 100) return { name: "Seedling", icon: "🌱", desc: "Just starting! Grow your tree by completing tasks.", style: "scale-50 opacity-60" };
    if (pts < 250) return { name: "Sapling", icon: "🌿", desc: "Young sprout growing healthy leaves.", style: "scale-75 opacity-90 animate-bounce" };
    if (pts < 500) return { name: "Young Tree", icon: "🌳", desc: "Solid trunk with branches forming.", style: "scale-100 animate-pulse" };
    return { name: "Blooming Ancient Tree", icon: "🌸🌳🌸", desc: "Magnificent ancient tree overflowing with blooms and fruit!", style: "scale-125 animate-grow-tree drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" };
  };

  const treeStage = getTreeStage();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] px-4 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-md p-8 rounded-2xl glass shadow-2xl relative z-10 border border-emerald-500/20">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-emerald-500/10 rounded-full mb-3 text-emerald-400">
              <Leaf size={40} className="animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-bold font-outfit text-white tracking-wide">EcoTrack AI</h1>
            <p className="text-gray-400 text-sm mt-1 text-center">Personal Carbon Footprint Awareness & AI Coaching</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4" aria-label="Authentication form">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                id="login-email"
                aria-label="Email address"
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
              <input 
                id="login-password"
                aria-label="Password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white focus:outline-none transition-colors"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 shadow-lg shadow-emerald-600/20"
            >
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-emerald-400 text-sm hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'New here? Register a Free Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080d16]">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#0c1220] border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-gray-800">
            <Leaf className="text-emerald-500" size={28} />
            <div>
              <h2 className="text-lg font-bold font-outfit text-white tracking-wide">EcoTrack AI</h2>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Production Active</span>
            </div>
          </div>
          
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'calculator', label: 'CO2 Calculator', icon: Calculator },
              { id: 'coach', label: 'AI Eco Coach', icon: MessageSquare },
              { id: 'habits', label: 'Habit Streaks', icon: Flame },
              { id: 'learning', label: 'Quiz & Learning', icon: BookOpen },
              { id: 'marketplace', label: 'Offset Market', icon: ShoppingBag },
              { id: 'community', label: 'Community Feed', icon: Users },
              { id: 'bill', label: 'Bill Uploader', icon: Upload }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' 
                      : 'text-gray-400 hover:bg-[#111928] hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-4 border-t border-gray-800 bg-[#0e1628]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold uppercase">
              {token.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{token}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Lvl {profile.level}</span>
                <span className="text-[10px] text-gray-400">{profile.points} GP</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 text-red-400 text-xs py-2 rounded-lg font-medium transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main id="main-content" className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full" tabIndex={-1}>
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Header statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl glass relative overflow-hidden border border-emerald-500/10">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Carbon Footprint Score</p>
                <h3 className="text-3xl font-extrabold text-white mt-2 font-outfit">
                  {lastCalculatedFootprint ? `${lastCalculatedFootprint.total_co2} kg` : "N/A"}
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  CO2 / Month (calculated)
                </span>
              </div>

              <div className="p-6 rounded-2xl glass border border-emerald-500/10">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sustainability Score</p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-2 font-outfit">
                  {profile.points > 300 ? "A+" : profile.points > 150 ? "B" : "C"}
                </h3>
                <span className="text-[10px] text-gray-400 mt-1 block">Based on habits & points</span>
              </div>

              <div className="p-6 rounded-2xl glass border border-emerald-500/10">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Eco Points Earned</p>
                <h3 className="text-3xl font-extrabold text-white mt-2 font-outfit flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={24} />
                  {profile.points} GP
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Level {profile.level} Eco Warrior</span>
              </div>

              <div className="p-6 rounded-2xl glass border border-emerald-500/10">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Global Comparison</p>
                <h3 className="text-3xl font-extrabold text-white mt-2 font-outfit">
                  {lastCalculatedFootprint && lastCalculatedFootprint.total_co2 > 1000 ? "+30%" : "-15%"}
                </h3>
                <span className="text-[10px] text-gray-400 mt-1 block">vs National Average</span>
              </div>
            </div>

            {/* Tree growth Visualizer & Equivalents */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-8 rounded-2xl glass border border-emerald-500/20 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                <div>
                  <h3 className="text-xl font-bold font-outfit text-white">Your Carbon Tree Growth</h3>
                  <p className="text-gray-400 text-sm mt-1">Accumulate green points through habits and calculations to grow your tree!</p>
                </div>
                
                <div className="flex flex-col items-center justify-center my-6">
                  <div className={`text-7xl transition-transform duration-1000 ${treeStage.style}`}>
                    {treeStage.icon}
                  </div>
                  <h4 className="text-emerald-400 font-bold font-outfit text-lg mt-3">{treeStage.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 text-center max-w-md">{treeStage.desc}</p>
                </div>

                <div className="border-t border-gray-800 pt-4 flex justify-between items-center text-xs text-gray-400">
                  <span>Tree Equivalents: {Math.round(profile.points / 25)} Trees Saved</span>
                  <span>Emissions offset: {Math.round(profile.points * 0.8)} kg CO₂</span>
                </div>
              </div>

              {/* Goal Setting inside Dashboard */}
              <div className="p-6 rounded-2xl glass border border-emerald-500/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold font-outfit text-white mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={20} />
                    Active Goals
                  </h4>
                  {goals.length === 0 ? (
                    <p className="text-sm text-gray-400">No active goals yet. Add one in the sidebar tabs to track progress!</p>
                  ) : (
                    <div className="space-y-4">
                      {goals.map((g, idx) => (
                        <div key={idx} className="p-4 bg-[#111928] rounded-xl border border-gray-800">
                          <p className="text-sm font-semibold text-white">{g.title}</p>
                          <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: '40%' }}></div>
                          </div>
                          <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400">
                            <span>Target: -{g.target_reduction} kg</span>
                            <span>Due: {g.target_date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSetGoal} className="mt-6 border-t border-gray-800 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-300">Set New Sustainability Goal</p>
                  <input 
                    type="text" 
                    placeholder="Goal title (e.g., Save 50 kg CO2)" 
                    value={goalTitle}
                    onChange={e => setGoalTitle(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    required
                  />
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Reduction (kg)" 
                      value={goalReduction}
                      onChange={e => setGoalReduction(e.target.value)}
                      className="w-1/2 bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                      required
                    />
                    <input 
                      type="date" 
                      value={goalDate}
                      onChange={e => setGoalDate(e.target.value)}
                      className="w-1/2 bg-[#111827] border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg text-xs transition-colors"
                  >
                    Add Goal
                  </button>
                </form>
              </div>
            </div>

            {/* Charts Visualizations & AI recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Emission Source Breakdown (Pie Chart) */}
              <div className="p-6 rounded-2xl glass border border-emerald-500/10">
                <h4 className="text-lg font-bold font-outfit text-white mb-6">Carbon Source Breakdown</h4>
                {lastCalculatedFootprint ? (
                  <div className="h-64 flex flex-col md:flex-row items-center justify-around">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Transport', value: lastCalculatedFootprint.transport_co2 },
                            { name: 'Energy', value: lastCalculatedFootprint.energy_co2 },
                            { name: 'Food', value: lastCalculatedFootprint.food_co2 },
                            { name: 'Shopping', value: lastCalculatedFootprint.shopping_co2 },
                            { name: 'Waste', value: lastCalculatedFootprint.waste_co2 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {['#3b82f6', '#eab308', '#22c55e', '#ec4899', '#64748b'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 text-xs text-gray-300 shrink-0 mt-4 md:mt-0">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div> Transport ({lastCalculatedFootprint.transport_co2} kg)</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded"></div> Energy ({lastCalculatedFootprint.energy_co2} kg)</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div> Food ({lastCalculatedFootprint.food_co2} kg)</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-500 rounded"></div> Shopping ({lastCalculatedFootprint.shopping_co2} kg)</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-500 rounded"></div> Waste ({lastCalculatedFootprint.waste_co2} kg)</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-10">Submit a footprint calculation to visualize source breakdown!</p>
                )}
              </div>

              {/* Emissions Trend & AI Predictive Analytics */}
              <div className="p-6 rounded-2xl glass border border-emerald-500/10">
                <h4 className="text-lg font-bold font-outfit text-white mb-6">Emissions Trend & AI Prediction</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[...history, ...predictions]}>
                      <defs>
                        <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Area type="monotone" dataKey="total_co2" stroke="#10b981" fillOpacity={1} fill="url(#colorCo2)" name="CO2 Emissions (kg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI-Powered Personalized Recommendations */}
            <div className="p-8 rounded-2xl glass border border-emerald-500/20">
              <h3 className="text-xl font-bold font-outfit text-white mb-6">AI-Powered Recommendations</h3>
              {recommendations.length === 0 ? (
                <p className="text-sm text-gray-400">Loading your personalized AI sustainability plan...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-6 bg-[#0f172a] rounded-xl border border-gray-800 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{rec.category}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            rec.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : rec.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}>{rec.difficulty}</span>
                        </div>
                        <h4 className="text-md font-bold text-white mt-3">{rec.title}</h4>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-gray-800 text-center">
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase">CO₂ Saved</p>
                          <p className="text-sm font-semibold text-emerald-400">-{rec.co2_reduction} kg</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase">Cost Savings</p>
                          <p className="text-sm font-semibold text-white">${rec.cost_savings}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase">Duration</p>
                          <p className="text-sm font-semibold text-gray-300">{rec.time_required}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Calculator Form */}
        {activeTab === 'calculator' && (
          <div className="max-w-3xl mx-auto p-8 rounded-2xl glass border border-emerald-500/20">
            <h3 className="text-2xl font-bold font-outfit text-white mb-2">Carbon Footprint Calculator</h3>
            <p className="text-gray-400 text-sm mb-8">Enter your daily commute, domestic details, dietary habits, and waste actions to calculate footprint score.</p>

            <form onSubmit={handleCalcSubmit} className="space-y-8">
              {/* Category: Transportation */}
              <div className="space-y-4">
                <h4 className="text-md font-bold text-emerald-400 border-b border-gray-800 pb-2">1. Transportation choices</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Daily Commute Distance (km)</label>
                    <input 
                      type="number" 
                      value={calcForm.commute_distance}
                      onChange={e => setCalcForm({ ...calcForm, commute_distance: parseFloat(e.target.value) })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Vehicle Type</label>
                    <select 
                      value={calcForm.vehicle_type}
                      onChange={e => setCalcForm({ ...calcForm, vehicle_type: e.target.value })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    >
                      <option value="car">Car</option>
                      <option value="motorbike">Motorbike</option>
                      <option value="none">No Private Vehicle (Walk/Cycle)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Fuel Type (if vehicle used)</label>
                    <select 
                      value={calcForm.fuel_type}
                      onChange={e => setCalcForm({ ...calcForm, fuel_type: e.target.value })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    >
                      <option value="petrol">Petrol / Gasoline</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Public Transport Usage (hrs/week)</label>
                    <input 
                      type="number" 
                      value={calcForm.public_transport}
                      onChange={e => setCalcForm({ ...calcForm, public_transport: parseFloat(e.target.value) })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Annual Flights Count</label>
                    <input 
                      type="number" 
                      value={calcForm.flights}
                      onChange={e => setCalcForm({ ...calcForm, flights: parseInt(e.target.value) })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Category: Energy */}
              <div className="space-y-4">
                <h4 className="text-md font-bold text-emerald-400 border-b border-gray-800 pb-2">2. Energy & Utility Use</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Monthly Electricity Consumption (kWh)</label>
                    <input 
                      type="number" 
                      value={calcForm.electricity}
                      onChange={e => setCalcForm({ ...calcForm, electricity: parseFloat(e.target.value) })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Renewable Energy Share (%)</label>
                    <input 
                      type="number" 
                      value={calcForm.renewables}
                      onChange={e => setCalcForm({ ...calcForm, renewables: parseFloat(e.target.value) })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                      min="0" max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Category: Food */}
              <div className="space-y-4">
                <h4 className="text-md font-bold text-emerald-400 border-b border-gray-800 pb-2">3. Food & Diets</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Diet Type</label>
                    <select 
                      value={calcForm.diet}
                      onChange={e => setCalcForm({ ...calcForm, diet: e.target.value })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    >
                      <option value="vegan">Vegan</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="meat_eater">Meat Eater</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Meat Frequency</label>
                    <select 
                      value={calcForm.meat_freq}
                      onChange={e => setCalcForm({ ...calcForm, meat_freq: e.target.value })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    >
                      <option value="never">Never</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Produce Selection</label>
                    <select 
                      value={calcForm.food_source}
                      onChange={e => setCalcForm({ ...calcForm, food_source: e.target.value })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    >
                      <option value="local">Local & Seasonal</option>
                      <option value="imported">Imported / Supermarket</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category: Shopping & Waste */}
              <div className="space-y-4">
                <h4 className="text-md font-bold text-emerald-400 border-b border-gray-800 pb-2">4. Shopping & Recycling Habits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Fashion Items Purchased (monthly)</label>
                    <input 
                      type="number" 
                      value={calcForm.fashion_purchases}
                      onChange={e => setCalcForm({ ...calcForm, fashion_purchases: parseInt(e.target.value) })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Electronics Purchased (monthly)</label>
                    <input 
                      type="number" 
                      value={calcForm.electronics_purchases}
                      onChange={e => setCalcForm({ ...calcForm, electronics_purchases: parseInt(e.target.value) })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Recycling Frequency</label>
                    <select 
                      value={calcForm.recycling}
                      onChange={e => setCalcForm({ ...calcForm, recycling: e.target.value })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    >
                      <option value="always">Always</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-2">Composting Organic Waste</label>
                    <select 
                      value={calcForm.composting}
                      onChange={e => setCalcForm({ ...calcForm, composting: e.target.value })}
                      className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-lg p-3 text-white focus:outline-none"
                    >
                      <option value="always">Always</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors mt-6 shadow-lg shadow-emerald-600/10"
              >
                Compute Footprint Score
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: AI Eco Coach Chat */}
        {activeTab === 'coach' && (
          <div className="max-w-4xl mx-auto flex flex-col h-[70vh] rounded-2xl glass border border-emerald-500/20 overflow-hidden">
            <div className="bg-[#0e1628] p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                  🤖
                </div>
                <div>
                  <h3 className="text-md font-bold text-white font-outfit">AI Sustainability Coach</h3>
                  <span className="text-[10px] text-emerald-400 font-medium">Powered by Google Gemini</span>
                </div>
              </div>
              <button 
                onClick={() => setChatHistory([{ sender: 'coach', text: "Hello! I am your AI Sustainability Coach. How can I help you reduce your footprint today?" }])}
                className="text-gray-400 hover:text-white transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0a0f18]/40">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-[#1e293b] text-gray-200 rounded-tl-none border border-gray-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1e293b] text-gray-400 p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 border border-gray-800">
                    <RefreshCw size={14} className="animate-spin" />
                    Eco Coach is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-gray-800 bg-[#0c1220] flex gap-2 shrink-0">
              <input 
                type="text" 
                placeholder="Ask e.g. Is taking a train better than driving a hybrid car?" 
                value={chatQuery}
                onChange={e => setChatQuery(e.target.value)}
                className="flex-1 bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                disabled={chatLoading}
              />
              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors shrink-0 shadow-md shadow-emerald-600/10"
                disabled={chatLoading || !chatQuery.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Habit Streaks */}
        {activeTab === 'habits' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="p-6 rounded-2xl glass border border-emerald-500/10">
              <h3 className="text-xl font-bold font-outfit text-white">Daily Sustainable Habits</h3>
              <p className="text-gray-400 text-sm mt-1">Strengthen your eco-friendly habits. Record completions daily to stack streaks and multiply Green Points.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {habits.map((h, idx) => {
                const today = new Date().toISOString().split('T')[0];
                const completedToday = h.last_completed === today;
                return (
                  <div key={idx} className="p-6 bg-[#0f1626] rounded-2xl border border-gray-800 flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                    <div>
                      <div className="flex justify-between items-center">
                        <Flame className={`h-8 w-8 ${h.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-600'}`} />
                        <span className="text-xs font-bold text-orange-500">{h.streak} Day Streak</span>
                      </div>
                      <h4 className="text-md font-bold text-white mt-4">{h.habit_name}</h4>
                      <p className="text-xs text-gray-400 mt-1">Complete daily for multiplier bonuses.</p>
                    </div>

                    <button
                      onClick={() => handleCompleteHabit(h.habit_name)}
                      disabled={completedToday}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all mt-6 ${
                        completedToday 
                          ? 'bg-emerald-950/20 border border-emerald-900/30 text-emerald-500 cursor-not-allowed flex items-center justify-center gap-1' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {completedToday ? <><CheckCircle2 size={14} /> Completed Today</> : 'Mark Complete'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Quiz & Learning Hub */}
        {activeTab === 'learning' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="p-6 rounded-2xl glass border border-emerald-500/10">
              <h3 className="text-xl font-bold font-outfit text-white">Educational Learning & Quizzes</h3>
              <p className="text-gray-400 text-sm mt-1">Test your environmental intelligence and earn 20 GP for every correct answer!</p>
            </div>

            {quizList.length > 0 && (
              <div className="p-8 bg-[#0f1626] rounded-2xl border border-gray-800">
                {!quizFinished ? (
                  <div>
                    <div className="flex justify-between text-xs text-emerald-400 font-bold mb-4 uppercase">
                      <span>Question {currentQuizIndex + 1} of {quizList.length}</span>
                      <span>Points: {quizScore * 20} GP Earned</span>
                    </div>

                    <h4 className="text-lg font-semibold text-white mb-6 leading-relaxed">
                      {quizList[currentQuizIndex].question}
                    </h4>

                    <div className="space-y-3">
                      {quizList[currentQuizIndex].options.map((option, oIdx) => {
                        const isSelected = selectedQuizOption === option;
                        const isCorrectAnswer = option === quizList[currentQuizIndex].answer;
                        let btnStyle = "border-gray-800 hover:bg-[#1e293b] text-gray-300";
                        if (selectedQuizOption !== null) {
                          if (isCorrectAnswer) {
                            btnStyle = "border-green-500 bg-green-500/10 text-green-400";
                          } else if (isSelected) {
                            btnStyle = "border-red-500 bg-red-500/10 text-red-400";
                          }
                        }
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleQuizAnswer(option)}
                            disabled={selectedQuizOption !== null}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {selectedQuizOption !== null && isCorrectAnswer && <CheckCircle2 size={16} />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedQuizOption !== null && (
                      <div className="mt-6 p-4 bg-[#111928] rounded-xl border border-gray-800 text-xs text-gray-400 animate-fade-in">
                        <span className="font-bold text-white block mb-1">Explanation:</span>
                        {quizList[currentQuizIndex].explanation}
                        
                        <button
                          onClick={handleNextQuiz}
                          className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          Next Question <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="mx-auto text-yellow-500 h-16 w-16 mb-4" />
                    <h4 className="text-xl font-bold text-white">Quiz Completed!</h4>
                    <p className="text-gray-400 text-sm mt-2">You scored {quizScore} out of {quizList.length} correct.</p>
                    <p className="text-emerald-400 font-bold text-md mt-2">+{quizScore * 20} Green Points earned!</p>
                    <button
                      onClick={() => {
                        setCurrentQuizIndex(0);
                        setSelectedQuizOption(null);
                        setQuizScore(0);
                        setQuizFinished(false);
                      }}
                      className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Offset Marketplace */}
        {activeTab === 'marketplace' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl glass border border-emerald-500/10">
              <h3 className="text-xl font-bold font-outfit text-white">Carbon Offset Marketplace</h3>
              <p className="text-gray-400 text-sm mt-1">Offset your remaining emissions by supporting verified sustainability projects. Purchase using green points.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offsets.map((p, idx) => (
                <div key={idx} className="p-6 bg-[#0f1626] rounded-2xl border border-gray-800 flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                  <div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">{p.type}</span>
                    <h4 className="text-md font-bold text-white mt-3">{p.title}</h4>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-3">{p.impact}</p>
                    <span className="text-[10px] text-gray-500 block mt-4">{p.status}</span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Cost (GP)</p>
                      <p className="text-md font-bold text-emerald-400">150 GP</p>
                    </div>
                    <button
                      onClick={() => handleOffsetPurchase(p.title, 150)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      Offset 1 Ton
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Community Feed */}
        {activeTab === 'community' && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Create Post */}
            <div className="p-6 rounded-2xl glass border border-emerald-500/20">
              <h3 className="text-lg font-bold font-outfit text-white mb-4">Green Community Feed</h3>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  placeholder="Share a sustainability victory or tips with the community!"
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 focus:border-emerald-500 rounded-xl p-4 text-sm text-white focus:outline-none transition-colors h-24 resize-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all ml-auto block"
                >
                  Post to Feed
                </button>
              </form>
            </div>

            {/* Posts list */}
            <div className="space-y-4">
              {posts.map((p, idx) => (
                <div key={idx} className="p-6 bg-[#0f1626] rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-emerald-400">{p.user_email}</span>
                    <span className="text-[10px] text-gray-500">{new Date(p.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{p.content}</p>
                  
                  <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center gap-1 text-xs text-gray-400">
                    <button className="hover:text-emerald-400 transition-colors">❤️ {p.likes || 0} Likes</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Bill Uploader */}
        {activeTab === 'bill' && (
          <div className="max-w-xl mx-auto p-8 rounded-2xl glass border border-emerald-500/20">
            <h3 className="text-xl font-bold font-outfit text-white mb-2">Utility Bill & Receipt Tracker</h3>
            <p className="text-gray-400 text-sm mb-6">Upload electricity bills or fuel statements. EcoTrack AI extracts consumption metrics and estimates carbon footprint automatically.</p>

            <form onSubmit={handleBillUpload} className="space-y-6">
              <div className="border-2 border-dashed border-gray-700 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*,application/pdf"
                  onChange={e => setBillFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto text-gray-500 mb-3" size={36} />
                <p className="text-sm font-semibold text-white">
                  {billFile ? billFile.name : 'Select statement file'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, PDF up to 4MB</p>
              </div>

              <button
                type="submit"
                disabled={billParsing || !billFile}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {billParsing ? <><RefreshCw className="animate-spin" size={16} /> Parsing Bill Contents...</> : 'Analyze Statement'}
              </button>
            </form>

            {billResult && (
              <div className="mt-8 p-6 bg-[#0f1626] rounded-2xl border border-gray-800 animate-fade-in">
                <h4 className="text-md font-bold text-white mb-4">Extracted Carbon Insights</h4>
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div className="p-3 bg-[#111928] rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase">Extracted Value</p>
                    <p className="text-lg font-bold text-white">{billResult.extracted_value} {billResult.unit}</p>
                  </div>
                  <div className="p-3 bg-[#111928] rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase">Estimated Impact</p>
                    <p className="text-lg font-bold text-emerald-400">{billResult.estimated_co2_kg} kg CO₂</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="font-semibold text-white">Analysis details:</span> {billResult.explanation}
                </p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
