'use client';

import { useState, useEffect } from 'react';

interface CalendarEvent {
  start: Date;
  end: Date;
  summary: string;
  phone?: string;
}

export default function AirbnbCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      const response = await fetch('/api/airbnb-calendar');
      if (!response.ok) throw new Error('Failed to fetch calendar');
      const data = await response.json();
      setEvents(
        data.events.map((e: { start: string; end: string; summary: string; phone?: string }) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (date: Date) => {
    const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const normalizedDate = normalizeDate(date);

    // Check if this date is a check-in
    const checkInEvent = events.find(
      (e) => normalizeDate(e.start).getTime() === normalizedDate.getTime()
    );

    // Check if this date is a check-out (end date is exclusive, so check-out is end date itself)
    const checkOutEvent = events.find(
      (e) => normalizeDate(e.end).getTime() === normalizedDate.getTime()
    );

    if (checkInEvent && checkOutEvent)
      return { status: 'transition', label: 'In/Out', phone: checkInEvent.phone };
    if (checkInEvent) return { status: 'transition', label: 'Check-in', phone: checkInEvent.phone };
    if (checkOutEvent)
      return { status: 'transition', label: 'Check-out', phone: checkOutEvent.phone };

    // Check if date is within a booking (between start and end, exclusive)
    const event = events.find((e) => {
      const start = normalizeDate(e.start);
      const end = normalizeDate(e.end);
      return normalizedDate >= start && normalizedDate < end;
    });

    if (!event) return { status: 'available', label: '', phone: undefined };

    return {
      status: event.summary.includes('Not available') ? 'blocked' : 'booked',
      label: '',
      phone: event.phone,
    };
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  if (loading) return <div className="text-center py-8">Loading calendar...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-900 font-bold text-xl"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-900 font-bold text-xl"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-bold text-gray-600 py-2">
            {day}
          </div>
        ))}
        {days.map((day, i) => {
          const info = day ? getDateStatus(day) : { status: null, label: '', phone: undefined };
          const isToday =
            day &&
            day.getDate() === new Date().getDate() &&
            day.getMonth() === new Date().getMonth() &&
            day.getFullYear() === new Date().getFullYear();
          return (
            <div
              key={i}
              className={`aspect-square flex flex-col items-center justify-center rounded text-gray-900 font-medium ${
                isToday ? 'border-4 border-purple-600' : ''
              } ${
                info.status === 'transition'
                  ? 'bg-yellow-200'
                  : info.status === 'booked'
                    ? 'bg-red-300'
                    : info.status === 'blocked'
                      ? 'bg-gray-400'
                      : info.status === 'available'
                        ? 'bg-green-100'
                        : ''
              }`}
            >
              <div>{day?.getDate()}</div>
              {info.phone && <div className="text-xs">{info.phone}</div>}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 text-sm flex-wrap text-gray-900">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span>Check-in/out</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
}
