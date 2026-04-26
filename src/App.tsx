import React, { useState } from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import { Dashboard } from './pages/Dashboard';
import { Reports } from './pages/Reports';
import { BudgetPlanner } from './pages/BudgetPlanner';
import { Timeline } from './pages/Timeline';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { BudgetSettings } from './components/BudgetSettings';
import { useExpenses } from './context/ExpenseContext';
import type { Expense } from './types';


type Tab = 'dashboard' | 'expenses' | 'reports' | 'planner' | 'timeline' | 'settings';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [notifications] = useState([
    { id: 1, title: 'Threshold Alert', message: 'Operational Sector "Software" has exceeded 85% capacity.', time: '2h ago', type: 'warning' },
    { id: 2, title: 'System Sync', message: 'All transaction nodes synchronized with central ledger.', time: '5h ago', type: 'success' },
    { id: 3, title: 'Deficit Detected', message: 'Total capital drainage exceeds projected limits.', time: '1d ago', type: 'error' },
  ]);

  const { expenses, settings, updateSettings } = useExpenses();

  React.useEffect(() => {
    if (settings.darkMode !== false) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }, [settings.darkMode]);

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setExpenseToEdit(null);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
    { id: 'expenses',  label: 'Expenses',  iconName: 'payments' },
    { id: 'reports',   label: 'Reports',   iconName: 'insights' },
    { id: 'planner',   label: 'Planner',   iconName: 'account_balance_wallet' },
    { id: 'timeline',  label: 'Timeline',  iconName: 'timeline' },
    { id: 'settings',  label: 'Settings',  iconName: 'settings' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'reports':   return <Reports />;
      case 'expenses':  return <ExpenseList expenses={expenses} onEdit={handleEditExpense} />;
      case 'planner':   return <BudgetPlanner />;
      case 'timeline':  return <Timeline />;
      case 'settings':  return <BudgetSettings />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-on-surface font-body selection:bg-action-neon selection:text-black min-h-screen relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-40"></div>
      
      {/* Sidebar Navigation */}
      <aside className="flex flex-col fixed left-0 top-0 h-full w-64 z-40 px-4 py-8 bg-[#0A0A0A]/90 backdrop-blur-2xl border-r border-white/5 shadow-2xl">
        <div className="mb-12 px-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-action-neon flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_#E4FF6E]">N</div>
            <div>
              <h1 className="text-lg font-black text-white tracking-[0.1em] uppercase font-label leading-none">NEON NOIR</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1 h-1 rounded-full bg-action-neon animate-pulse"></div>
                <p className="text-[8px] text-text-muted tracking-[0.3em] uppercase font-black">SYS.SECURE.LINK</p>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all relative group overflow-hidden ${
                activeTab === item.id 
                  ? 'text-white' 
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              {activeTab === item.id && (
                <>
                  <div className="absolute left-0 top-0 w-1 h-full bg-action-neon shadow-[0_0_15px_#E4FF6E]"></div>
                  <div className="absolute inset-0 bg-white/[0.03] pointer-events-none"></div>
                </>
              )}
              <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-action-neon text-glow-neon' : ''}`}>{item.iconName}</span>
              <span className={`font-black text-[10px] uppercase tracking-[0.2em] ${activeTab === item.id ? 'text-white' : ''}`}>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto p-4 bg-white/[0.02] rounded-2xl border border-white/5 relative overflow-hidden group hover:border-action-neon/30 transition-all">
          <div className="scanline opacity-20"></div>
          <button 
            onClick={() => { setExpenseToEdit(null); setIsModalOpen(true); }}
            className="w-full flex items-center justify-between"
          >
            <div>
              <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] text-left mb-1">DATA UPLOAD</p>
              <p className="text-xs font-black text-white uppercase tracking-tighter">NEW TRANSACTION</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-action-neon flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl font-black">add</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 min-h-screen flex flex-col relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center h-20 px-10 sticky top-0 z-30 bg-[#0A0A0A]/60 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-[8px] text-text-muted font-black uppercase tracking-[0.4em] mb-1">OPERATIONAL_VIEW</span>
              <span className="text-xl font-black text-white font-h1 uppercase tracking-tight shadow-neon">{activeTab}</span>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-action-neon transition-colors text-lg">search</span>
              <input 
                className="bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-6 py-2.5 text-[10px] w-72 focus:ring-1 focus:ring-action-neon/30 focus:border-action-neon/20 transition-all text-white placeholder-neutral-700 uppercase font-black tracking-widest" 
                placeholder="GLOBAL INTEL SCAN..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative w-10 h-10 rounded-xl bg-white/[0.03] border flex items-center justify-center transition-all ${isNotificationsOpen ? 'border-action-neon text-action-neon shadow-neon' : 'border-white/5 text-neutral-500 hover:text-white hover:border-white/10'}`}
                >
                  <span className="material-symbols-outlined text-xl">notifications</span>
                  {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#0A0A0A] animate-pulse"></span>}
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-4 w-80 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Intel Notifications</span>
                      <button onClick={() => setIsNotificationsOpen(false)} className="text-neutral-500 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <div className="flex items-center gap-3 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-orange-500' : 'bg-action-neon'}`}></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-tight">{n.title}</span>
                            <span className="ml-auto text-[8px] text-text-muted uppercase font-black">{n.time}</span>
                          </div>
                          <p className="text-[10px] text-text-muted leading-relaxed group-hover:text-neutral-300 transition-colors">{n.message}</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 bg-white/[0.02] text-[8px] font-black text-text-muted uppercase tracking-[0.3em] hover:text-action-neon transition-colors">Clear All Protocols</button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`w-10 h-10 rounded-xl bg-white/[0.03] border flex items-center justify-center transition-all ${isSettingsOpen ? 'border-action-neon text-action-neon shadow-neon' : 'border-white/5 text-neutral-500 hover:text-white hover:border-white/10'}`}
                >
                  <span className="material-symbols-outlined text-xl">settings</span>
                </button>

                {isSettingsOpen && (
                  <div className="absolute right-0 mt-4 w-72 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">System Preferences</span>
                      <span className="text-[8px] text-action-neon font-black tracking-widest">v2.4.0-STABLE</span>
                    </div>
                    <div className="p-5 space-y-6">
                      {/* Currency Protocol */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-sm text-text-muted">currency_exchange</span>
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Currency Protocol</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                          <button 
                            onClick={() => { updateSettings({ currency: '₹' }); setIsSettingsOpen(false); }}
                            className={`py-2 rounded-lg text-[10px] font-black transition-all ${settings.currency === '₹' ? 'bg-action-neon text-black shadow-neon' : 'text-neutral-500 hover:text-white'}`}
                          >
                            INR (₹)
                          </button>
                          <button 
                            onClick={() => { updateSettings({ currency: '$' }); setIsSettingsOpen(false); }}
                            className={`py-2 rounded-lg text-[10px] font-black transition-all ${settings.currency === '$' ? 'bg-action-neon text-black shadow-neon' : 'text-neutral-500 hover:text-white'}`}
                          >
                            USD ($)
                          </button>
                        </div>
                      </div>

                      {/* Security Protocol */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Dark Mode</span>
                            <span className="text-[7px] text-text-muted uppercase font-black">Force Neon Aesthetics</span>
                          </div>
                          <button 
                            onClick={() => updateSettings({ darkMode: settings.darkMode === false ? true : false })}
                            className={`w-8 h-4 rounded-full relative transition-colors ${settings.darkMode !== false ? 'bg-action-neon' : 'bg-neutral-600'}`}
                          >
                            <div className={`absolute top-0.5 w-3 h-3 bg-black rounded-full shadow-lg transition-all ${settings.darkMode !== false ? 'right-0.5' : 'left-0.5 bg-white'}`}></div>
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">AI Prediction</span>
                            <span className="text-[7px] text-text-muted uppercase font-black">Neural Burn Forecasting</span>
                          </div>
                          <div className="w-8 h-4 bg-action-neon rounded-full relative animate-pulse"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-black rounded-full shadow-lg"></div></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white/[0.01] border-t border-white/5">
                      <button className="w-full py-3 bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">terminal</span>
                        Decommission System
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pl-8 border-l border-white/5">
              <div className="text-right">
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">OPERATOR_FELIX</p>
                <p className="text-[8px] text-action-neon font-black uppercase tracking-widest">LVL_4_SECURE</p>
              </div>
              <div className="h-11 w-11 rounded-xl overflow-hidden border-2 border-action-neon/20 shadow-lg">
                <img 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* Modal for adding/editing expense */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300 cursor-pointer"
          onClick={handleCloseModal}
        >
          <div 
            className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl p-1 inner-glow overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-action-neon/5 blur-3xl -mr-16 -mt-16"></div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase font-label">
                  {expenseToEdit ? 'Secure Update' : 'New Transaction'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-1 text-text-muted hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <ExpenseForm expenseToEdit={expenseToEdit} onSuccess={handleCloseModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}

export default App;
