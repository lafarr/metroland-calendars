"use client";

import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import {
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronDown,
	Search,
} from "lucide-react";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles.css";
import { useRouter } from "next/navigation";
import Dropdown from "../lib/Dropdown";
import * as types from "@/app/lib/types";
import { useSearchParams } from "next/navigation";

enum Categories {
	visualArts,
	theater,
	film,
	comedy,
	poetry,
}
interface MobileDropdownProps {
	setSelectedOptions: Dispatch<SetStateAction<string[]>>;
}

// Use proper props destructuring with curly braces
const MobileDropdown: React.FC<MobileDropdownProps> = ({ setSelectedOptions }) => {
	const [selected, setSelected] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const options = ['visual arts', 'theater', 'film', 'comedy', 'poetry'];

	console.log('selected:')
	console.log(selected)

	function toggleOption(option: string) {
		if (!selected.includes(option)) {
			setSelected([...selected, option]);
		} else {
			setSelected(selected.filter((val) => val !== option));
		}
	}

	useEffect(() => {
		setSelectedOptions(selected);
	}, [selected])

	return (
		<div className="p-4 bg-[#2a2727]">
			<div className="relative">
				{/* Header/trigger */}
				<div
					onClick={() => setIsOpen(!isOpen)}
					className="cursor-pointer border border-gray-300 rounded-md px-3 py-2 text-gray-300 flex justify-between items-center"
				>
					<span>{selected.length ? selected.join(', ') : 'Select options'}</span>
					<span>{isOpen ? '▲' : '▼'}</span>
				</div>

				{/* Dropdown list */}
				{isOpen && (
					<div className="absolute left-0 right-0 mt-1 border border-gray-300 rounded-md bg-[#2a2727] z-10">
						{options.map((option) => (
							<div
								key={option}
								onClick={() => toggleOption(option)}
								className={`px-3 py-2 cursor-pointer ${selected.includes(option) ? 'bg-[#faff00] text-black' : 'text-gray-300 hover:bg-gray-700'
									}`}
							>
								{option}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

const MobileCalendar = ({ customClasses }: { customClasses: string }) => {
	const d = new Date()
	const [selectedDate, setSelectedDate] = useState<Date>(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
	const [weekDates, setWeekDates] = useState<Date[]>([]);
	const [showAllEvents, setShowAllEvents] = useState<boolean>(false);
	const [filteredEvents, setFilteredEvents] = useState<types.OtherEvent[]>([]);
	const [events, setEvents] = useState<(types.OtherEvent)[]>([]);
	const [displayedEvents, setDisplayedEvents] = useState<types.OtherEvent[]>(
		[],
	);
	const [filters, setFilters] = useState<string[]>([])

	useEffect(() => {
		fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/other-events`)
			.then((response: Response) => {
				if (response.ok) {
					response.json()
						.then((json: any) => setEvents(json.events));
				}
			});
	}, []);

	useEffect(() => {
		const tmp = [];
		for (const e of events) {
			const tmpE = { ...e };
			tmpE.title = `${e.title} @ ${e.venue}`;
			if (
				typeof tmpE.start === "string" &&
				typeof tmpE.end === "string"
			) {
				const [startMonth, startDay, startYear] =
					tmpE.start.split("/");
				const [endMonth, endDay, endYear] = tmpE.end.split("/");
				tmpE.start = new Date(
					parseInt(startYear),
					parseInt(startMonth),
					parseInt(startDay),
				);
				tmpE.end = new Date(
					parseInt(endYear),
					parseInt(endMonth),
					parseInt(endDay),
				);
			}
			tmp.push(tmpE);
		}
		const fEvents = tmp.filter(
			(event: types.OtherEvent) =>
				event.start <= selectedDate && event.end >= selectedDate && (filters.includes(event.category.toLowerCase()) || filters.length === 0),
		);
		setFilteredEvents(fEvents);
		console.log('events:');
		console.log(fEvents)
		setDisplayedEvents(showAllEvents ? fEvents : fEvents.slice(0, 4));
	}, [selectedDate, showAllEvents, events, filters]);

	useEffect(() => {
		const dates = getWeekDates(selectedDate);
		setWeekDates(dates);
		setShowAllEvents(false);
	}, [selectedDate]);

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
		<div
			className={`${customClasses} min-h-screen max-w-2xl mx-auto p-4 bg-[#2a2727]`}
		>
			<h3 className="text-center text-[#faff00] block font-semibold mb-2">
				{selectedDate.toLocaleString("default", { month: "long" })}
			</h3>
			<div className="flex items-center justify-between mb-4">
				<button
					onClick={handlePrevWeek}
					className="p-2 text-[#faff00] hover:bg-[#faff00] hover:bg-opacity-20 rounded-full transition-colors duration-200"
				>
					<ChevronLeft className="w-6 h-6" />
				</button>
				<div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
					{weekDates.map((date: Date) => (
						<button
							key={date.toISOString()}
							onClick={() => setSelectedDate(date)}
							className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-center text-xs sm:text-sm font-medium transition-colors duration-200 ${selectedDate.toDateString() === date.toDateString()
								? "bg-[#faff00] text-black"
								: "bg-transparent text-gray-200 border-2 border-[#faff00] hover:bg-[#faff00] hover:bg-opacity-20"
								}`}
						>
							<span>{date.getDate()}</span>
						</button>
					))}
				</div>
				<button
					onClick={handleNextWeek}
					className="p-2 text-[#faff00] hover:bg-[#faff00] hover:bg-opacity-20 rounded-full transition-colors duration-200"
				>
					<ChevronRight className="w-6 h-6" />
				</button>
			</div>
			<MobileDropdown setSelectedOptions={setFilters} />
			<div className="p-4 text-center">
				{displayedEvents?.map((event: types.OtherEvent) => (
					<div key={event._id} className="mb-2 p-2">
						<p className="font-semibold text-[#faff00]">
							{event.title.toLowerCase()}
						</p>
						<p className="text-sm text-gray-200">
							@ {event.venue.toLowerCase()}
						</p>
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

function DesktopCalendar({
	customClasses,
}: Readonly<{ customClasses: string }>) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [realEvents, setRealEvents] = useState<types.OtherEvent[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const router = useRouter();
	const localizer = momentLocalizer(moment);
	const inputRef = useRef<HTMLInputElement>(null);
	const [categoryFilters, setCategoryFilters] = useState<Categories[]>([]);
	const [events, setEvents] = useState<types.OtherEvent[]>([]);
	const searchParams = useSearchParams();
	const isEmbed = !!searchParams.get('embed')

	const CustomEvent = ({ event }: { event: types.OtherEvent }) => (
		<div style={{ width: "100%", color: "black" }} className="custom-event">
			{
				<a
					href={event.link}
					rel="noreferrer"
					target="_blank"
					className="weekly w-full overflow-hidden text-ellipsis"
				>
					{event.title}
				</a>
			}
		</div>
	);

	const CustomMonthDateHeader = ({ date }: { date: Date }) => {
		return (
			<div
				style={{
					fontSize: "16px",
					fontWeight: "bold",
					cursor: "pointer",
					textAlign: "right",
				}}
				className="custom-date-header"
			>
				<span
					className="rbc-button-link"
					onClick={() => {
						date = new Date(date);
						let month = (date.getMonth() + 1).toString();
						if (month.startsWith("0") && month.length === 2) {
							month = month.substring(1);
						}
						let dayOfMonth = date.getDate().toString();
						if (dayOfMonth.startsWith("0") && dayOfMonth.length === 2) {
							dayOfMonth = dayOfMonth.substring(1);
						}
						const year = date.getFullYear().toString();
						router.push(`/events/${month}-${dayOfMonth}-${year}?eventType=other`);
					}}
				>
					{date.getDate()}
				</span>
			</div>
		);
	}

	const CustomToolbar = () => {
		if (isEmbed) return <></>
		else return (
			<div className="custom-toolbar" key={"search"}>
				<Dropdown current="Other" />
				<button
					onClick={() => {
						if (!categoryFilters.includes(Categories.visualArts))
							setCategoryFilters((prev: Categories[]) => [
								...prev,
								Categories.visualArts,
							]);
						else
							setCategoryFilters((prev: Categories[]) =>
								prev.filter((c) => c !== Categories.visualArts),
							);
					}}
					className={`${categoryFilters.includes(Categories.visualArts) ? "bg-[#faff00] text-black" : "text-gray-300"} rounded p-2 m-2 border border-[#faff00]`}
				>
					visual arts
				</button>
				<button
					onClick={() => {
						if (!categoryFilters.includes(Categories.theater))
							setCategoryFilters((prev: Categories[]) => [
								...prev,
								Categories.theater,
							]);
						else
							setCategoryFilters((prev: Categories[]) =>
								prev.filter((c) => c !== Categories.theater),
							);
					}}
					className={`${categoryFilters.includes(Categories.theater) ? "bg-[#faff00] text-black" : "text-gray-300"} rounded p-2 m-2 border border-[#faff00]`}
				>
					theater
				</button>
				<button
					onClick={() => {
						if (!categoryFilters.includes(Categories.film))
							setCategoryFilters((prev: Categories[]) => [
								...prev,
								Categories.film,
							]);
						else
							setCategoryFilters((prev: Categories[]) =>
								prev.filter((c) => c !== Categories.film),
							);
					}}
					className={`${categoryFilters.includes(Categories.film) ? "bg-[#faff00] text-black" : "text-gray-300"} rounded p-2 m-2 border border-[#faff00]`}
				>
					film
				</button>
				<button
					onClick={() => {
						if (!categoryFilters.includes(Categories.poetry))
							setCategoryFilters((prev: Categories[]) => [
								...prev,
								Categories.poetry,
							]);
						else
							setCategoryFilters((prev: Categories[]) =>
								prev.filter((c) => c !== Categories.poetry),
							);
					}}
					className={`${categoryFilters.includes(Categories.poetry) ? "bg-[#faff00] text-black" : "text-gray-300"} rounded p-2 m-2 border border-[#faff00]`}
				>
					poetry
				</button>
				<button
					onClick={() => {
						if (!categoryFilters.includes(Categories.comedy))
							setCategoryFilters((prev: Categories[]) => [
								...prev,
								Categories.comedy,
							]);
						else
							setCategoryFilters((prev: Categories[]) =>
								prev.filter((c) => c !== Categories.comedy),
							);
					}}
					className={`${categoryFilters.includes(Categories.comedy) ? "bg-[#faff00] text-black" : "text-gray-300"} rounded p-2 m-2 border border-[#faff00]`}
				>
					comedy
				</button>
				<div className="input-container">
					<Search className="absolute text-gray-200 right-[90%]" />
					<input
						type="text"
						ref={inputRef}
						className="search-input focus:outline-none"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setSearchQuery(e.target.value)
						}
						value={searchQuery}
					/>
				</div>
			</div>
		);
	}

	useEffect(() => {
		inputRef.current?.focus();
	});

	useEffect(() => {
		fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/other-events`)
			.then(async (response: Response) => {
				const body = await response.json();
				setEvents(body.events);
			})
			.catch((err) => console.log(err));

	}, [])

	useEffect(() => {
		console.log(categoryFilters);
		const tmpRealEvents: types.OtherEvent[] = [];
		const tmpEvents = [...events];
		for (const e of tmpEvents) {
			const tmpE = { ...e };
			tmpE.title = `${e.title} @ ${e.venue}`;
			const [startMonth, startDay, startYear] = tmpE.start.toString().split("/");
			const [endMonth, endDay, endYear] = tmpE.end.toString().split("/");
			tmpE.start = new Date(
				parseInt(startYear),
				parseInt(startMonth) - 1,
				parseInt(startDay),
			);
			tmpE.end = new Date(
				parseInt(endYear),
				parseInt(endMonth) - 1,
				parseInt(endDay),
			);
			tmpRealEvents.push(tmpE);
		}
		const categoryFilterStrings: any = [];
		setRealEvents(
			tmpRealEvents.filter((e: types.OtherEvent) => {
				if (categoryFilters.includes(Categories.visualArts)) {
					categoryFilterStrings.push("visual arts");
				}

				if (categoryFilters.includes(Categories.theater)) {
					categoryFilterStrings.push("theater");
				}

				if (categoryFilters.includes(Categories.poetry)) {
					categoryFilterStrings.push("poetry");
				}

				if (categoryFilters.includes(Categories.film)) {
					categoryFilterStrings.push("film");
				}

				if (categoryFilters.includes(Categories.comedy)) {
					categoryFilterStrings.push("comedy");
				}
				if (categoryFilterStrings.length > 0)
					return (
						categoryFilterStrings.includes(e.category.toLowerCase()) &&
						e.title.toLowerCase().includes(searchQuery)
					);
				else return e.title.toLowerCase().includes(searchQuery);
			}
			)
		)
	}, [searchQuery, categoryFilters, events]);

	useEffect(() => {
		console.log('real events');
		console.log(realEvents);
	}, [realEvents])

	const handlePrevMonth = () => {
		setCurrentDate((prevDate) => moment(prevDate).subtract(1, "month").toDate());
	};

	const handleNextMonth = () => {
		setCurrentDate((prevDate) => moment(prevDate).add(1, "month").toDate());
	};

	return (
		<div className={`${customClasses} art`}>
			<div className="flex"></div>
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
							{moment(currentDate).format("MMMM").toLowerCase()}
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
					<Calendar
						date={currentDate}
						components={{
							month: { dateHeader: CustomMonthDateHeader },
							event: CustomEvent,
							toolbar: CustomToolbar,
						}}
						views={["month"]}
						defaultDate={new Date()}
						localizer={localizer}
						events={realEvents}
					/>
				</div>
			</div>
		</div>
	);
}

export default function OtherCalendar() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(true);
	}, []);
	return (
		<div className="min-h-screen">
			{ready && (
				<div className="other-calendar">
					<DesktopCalendar customClasses={"hidden md:block"} />
					<MobileCalendar customClasses={"md:hidden"} />
				</div>
			)}
		</div>
	);
}
