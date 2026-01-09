// HeartSync 2.0 - Shared Calendar
// Made with 💕 for Precious & Safari

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    emoji: string;
    isCountdown?: boolean;
}

// Demo events
const demoEvents: CalendarEvent[] = [
    {
        id: '1',
        title: 'Anniversary 💕',
        date: addDays(new Date(), 30),
        emoji: '💕',
        isCountdown: true,
    },
    {
        id: '2',
        title: 'Date Night 🍷',
        date: addDays(new Date(), 3),
        emoji: '🍷',
    },
    {
        id: '3',
        title: 'Movie Marathon 🎬',
        date: addDays(new Date(), 7),
        emoji: '🎬',
    },
];

export default function CalendarPage() {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(demoEvents);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [newEvent, setNewEvent] = useState({ title: '', emoji: '💕', isCountdown: false });

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get the first day of the week for padding
    const startPadding = monthStart.getDay();

    const countdowns = events.filter(e => e.isCountdown && e.date > new Date());

    const handleAddEvent = () => {
        if (!newEvent.title.trim() || !selectedDate) return;

        const event: CalendarEvent = {
            id: Date.now().toString(),
            title: newEvent.title,
            date: selectedDate,
            emoji: newEvent.emoji,
            isCountdown: newEvent.isCountdown,
        };

        setEvents([...events, event]);
        setNewEvent({ title: '', emoji: '💕', isCountdown: false });
        setSelectedDate(null);
        setShowAddModal(false);
    };

    const eventsForDay = (day: Date) => events.filter(e => isSameDay(e.date, day));

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-secondary/80 backdrop-blur-md border-b border-white/5 px-4 py-3 safe-top">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button onClick={() => router.push('/')} className="btn-ghost p-2">
                        ←
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-text-primary">📅 Calendar</h1>
                        <p className="text-xs text-text-muted">Your shared schedule</p>
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-6">
                {/* Countdowns */}
                {countdowns.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-medium text-text-muted mb-3">⏳ Countdowns</h2>
                        <div className="grid gap-3">
                            {countdowns.map(countdown => (
                                <motion.div
                                    key={countdown.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass-card p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{countdown.emoji}</span>
                                        <div>
                                            <p className="font-medium text-text-primary">{countdown.title}</p>
                                            <p className="text-xs text-text-muted">{format(countdown.date, 'MMMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            {differenceInDays(countdown.date, new Date())}
                                        </p>
                                        <p className="text-xs text-text-muted">days</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Calendar */}
                <div className="glass-card p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setCurrentMonth(addDays(monthStart, -1))}
                            className="btn-ghost p-2"
                        >
                            ←
                        </button>
                        <h2 className="text-lg font-bold text-text-primary">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => setCurrentMonth(addDays(monthEnd, 1))}
                            className="btn-ghost p-2"
                        >
                            →
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs text-text-muted py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Padding for start of month */}
                        {Array.from({ length: startPadding }).map((_, i) => (
                            <div key={`pad-${i}`} className="aspect-square" />
                        ))}

                        {/* Days */}
                        {daysInMonth.map(day => {
                            const dayEvents = eventsForDay(day);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <button
                                    key={day.toString()}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        setShowAddModal(true);
                                    }}
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${isToday
                                            ? 'bg-primary text-white font-bold'
                                            : dayEvents.length > 0
                                                ? 'bg-surface-hover text-text-primary'
                                                : 'hover:bg-surface text-text-secondary'
                                        }`}
                                >
                                    <span>{format(day, 'd')}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="flex gap-0.5 mt-0.5">
                                            {dayEvents.slice(0, 2).map(e => (
                                                <span key={e.id} className="text-[8px]">{e.emoji}</span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="mt-6">
                    <h2 className="text-sm font-medium text-text-muted mb-3">📌 Upcoming</h2>
                    <div className="space-y-2">
                        {events
                            .filter(e => e.date >= new Date())
                            .sort((a, b) => a.date.getTime() - b.date.getTime())
                            .slice(0, 5)
                            .map(event => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-3 flex items-center gap-3"
                                >
                                    <span className="text-xl">{event.emoji}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-text-primary">{event.title}</p>
                                        <p className="text-xs text-text-muted">{format(event.date, 'EEE, MMM d')}</p>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-text-primary mb-2">Add Event</h2>
                            {selectedDate && (
                                <p className="text-sm text-text-muted mb-4">
                                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                                </p>
                            )}

                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Event title..."
                                    className="input"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newEvent.isCountdown}
                                        onChange={e => setNewEvent({ ...newEvent, isCountdown: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-text-secondary">⏳ Show as countdown</span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button onClick={handleAddEvent} className="btn-primary flex-1">
                                    Add Event
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
