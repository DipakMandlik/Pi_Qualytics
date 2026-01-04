
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  User, Bell, Settings, LogOut, Menu, X, Database, Globe, Link2, 
  Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Logo } from './components/Logo';
import { ScoreMethodology } from './components/ScoreMethodology';
import { NAVIGATION } from './constants';
import { ViewType } from './types';
import { ExecutiveView } from './views/ExecutiveView';
import { BusinessView } from './views/BusinessView';
import { TechnicalView } from './views/TechnicalView';
import { PlatformDetails } from './views/PlatformDetails';
import { TableAnalysisView } from './views/TableAnalysisView';
import { snowflakeService } from './services/SnowflakeService';

const DateRangePicker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-07');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 hover:border-sky-300 transition-all group"
      >
        <div className="p-1.5 bg-sky-50 rounded-lg text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
          <CalendarIcon size={16} />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Period</span>
          <span className="text-xs font-bold text-slate-700">
            {formatDate(startDate)} — {formatDate(endDate)}
          </span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800">Select Date Range</h4>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={18} /></button>
              <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'].map(range => (
                <button 
                  key={range}
                  className="px-3 py-2 bg-slate-50 hover:bg-sky-50 hover:text-sky-600 rounded-xl text-[10px] font-bold text-slate-500 transition-all text-center"
                >
                  {range}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-3 mt-2 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all text-sm"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.EXECUTIVE);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Poll for connection status
  useEffect(() => {
    const interval = setInterval(() => {
      if (snowflakeService.connectionStatus !== isConnected) {
        setIsConnected(snowflakeService.connectionStatus);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Handle global navigation events
  useEffect(() => {
    const handleNavigate = () => {
      setActiveView(ViewType.PLATFORM);
    };
    const handleNavigateTable = () => {
        setActiveView(ViewType.TABLE_ANALYSIS);
    };
    window.addEventListener('NAVIGATE_TO_PLATFORM', handleNavigate);
    window.addEventListener('NAVIGATE_TO_TABLE_ANALYSIS', handleNavigateTable);
    return () => {
        window.removeEventListener('NAVIGATE_TO_PLATFORM', handleNavigate);
        window.removeEventListener('NAVIGATE_TO_TABLE_ANALYSIS', handleNavigateTable);
    };
  }, []);

  const CurrentView = useMemo(() => {
    switch (activeView) {
      case ViewType.EXECUTIVE: return <ExecutiveView />;
      case ViewType.BUSINESS: return <BusinessView />;
      case ViewType.TECHNICAL: return <TechnicalView />;
      case ViewType.PLATFORM: return <PlatformDetails />;
      case ViewType.TABLE_ANALYSIS: return <TableAnalysisView />;
      default: return <ExecutiveView />;
    }
  }, [activeView]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-24 bg-white border-b border-slate-100 z-50 px-6 flex items-center justify-between shadow-sm">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {NAVIGATION.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeView === item.id 
                  ? 'bg-sky-50 text-sky-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              {item.label}
              {activeView === item.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse ml-1" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Snowflake Connection Indicator / Connect Button */}
          {!isConnected ? (
            <button
              onClick={() => setActiveView(ViewType.PLATFORM)}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-full border border-sky-600 hover:bg-sky-600 transition-all shadow-md shadow-sky-100 animate-in fade-in slide-in-from-right-4"
            >
              <Link2 size={14} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Connect Snowflake</span>
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mr-2 transition-all duration-500 animate-in zoom-in-95">
              <Database size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Snowflake Connected</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}

          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />
          
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-700 group-hover:text-sky-600 transition-colors leading-none">Chetan T</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Enterprise Admin</span>
            </div>
            <div className="w-10 h-10 rounded-xl snowflake-gradient flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform overflow-hidden">
               <img src="https://picsum.photos/seed/snowflake/40/40" alt="avatar" className="opacity-80" />
            </div>
          </div>
          <button 
            className="xl:hidden p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] pt-28 px-6 animate-in fade-in slide-in-from-right duration-300">
           <div className="flex flex-col gap-4">
              {NAVIGATION.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as ViewType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${
                    activeView === item.id 
                      ? 'bg-sky-50 text-sky-600' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <hr className="my-4 border-slate-100" />
              <button className="flex items-center gap-4 p-4 text-slate-500 font-bold">
                <Settings size={20} /> Settings
              </button>
              <button className="flex items-center gap-4 p-4 text-rose-500 font-bold">
                <LogOut size={20} /> Sign Out
              </button>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pt-32 pb-12 px-6 max-w-[1600px] mx-auto w-full">
        {/* View Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              {NAVIGATION.find(n => n.id === activeView)?.label}
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Live</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {activeView === ViewType.EXECUTIVE && "Strategic overview of global DQ metrics and SLA performance."}
              {activeView === ViewType.BUSINESS && "Business impact analysis and domain compliance mapping."}
              {activeView === ViewType.TECHNICAL && "Engineering diagnostics and column-level integrity metrics."}
              {activeView === ViewType.TABLE_ANALYSIS && "In-depth profiling and impact assessment for individual Snowflake tables."}
              {activeView === ViewType.PLATFORM && "System health, connection management, and rule configuration."}
            </p>
          </div>
          
          <DateRangePicker />
        </div>

        {/* Active View Content */}
        {CurrentView}
      </main>

      <ScoreMethodology />

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-100 px-6 text-center text-slate-400 text-xs font-medium bg-white">
        &copy; 2024 πby3 PI_Qualytics. Transforming Enterprises for Future.
        <span className="mx-2 text-slate-200">|</span> 
        Privacy Policy <span className="mx-2 text-slate-200">|</span> Terms of Service
      </footer>
    </div>
  );
};

export default App;
