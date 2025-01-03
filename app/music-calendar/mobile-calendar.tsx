"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMobileMusicData } from "../hooks/useArtData";

export default function MobileCalendar() {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [weekDates, setWeekDates] = useState<any>([]);
	const [showAllEvents, setShowAllEvents] = useState<any>(false);
	const [filteredEvents, setFilteredEvents] = useState<any>(null);
	const [displayedEvents, setDisplayedEvents] = useState<any>(null);
	const [musicData, refetchMusicData] = useMobileMusicData(selectedDate, setFilteredEvents, setDisplayedEvents, showAllEvents);

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
		const [month, day, year] = date.toLocaleDateString().split("/");
		return `${year}-${month}-${day}`;
	};

	return (
		<div className="min-h-screen max-w-2xl mx-auto p-4 bg-[#2a2727]">
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


