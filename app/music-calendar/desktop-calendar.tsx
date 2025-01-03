"use client";

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function DesktopCalendar() {
	const [showingMonthly, setShowingMonthly] = useState<boolean>(true);
	const [showingWeekly, setShowingWeekly] = useState<boolean>(false);
	const [view, setView] = useState<string>('month');
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [filterValue, setFilterValue] = useState<string>('');
	const [events, setEvents] = useState<any[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
	const localizer = momentLocalizer(moment);

	const handleFilter = useCallback((e: any) => {
		const val = e.target.value;
		setFilterValue(val);
		setFilteredEvents(_ => events.filter((event: any) => event.title.toLowerCase().includes(val.toLowerCase())));
	}, [events, setFilteredEvents]);


	const handlePrevMonth = () => {
		setCurrentDate(prevDate => moment(prevDate).subtract(1, 'month').toDate());
	};

	const handlePrevWeek = () => {
		setCurrentDate(prevDate => moment(prevDate).subtract(1, 'week').toDate());
	};

	const handleNextMonth = () => {
		setCurrentDate(prevDate => moment(prevDate).add(1, 'month').toDate());
	};

	const handleNextWeek = () => {
		setCurrentDate(prevDate => moment(prevDate).add(1, 'week').toDate());
	};

	const handleNavigate = (newDate: any) => {
		setCurrentDate(newDate);
	};
	const router = useRouter();

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	});

	useEffect(() => {
		fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
			.then((res: any) => {
				return res.json()
					.then(({ events }: any) => {
						setEvents(events.map((event: any) => {
							let [month, day, year] = event.date.split('/');
							return (
								{
									...event,
									date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
								}
							)
						}));
						setFilteredEvents(events);
					})
			})
	}, []);

	const CustomToolbar = () => {
		return (
			<div className="custom-toolbar">
				<div className="input-container">
					<Search className="search-icon" />
					<input type="text" ref={inputRef} className="search-input" value={filterValue} onChange={handleFilter} key={1} />
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
						setCurrentDate(new Date());
						setView('week')
					}}
						className={`view-button ${view === 'week' ? 'active' : ''}`}>weekly</button>
				</div>
			</div>
		)
	};

	const customDayPropGetter = () => ({
		className: 'custom-day-bg',
	});

	const CustomMonthDateHeader = ({ date }: { date: any }) => (
		<div style={{ fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'right' }} className="custom-date-header">
			<span className="rbc-button-link" onClick={() => {
				date = new Date(date);
				let month = (date.getMonth() + 1).toString();
				if (month.startsWith('0') && month.length === 2) {
					month = month.substring(1);
				}
				let dayOfMonth = date.getDate().toString();
				if (dayOfMonth.startsWith('0') && dayOfMonth.length === 2) {
					dayOfMonth = dayOfMonth.substring(1);
				}
				const year = date.getFullYear().toString();
				router.push(`/events/${month}-${dayOfMonth}-${year}`);
			}}>{date.getDate()}</span>
		</div >
	);

	const CustomMonthHeader = ({ label }: { date: any, label: any }) => (
		<div className="custom-month-header">
			{label}
		</div>
	);

	const CustomWeeklyHeader = ({ date, label }: { date?: any, label?: any, onHeaderClick?: any }) => (
		<span className="rbc-button-link" onClick={() => {
			date = new Date(date);
			let month = (date.getMonth() + 1).toString();
			if (month.startsWith('0') && month.length === 2) {
				month = month.substring(1);
			}
			let dayOfMonth = date.getDate().toString();
			if (dayOfMonth.startsWith('0') && dayOfMonth.length === 2) {
				dayOfMonth = dayOfMonth.substring(1);
			}
			const year = date.getFullYear().toString();
			router.push(`/events/${month}-${dayOfMonth}-${year}`);
			// router.push(`/events/${month}-${dayOfMonth}-${year}`);
		}}>
			{label}
		</span>
	);

	const CustomEvent = ({ event }: { event: any }) => (
		<div onClick={() => window.open(event.link, '_blank')} style={{ fontWeight: 'bold', color: 'lightgray' }} className="custom-event">
			{showingMonthly ?
				<p className="weekly">{`${event.artist.toLowerCase()} @ ${event.venue.toLowerCase()}`}</p> :
				<>
					<p className="weekly weekly-artist">{event.artist.toLowerCase()}</p>
					<p className="weekly">{event.time.toLowerCase()}</p>
					<p className="weekly">{event.venue.toLowerCase()}</p>
					<p className="weekly">{event.town.toLowerCase()}</p>
				</>}
		</div>
	);

	return (
		<div className="calendar-container">
			<div className="left-column">
				<button
					className="arrow-button"
					aria-label="Previous month"
					onClick={showingMonthly ? handleNextMonth : handleNextWeek}
				>
					<ChevronUp />
				</button>
				<div className="month-container">
					<div className="top-left-month">
						{moment(currentDate).format('MMMM').toLowerCase()}
					</div>
				</div>
				<button
					// onClick={onNextMonth}
					className="arrow-button"
					aria-label="Next month"
					onClick={showingMonthly ? handlePrevMonth : handlePrevWeek}
				>
					<ChevronDown />
				</button>
			</div>
			<div className="main-calendar">
				<CustomToolbar />
				<Calendar
					localizer={localizer}
					events={filteredEvents}
					startAccessor="start"
					endAccessor="end"
					style={{ flex: 1 }}
					views={['month', 'week']}
					view={showingWeekly ? Views.WEEK : Views.MONTH}
					onView={setView}
					date={currentDate}
					onNavigate={handleNavigate}
					onShowMore={(blah) => { router.push(`/events/${blah[0].start.getMonth() - 1}-${blah[0].start.getDate()}-${blah[0].start.getFullYear().toString()}`); }}
					components={{
						header: (props) => (
							<CustomWeeklyHeader {...props} />
						),
						toolbar: () => null,
						timeGutterHeader: () => null,
						month: {
							dateHeader: CustomMonthDateHeader,
							header: CustomMonthHeader,
						},
						event: CustomEvent,
					}}
					dayPropGetter={customDayPropGetter}
					formats={{
						monthHeaderFormat: 'MMMM',
					}}
				/>
			</div>
		</div>
	);
};
