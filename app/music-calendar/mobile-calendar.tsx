"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as types from '@/app/lib/types';
import axios from 'axios';

export default function MobileCalendar() {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [weekDates, setWeekDates] = useState<Date[]>([]);
	const [showAllEvents, setShowAllEvents] = useState<boolean>(false);
	const [events, setEvents] = useState<any[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
	const [displayedEvents, setDisplayedEvents] = useState<types.MusicEvent[]>([]);

	useEffect(() => {
		axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
			.then((res) => {
				setEvents(res.data.events);
			})
			.catch()
	}, [])

	useEffect(() => {
		const dates = getWeekDates(selectedDate);
		setDisplayedEvents(events.filter((event: any) => {
			let [month, day, year] = event.date.split('/');
			month = parseInt(month) - 1;
			day = parseInt(day);
			year = parseInt(year);
			const now = selectedDate;
			const nowMonth = now.getMonth();
			const nowDay = now.getDate();
			const nowYear = now.getFullYear()

			return month === nowMonth && year === nowYear && day === nowDay;
		}));
		setFilteredEvents(displayedEvents);
		setWeekDates(dates);
		setShowAllEvents(false);
	}, [selectedDate, events]);

	const getWeekDates = (date: Date) => {
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

	return (
		<div className="min-h-screen max-w-2xl mx-auto p-4 bg-[#2a2727]">
			<h3 className="text-center text-[#faff00] block font-semibold mb-2">{selectedDate.toLocaleString('default', { month: 'long' })}</h3>
			<div className="flex items-center justify-between mb-4">
				<button onClick={handlePrevWeek} className="p-2 text-[#faff00] hover:bg-[#faff00] hover:bg-opacity-20 rounded-full transition-colors duration-200">
					<ChevronLeft className="w-6 h-6" />
				</button>
				<div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
					{weekDates.map((date: Date) => (
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
				{displayedEvents?.map((event: types.MusicEvent) => (
					<div key={event._id} className="mb-2 p-2">
						<p className="font-semibold text-[#faff00] cursor-pointer hover:opacity-80" onClick={() => window.open(event.link, '_blank')}>{event.artist.toLowerCase()}</p>
						<p className="text-sm text-gray-200" onClick={() => window.open(event.link, '_blank')}>{event.venue.toLowerCase()}</p>
						<p className="text-sm text-gray-200" onClick={() => window.open(event.link, '_blank')}>{event.time.toLowerCase()}</p>
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


