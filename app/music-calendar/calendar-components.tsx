import { useRouter } from 'next/navigation';
import * as types from '@/app/lib/types';
import Dropdown from '../lib/Dropdown';
import { Search } from 'lucide-react';
import React, { createContext, useContext } from 'react';
import moment from 'moment';

export const CalendarContext = createContext({ showingMonthly: true });

export const CustomMonthDateHeader = ({ date }: { date: Date }) => {
    const router = useRouter();
    return (
        <div style={{ fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'right' }} className="custom-date-header">
            <span className="rbc-button-link" onClick={() => {
                const month = (date.getMonth() + 1).toString().replace(/^0(\d)$/, '$1');
                const dayOfMonth = date.getDate().toString().replace(/^0(\d)$/, '$1');
                const year = date.getFullYear().toString();
                router.push(`/events/${month}-${dayOfMonth}-${year}?eventType=music`);
            }}>{date.getDate()}</span>
        </div>
    );
};

export const CustomMonthHeader = ({ label }: { label: string }) => (
    <div className="custom-month-header">{label}</div>
);

export const CustomWeeklyHeader = ({ date, label }: { date: Date; label: string }) => {
    const router = useRouter();
    return (
        <span className="rbc-button-link" onClick={() => {
            const month = (date.getMonth() + 1).toString().replace(/^0(\d)$/, '$1');
            const dayOfMonth = date.getDate().toString().replace(/^0(\d)$/, '$1');
            const year = date.getFullYear().toString();
            router.push(`/events/${month}-${dayOfMonth}-${year}`);
        }}>{label}</span>
    );
};

export const CustomEvent = ({ event }: { event: types.MusicEvent & { start: Date; end: Date } }) => {
    const { showingMonthly } = useContext(CalendarContext);
    return (
        <div onClick={() => window.open(event.link, '_blank')} style={{ fontWeight: 'bold', color: 'lightgray' }} className="custom-event"
        >
            {showingMonthly ?
                <p className="weekly">{`${event.artist.toLowerCase()} @ ${event.venue.toLowerCase()}`}</p> :
                <>
                    <p className="weekly weekly-artist">{event.artist.toLowerCase()}</p>
                    <p className="weekly">{event.time.toLowerCase()}</p>
                    <p className="weekly">{event.venue.toLowerCase()}</p>
                </>}
        </div>
    );
};

export const CustomToolbar = ({ 
    filterValue, 
    onFilterChange, 
    setShowingMonthly,
    setShowingWeekly,
    setView,
    view,
    inputRef 
}: types.CustomToolbarProps) => (
    <div className="custom-toolbar">
        <Dropdown current='Music' />
        <div className="input-container">
            <Search className="search-icon" />
            <input type="text" ref={inputRef} className="search-input" value={filterValue} onChange={onFilterChange} key={1} />
        </div>
        <div className="calendar-type">
            <button style={{ fontSize: '20px', color: '#faff00' }} onClick={() => {
                setShowingMonthly(true);
                setShowingWeekly(false);
                setView('month');
            }}
                className={`view-button ${view === 'month' ? 'active' : ''}`}>monthly</button>
            <span style={{ color: '#faff00' }}>|</span>
            <button style={{ fontSize: '20px', color: '#faff00' }} onClick={() => {
                setShowingWeekly(true);
                setShowingMonthly(false);
                setView('week')
            }}
                className={`view-button ${view === 'week' ? 'active' : ''}`}>weekly</button>
        </div>
    </div>
);

export const customDayPropGetter = () => ({
    className: 'custom-day-bg',
});

export const useCalendarNavigation = () => {
    const handlePrevMonth = () => moment().subtract(1, 'month').toDate();
    const handlePrevWeek = () => moment().subtract(1, 'week').toDate();
    const handleNextMonth = () => moment().add(1, 'month').toDate();
    const handleNextWeek = () => moment().add(1, 'week').toDate();

    return {
        handlePrevMonth,
        handlePrevWeek,
        handleNextMonth,
        handleNextWeek
    };
}; 