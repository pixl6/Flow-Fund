import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { type TimelineEvent, type TimelineEventType } from '../types';
import { NeonCard, NeonButton } from '../components/ui';
import { getCategoryColor } from '../utils/colors';
import dayjs from 'dayjs';

// ─── Event type config ───────────────────────────────────────────────────────

const EVENT_TYPES: Record<TimelineEventType, { label: string; icon: string; color: string }> = {
  expense:   { label: 'Expense',   icon: 'payments', color: '#E4FF6E' },
  income:    { label: 'Income',    icon: 'trending_up', color: '#22C55E' },
  note:      { label: 'Note',      icon: 'description', color: '#C4B5FD' },
  milestone: { label: 'Milestone', icon: 'military_tech', color: '#FCD34D' },
  reminder:  { label: 'Reminder',  icon: 'notification_important', color: '#FB923C' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// const formatDate = (d: string) => dayjs(d).format('ddd, D MMM YYYY');
const today      = () => dayjs().format('YYYY-MM-DD');

// ─── Add / Edit Event Modal ───────────────────────────────────────────────────

interface EventFormProps {
  initial?: TimelineEvent;
  categories: string[];
  currency: string;
  onSave: (data: Omit<TimelineEvent, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const QUICK_COLORS = ['#E4FF6E','#C4B5FD','#22D3EE','#F472B6','#FB923C','#FCD34D','#22C55E','#14B8A6','#06B6D4','#3B82F6'];

const EventForm: React.FC<EventFormProps> = ({ initial, categories, currency, onSave, onClose }) => {
  const [type, setType]         = useState<TimelineEventType>(initial?.type ?? 'note');
  const [title, setTitle]       = useState(initial?.title ?? '');
  const [desc, setDesc]         = useState(initial?.description ?? '');
  const [amount, setAmount]     = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? '');
  const [date, setDate]         = useState(initial?.date ?? today());
  const [color, setColor]       = useState(initial?.color ?? QUICK_COLORS[0]);
  const [pinned, setPinned]     = useState(initial?.pinned ?? false);

  const needsAmount = type === 'expense' || type === 'income';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      type, title: title.trim(), description: desc.trim() || undefined,
      amount: needsAmount && amount ? parseFloat(amount) : undefined,
      category: needsAmount ? category : undefined,
      date, color, pinned,
    });
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 outline-none focus:ring-1 focus:ring-action-neon/50 transition-all font-body";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-microcopy font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Event Classification</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EVENT_TYPES) as TimelineEventType[]).map(t => (
            <button
              key={t} type="button"
              onClick={() => setType(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-microcopy font-black uppercase tracking-widest border transition-all ${
                type === t
                  ? 'border-transparent text-black'
                  : 'border-white/10 text-text-muted hover:text-white hover:bg-white/5'
              }`}
              style={type === t ? { backgroundColor: EVENT_TYPES[t].color, boxShadow: `0 0 15px ${EVENT_TYPES[t].color}55` } : {}}
            >
              <span className="material-symbols-outlined text-sm">{EVENT_TYPES[t].icon}</span> {EVENT_TYPES[t].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-microcopy font-black text-text-muted uppercase tracking-widest mb-1.5 ml-1">Mission Title</label>
        <input
          required value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Intelligence identifier..."
          className={inputClasses}
        />
      </div>

      {needsAmount && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-microcopy font-black text-text-muted uppercase tracking-widest mb-1.5 ml-1">Value</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">{currency}</span>
              <input
                type="number" min="0" step="0.01" value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${inputClasses} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className="text-microcopy font-black text-text-muted uppercase tracking-widest mb-1.5 ml-1">Sector</label>
            <select
              value={category} onChange={e => setCategory(e.target.value)}
              className={inputClasses}
            >
              {categories.map(c => <option key={c} value={c} className="bg-[#242424]">{c}</option>)}
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="text-microcopy font-black text-text-muted uppercase tracking-widest mb-1.5 ml-1">Timestamp</label>
        <input
          type="date" value={date} onChange={e => setDate(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label className="text-microcopy font-black text-text-muted uppercase tracking-widest mb-1.5 ml-1">Intelligence Notes</label>
        <textarea
          value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Detailed observations..."
          rows={3}
          className={`${inputClasses} resize-none`}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-microcopy font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Signal Color</label>
          <div className="flex gap-2 flex-wrap">
            {QUICK_COLORS.map(c => (
              <button
                key={c} type="button"
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-lg border-2 transition-all hover:scale-110"
                style={{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent', boxShadow: color === c ? `0 0 12px ${c}` : 'none' }}
              />
            ))}
          </div>
        </div>
        <button
          type="button" onClick={() => setPinned(p => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-microcopy font-black uppercase tracking-widest border transition-all ${
            pinned ? 'bg-action-neon/20 border-action-neon/40 text-action-neon' : 'border-white/10 text-text-muted hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{pinned ? 'push_pin' : 'push_pin_slash'}</span> {pinned ? 'PRIORITY' : 'LOW PRIORITY'}
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <NeonButton type="submit" className="flex-1 uppercase font-black tracking-widest">
          {initial ? 'UPDATE PROTOCOL' : 'INITIALIZE MISSION'}
        </NeonButton>
        <button type="button" onClick={onClose} className="px-6 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </form>
  );
};

// ─── Single timeline event card ───────────────────────────────────────────────

const EventCard: React.FC<{
  event: TimelineEvent;
  currency: string;
  categories: string[];
  isLast: boolean;
}> = ({ event, currency, categories, isLast }) => {
  const { deleteTimelineEvent, updateTimelineEvent, togglePinEvent } = useExpenses();
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cfg = EVENT_TYPES[event.type];

  const handleSave = (data: Omit<TimelineEvent, 'id' | 'createdAt'>) => {
    updateTimelineEvent(event.id, data);
    setEditing(false);
  };

  return (
    <div className="relative flex gap-6 group">
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
      )}

      <div className="relative shrink-0 z-10 pt-1">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 transition-all duration-500 group-hover:border-white/30"
          style={{ backgroundColor: event.color + '15', boxShadow: `0 0 15px ${event.color}33` }}
        >
          <span className="material-symbols-outlined" style={{ color: event.color }}>{cfg.icon}</span>
        </div>
        {event.pinned && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-action-neon flex items-center justify-center border-2 border-black">
            <span className="material-symbols-outlined text-[10px] text-black font-black">push_pin</span>
          </div>
        )}
      </div>

      <div className="flex-1 mb-8">
        {editing ? (
          <NeonCard className="inner-glow">
            <EventForm
              initial={event}
              categories={categories}
              currency={currency}
              onSave={handleSave}
              onClose={() => setEditing(false)}
            />
          </NeonCard>
        ) : (
          <div
            className="bg-white/5 rounded-2xl p-5 border border-transparent hover:border-white/10 transition-all duration-500 group/card inner-glow cursor-pointer"
            style={{ borderLeftWidth: 4, borderLeftColor: event.color }}
            onClick={() => setExpanded(e => !e)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                  <span
                    className="text-microcopy font-black px-2 py-0.5 rounded uppercase tracking-widest"
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                  >
                    {cfg.label}
                  </span>
                  {event.category && (
                    <span className="text-microcopy text-text-muted font-black uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded">
                      {event.category}
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">{event.title}</h4>
                {event.amount != null && (
                  <p className="text-2xl font-black mt-1" style={{ color: event.type === 'income' ? '#22C55E' : '#FFFFFF' }}>
                    {event.type === 'income' ? '+' : '-'}{currency}{event.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                <button
                  onClick={e => { e.stopPropagation(); togglePinEvent(event.id); }}
                  className={`p-2 rounded-xl transition-all ${event.pinned ? 'bg-action-neon text-black' : 'bg-white/5 text-neutral-500 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-sm">push_pin</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setEditing(true); setExpanded(false); }}
                  className="p-2 rounded-xl bg-white/5 text-neutral-500 hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteTimelineEvent(event.id); }}
                  className="p-2 rounded-xl bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>

            {expanded && event.description && (
              <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-text-muted leading-relaxed font-body italic">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Date group header ────────────────────────────────────────────────────────

const DateHeader: React.FC<{ date: string }> = ({ date }) => {
  const isToday    = dayjs(date).isSame(dayjs(), 'day');
  const isYesterday= dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
  const label = isToday ? 'Current Cycle' : isYesterday ? 'Previous Cycle' : dayjs(date).format('MMM DD, YYYY');
  
  return (
    <div className="flex items-center gap-4 my-6 sticky top-0 z-10 py-2">
      <div className="flex items-center gap-2 bg-black border border-white/10 px-4 py-2 rounded-xl shadow-2xl">
        <span className="material-symbols-outlined text-sm text-action-neon">event</span>
        <span className={`text-microcopy font-black uppercase tracking-[0.2em] ${isToday ? 'text-action-neon' : 'text-text-muted'}`}>{label}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
};

// ─── Stats bar ────────────────────────────────────────────────────────────────

const StatsBar: React.FC<{ events: TimelineEvent[]; currency: string }> = ({ events, currency }) => {
  const totalExpenses = events.filter(e => e.type === 'expense').reduce((s, e) => s + (e.amount ?? 0), 0);
  const totalIncome   = events.filter(e => e.type === 'income').reduce((s, e) => s + (e.amount ?? 0), 0);
  const milestones    = events.filter(e => e.type === 'milestone').length;
  const pinned        = events.filter(e => e.pinned).length;

  const stats = [
    { label: 'CASH DRAIN', value: `${currency}${totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: '#FFFFFF', icon: 'trending_down' },
    { label: 'CASH INFUSION', value: `${currency}${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: '#22C55E', icon: 'trending_up' },
    { label: 'ACHIEVEMENTS', value: milestones.toString(), color: '#FCD34D', icon: 'military_tech' },
    { label: 'PRIORITIES', value: pinned.toString(), color: '#C4B5FD', icon: 'push_pin' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-white/5 border border-white/10 p-4 rounded-2xl inner-glow group hover:bg-white/[0.08] transition-all cursor-default">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5 group-hover:border-white/20 transition-all"
              style={{ color: s.color }}>
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
            </div>
            <span className="text-[10px] text-text-muted font-black tracking-widest uppercase">{s.label}</span>
          </div>
          <p className="text-2xl font-black text-white leading-none tracking-tight">{s.value}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main Timeline Page ────────────────────────────────────────────────────────

export const Timeline: React.FC = () => {
  const { timelineEvents, expenses, settings, addTimelineEvent } = useExpenses();
  const [showForm, setShowForm]       = useState(false);
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState<TimelineEventType | 'all'>('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const allEvents = useMemo(() => {
    const expenseEvents: TimelineEvent[] = expenses.map(exp => ({
      id:          `exp_${exp.id}`,
      type:        'expense' as TimelineEventType,
      title:       exp.description || exp.category,
      description: `Auto-logged from transactions. Category: ${exp.category}`,
      amount:      exp.amount,
      category:    exp.category,
      date:        exp.date,
      color:       getCategoryColor(exp.category),
      pinned:      false,
      createdAt:   exp.createdAt,
    }));

    return [...timelineEvents, ...expenseEvents].sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [timelineEvents, expenses]);

  const filtered = useMemo(() => {
    return allEvents.filter(e => {
      if (filterType !== 'all' && e.type !== filterType) return false;
      if (showPinnedOnly && !e.pinned) return false;
      if (search) {
        const q = search.toLowerCase();
        return e.title.toLowerCase().includes(q)
          || (e.description ?? '').toLowerCase().includes(q)
          || (e.category ?? '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [allEvents, filterType, showPinnedOnly, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    filtered.forEach(e => {
      const grp = map.get(e.date) ?? [];
      grp.push(e);
      map.set(e.date, grp);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  useEffect(() => {
    if (showForm) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showForm]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-black border border-data-lavender/20 flex items-center justify-center shadow-lg shrink-0 inner-glow">
            <span className="material-symbols-outlined text-data-lavender text-3xl">history</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase font-h1 tracking-tight">Intelligence Log</h2>
            <p className="text-microcopy text-text-muted uppercase tracking-widest mt-1">Chronological event sequencing and mission monitoring</p>
          </div>
        </div>
        <NeonButton
          className="flex items-center gap-2 !px-6 !py-3 uppercase font-black tracking-widest"
          onClick={() => setShowForm(f => !f)}
        >
          <span className="material-symbols-outlined text-base">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'ABORT' : 'NEW SIGNAL'}
        </NeonButton>
      </div>

      {/* Stats */}
      <StatsBar events={allEvents} currency={settings.currency} />

      {/* Add event form */}
      {showForm && (
        <div ref={formRef} className="animate-in slide-in-from-top-4 duration-500">
          <NeonCard className="inner-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-action-neon/5 blur-[80px] pointer-events-none" />
            <h3 className="text-microcopy font-black text-action-neon uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">sensors</span> INITIALIZE NEW TIMELINE SIGNAL
            </h3>
            <EventForm
              categories={settings.categories}
              currency={settings.currency}
              onSave={data => { addTimelineEvent(data); setShowForm(false); }}
              onClose={() => setShowForm(false)}
            />
          </NeonCard>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl inner-glow flex flex-wrap gap-6 items-center">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px] bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 group focus-within:border-action-neon/30 transition-all">
          <span className="material-symbols-outlined text-neutral-500 group-focus-within:text-action-neon transition-colors">search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="FILTER BY INTEL STRING..."
            className="flex-1 bg-transparent text-white text-xs font-black uppercase tracking-widest outline-none placeholder-neutral-700"
          />
          {search && <button onClick={() => setSearch('')}><span className="material-symbols-outlined text-sm text-neutral-500 hover:text-white">close</span></button>}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-microcopy text-neutral-600 font-black uppercase tracking-tighter mr-2">PROTOCOL:</span>
          {(['all', ...Object.keys(EVENT_TYPES)] as (TimelineEventType | 'all')[]).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-microcopy font-black uppercase tracking-widest border transition-all ${
                filterType === t
                  ? 'border-transparent text-black'
                  : 'border-white/5 text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
              style={filterType === t ? {
                backgroundColor: t === 'all' ? '#FFFFFF' : EVENT_TYPES[t as TimelineEventType].color,
                boxShadow: `0 0 10px ${t === 'all' ? '#FFFFFF' : EVENT_TYPES[t as TimelineEventType].color}44`,
              } : {}}
            >
              {t === 'all' ? 'FULL LOG' : EVENT_TYPES[t as TimelineEventType].label}
            </button>
          ))}
        </div>

        {/* Pinned toggle */}
        <button
          onClick={() => setShowPinnedOnly(p => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-microcopy font-black uppercase tracking-widest border transition-all ${
            showPinnedOnly
              ? 'bg-action-neon text-black border-transparent'
              : 'border-white/5 text-neutral-500 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">push_pin</span> PRIORITIES
        </button>
      </div>

      {/* Timeline feed */}
      <div className="relative">
        {grouped.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-neutral-700">query_stats</span>
            </div>
            <p className="text-microcopy text-text-muted font-black uppercase tracking-[0.2em]">NO INTELLIGENCE DETECTED</p>
            <p className="text-microcopy text-neutral-600 uppercase tracking-widest mt-2 max-w-xs mx-auto">
              {search || filterType !== 'all' || showPinnedOnly
                ? 'ADJUST FILTER PARAMETERS TO LOCATE DATA'
                : 'INITIALIZE YOUR FIRST MISSION SIGNAL TO POPULATE THE LOG'}
            </p>
          </div>
        ) : (
          grouped.map(([date, events]) => (
            <div key={date}>
              <DateHeader date={date} />
              <div className="space-y-2">
                {events.map((event, idx) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    currency={settings.currency}
                    categories={settings.categories}
                    isLast={idx === events.length - 1 && date === grouped[grouped.length - 1][0]}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
