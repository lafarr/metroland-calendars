"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search } from 'lucide-react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styles.css';
import { useRouter } from 'next/navigation';
import Dropdown from '../lib/Dropdown';

enum Categories {
	visualArts,
	theater,
	film,
	comedy,
	poetry
}

const MobileCalendar = ({ customClasses }: { customClasses: string }) => {
	const [selectedDate, setSelectedDate] = useState<any>(new Date());
	const [weekDates, setWeekDates] = useState<any>([]);
	const [showAllEvents, setShowAllEvents] = useState<any>(false);
	const [events, setEvents] = useState<any>(null);
	const [filteredEvents, setFilteredEvents] = useState<any>(null);
	const [displayedEvents, setDisplayedEvents] = useState<any>(null);
	const localizer = momentLocalizer(moment);


	useEffect(() => {
		fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/other-events`)
			.then((response) => {
				if (!response.ok) { }
				return response.json()
					.then(({ events }: any) => {
						const tmp = [];
						for (const e of events) {
							const tmpE = e;
							tmpE.title = `${e.title} @ ${e.venue}`
							if (!tmpE.start) {
								console.log('start error');
								console.log(tmpE);
							}
							const [startMonth, startDay, startYear] = tmpE.start.split("/");
							const [endMonth, endDay, endYear] = tmpE.end.split("/");
							tmpE.start = new Date(parseInt(startYear), parseInt(startMonth), parseInt(startDay));
							tmpE.end = new Date(parseInt(endYear), parseInt(endMonth), parseInt(endDay));
							tmp.push(tmpE);
						}
						const fEvents = tmp.filter((event: any) => event.start <= selectedDate && event.end >= selectedDate);
						console.log(fEvents);
						setFilteredEvents(fEvents);
						setDisplayedEvents(showAllEvents ? fEvents : fEvents.slice(0, 4));
					})
			})
	}, [selectedDate, showAllEvents]);

	useEffect(() => {
		const dates = getWeekDates(selectedDate);
		setWeekDates(dates);
		setShowAllEvents(false);
	}, [selectedDate]);

	const getWeekDates = (date: any) => {
		const week = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(date);
			day.setDate(date.getDate() - date.getDay() + i);
			week.push(day);
		}
		return week;
	};

	const handlePrevWeek = () => {
		const newDate = new Date(selectedDate);
		newDate.setDate(selectedDate.getDate() - 7);
		setSelectedDate(newDate);
	};

	const handleNextWeek = () => {
		const newDate = new Date(selectedDate);
		newDate.setDate(selectedDate.getDate() + 7);
		setSelectedDate(newDate);
	};

	const formatDate = (date: any) => {
		return date.toISOString().split('T')[0];
	};

	return (
		<div className={`${customClasses} min-h-screen max-w-2xl mx-auto p-4 bg-[#2a2727]`}>
			<h3 className="text-center text-[#faff00] block font-semibold mb-2">{selectedDate.toLocaleString('default', { month: 'long' })}</h3>
			<div className="flex items-center justify-between mb-4">
				<button onClick={handlePrevWeek} className="p-2 text-[#faff00] hover:bg-[#faff00] hover:bg-opacity-20 rounded-full transition-colors duration-200">
					<ChevronLeft className="w-6 h-6" />
				</button>
				<div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
					{weekDates.map((date: any) => (
						<button
							key={date.toISOString()}
							onClick={() => setSelectedDate(date)}
							className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-center text-xs sm:text-sm font-medium transition-colors duration-200 ${selectedDate.toDateString() === date.toDateString()
								? 'bg-[#faff00] text-black'
								: 'bg-transparent text-gray-200 border-2 border-[#faff00] hover:bg-[#faff00] hover:bg-opacity-20'
								}`}
						>
							<span>{date.getDate()}</span>
						</button>
					))}
				</div>
				<button onClick={handleNextWeek} className="p-2 text-[#faff00] hover:bg-[#faff00] hover:bg-opacity-20 rounded-full transition-colors duration-200">
					<ChevronRight className="w-6 h-6" />
				</button>
			</div>
			<div className="p-4 text-center">
				{displayedEvents?.map((event: any) => (
					<div key={event._id} className="mb-2 p-2">
						<p className="font-semibold text-[#faff00]">{event.title.toLowerCase()}</p>
						<p className="text-sm text-gray-200">@ {event.venue.toLowerCase()}</p>
					</div>
				))}
				{filteredEvents && filteredEvents.length > 4 && !showAllEvents && (
					<button
						onClick={() => setShowAllEvents(true)}
						className="mt-2 w-3/4 py-2 bg-[#faff00] text-black rounded-md hover:bg-opacity-80 transition-colors duration-200"
					>
						Show More
					</button>
				)}
			</div>
		</div>
	);
};


function DesktopCalendar({ customClasses }: { customClasses: string }) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [realEvents, setRealEvents] = useState<any[]>([]);
	const [ready, setReady] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const router = useRouter();
	const localizer = momentLocalizer(moment);
	const inputRef = useRef<HTMLInputElement>(null);
	const [categoryFilter, setCategoryFilter] = useState<Categories | null>(null);

	const CustomEvent = ({ event }: any) => (
		<div style={{ width: '100%', color: 'black' }} className="custom-event">
			{<a href={event.link} target="_blank" className="weekly w-full overflow-hidden text-ellipsis">{event.title}</a>}
		</div>
	);

	const CustomMonthDateHeader = ({ date }: any) => (
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
				router.push(`/events/${month}-${dayOfMonth}-${year}?eventType=other`);
			}}>{date.getDate()}</span>
		</div >
	);

	const CustomToolbar = () => (
		<div className="custom-toolbar" key={"search"}>
			<Dropdown current='Other' />
				<button
					onClick={() => {
						if (categoryFilter !== Categories.visualArts) setCategoryFilter(Categories.visualArts);
						else
							setCategoryFilter(null);
					}}
					className={`${categoryFilter === Categories.visualArts ? 'bg-[#faff00] text-black' : 'text-gray-300'} rounded p-2 m-2 border border-[#faff00]`}>
					visual arts
				</button>
				<button
					onClick={() => {
						if (categoryFilter !== Categories.theater)
							setCategoryFilter(Categories.theater);
						else
							setCategoryFilter(null);
					}}
					className={`${categoryFilter === Categories.theater ? 'bg-[#faff00] text-black' : 'text-gray-300'} rounded p-2 m-2 border border-[#faff00]`}>
					theater
				</button>
				<button
					onClick={() => {
						if (categoryFilter !== Categories.film)
							setCategoryFilter(Categories.film);
						else
							setCategoryFilter(null);
					}}
					className={`${categoryFilter === Categories.film ? 'bg-[#faff00] text-black' : 'text-gray-300'} rounded p-2 m-2 border border-[#faff00]`}>
					film
				</button>
				<button
					onClick={() => {
						if (categoryFilter !== Categories.poetry)
							setCategoryFilter(Categories.poetry);
						else setCategoryFilter(null);
					}}
					className={`${categoryFilter === Categories.poetry ? 'bg-[#faff00] text-black' : 'text-gray-300'} rounded p-2 m-2 border border-[#faff00]`}>
					poetry
				</button>
				<button
					onClick={() => {
						if (categoryFilter !== Categories.comedy)
							setCategoryFilter(Categories.comedy);
						else setCategoryFilter(null);
					}}
					className={`${categoryFilter === Categories.comedy ? 'bg-[#faff00] text-black' : 'text-gray-300'} rounded p-2 m-2 border border-[#faff00]`}>
					comedy
				</button>
			<div className="input-container">
				<Search className="absolute text-gray-200 right-[90%]" />
				<input type="text" ref={inputRef} className="search-input focus:outline-none" onChange={(e: any) => setSearchQuery(e.target.value)} value={searchQuery} />
			</div>
		</div>
	);

	useEffect(() => {
		inputRef.current?.focus();
	})

	useEffect(() => {
		setReady(true);
		fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/other-events`)
			.then(async (response: Response) => {
				if (!response.ok) { }
				const { events } = await response.json();
				const realEvents = [];
				for (const e of events) {
					const tmpE = e;
					tmpE.title = `${e.title} @ ${e.venue}`;
					const [startMonth, startDay, startYear] = tmpE.start.split("/");
					const [endMonth, endDay, endYear] = tmpE.end.split("/");
					tmpE.start = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
					tmpE.end = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
					realEvents.push(tmpE);
				}
				setRealEvents(realEvents.filter((e: any) => {
					let categoryFilterString = '';
					switch (categoryFilter) {
						case Categories.visualArts:
							categoryFilterString = 'Visual Arts';
							break;
						case Categories.theater:
							categoryFilterString = 'Theater';
							break;
						case Categories.poetry:
							categoryFilterString = 'Poetry';
							break;
						case Categories.film:
							categoryFilterString = 'Film';
							break;
						case Categories.comedy:
							categoryFilterString = 'Comedy';
							break;
						default:
							categoryFilterString = '';
					}
					if (categoryFilterString)
						return e.category === categoryFilterString && e.title.toLowerCase().includes(searchQuery)
					else
						return e.title.toLowerCase().includes(searchQuery);
				}));
			})
	}, [searchQuery, categoryFilter])

	const handlePrevMonth = () => {
		setCurrentDate(prevDate => moment(prevDate).subtract(1, 'month').toDate());
	};

	const handleNextMonth = () => {
		setCurrentDate(prevDate => moment(prevDate).add(1, 'month').toDate());
	};

	return (
		<div className={`${customClasses} art`}>
			<div className="flex">
			</div>
			<div className="calendar-container">
				<div className="left-column">
					<button
						className="arrow-button"
						aria-label="Previous month"
						onClick={handleNextMonth}
					>
						<ChevronUp />
					</button>
					<div className="month-container">
						<div className="top-left-month">
							{moment(currentDate).format('MMMM').toLowerCase()}
						</div>
					</div>
					<button
						className="arrow-button"
						aria-label="Next month"
						onClick={handlePrevMonth}
					>
						<ChevronDown />
					</button>
				</div>
				<div className="w-full">
					<Calendar date={currentDate} components={{ month: { dateHeader: CustomMonthDateHeader }, event: CustomEvent, toolbar: CustomToolbar }} views={['month']} defaultDate={new Date()} localizer={localizer} events={realEvents} />
				</div>
			</div>
		</div>
	)
}

export default function OtherCalendar() {
	const [ready, setReady] = useState(false);

	useEffect(() => { setReady(true); }, []);
	return (
		<>
			<div className="min-h-screen">
				{ready && <><DesktopCalendar customClasses={"hidden md:block"} />
					<MobileCalendar customClasses={"md:hidden"} /></>}
			</div>
		</>
	)
}
