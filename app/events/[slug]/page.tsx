'use client';

import styles from './EventList.module.css';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios, { AxiosResponse } from 'axios';
import * as types from '@/app/lib/types';
const EventList = () => {
	const params = useParams();
	const searchParams = useSearchParams();
	const slug = params.slug;
	const router = useRouter();
	const [events, setEvents] = useState<types.MusicEvent[] | types.OtherEvent[]>([]);
	const [niceDate, setNiceDate] = useState<string | null>(null);

	const generateSortedEvents = (events: types.MusicEvent[] | types.OtherEvent[]) => {
		const filteredEvents = events.filter((event: types.MusicEvent | types.OtherEvent) => RegExp(/\d\d?:\d\d?\s*[ap]m/).exec(event.time.toLowerCase())).sort((a: types.MusicEvent | types.OtherEvent, b: types.MusicEvent | types.OtherEvent) => {
			let [aTime, aMorningOrNight] = a.time.split(' ');
			aTime = aTime.toUpperCase();
			aMorningOrNight = aMorningOrNight.toUpperCase();

			let [aHours, aMinutes]: (string | number)[] = aTime.split(':');
			aHours = parseInt(aHours);
			aMinutes = parseInt(aMinutes);
			if (aMorningOrNight === 'PM') {
				aHours += 12;
				console.log('here are the sorted events: ');
				console.log(events);
			}

			const [bTime, bMorningOrNight] = b.time.split(' ');
			let [bHours, bMinutes]: (string | number)[] = bTime.split(':');
			bHours = parseInt(bHours);
			bMinutes = parseInt(bMinutes);
			if (bMorningOrNight === 'PM') {
				bHours += 12;
			}

			if (aHours === bHours && aMinutes === bMinutes) {
				return 0;
			} else if (aHours < bHours || (aHours === bHours && aMinutes < bMinutes)) {
				return -1;
			}
			return 1;
		})

		const nonConformingEvents = events.filter((event: types.MusicEvent | types.OtherEvent) => !RegExp(/\d\d?:\d\d?\s*[ap]m/).exec(event.time.toLowerCase()));
		for (const event of nonConformingEvents) {
			filteredEvents.push(event);
		}
		return (
			filteredEvents?.map((event: types.MusicEvent | types.OtherEvent) => {
				if (event.time.toLowerCase() === 'varies') {
					event.time = 'Varies';
				}
				return (
					<div className={styles.eventCard} key={event._id}>
						<div className={styles.eventTitle}>{event.artist || event.title}</div>
						<div className={styles.eventTime}>{event.time}</div>
						<div className={styles.eventTime}>{event.venue || ''}</div>
						<button onClick={() => window.open(event.link, '_blank')} className={`${styles.linkButton}`}>View Tickets/Venue</button>
					</div>
				)
			})
		)
	};

	useEffect(() => {
		if (typeof slug === 'string') {
			const [month, day, year] = slug.replaceAll('-', '/').split('/');
			const date = `${month}/${day}/${year}`;
			const otherDate = `${month}/${day}/${year.substring(2)}`;
			const query = searchParams.get('eventType');
			if (query === 'music') {
				axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
					.then((res: AxiosResponse) => {
						setEvents(res.data.events.filter((event: types.MusicEvent) => event.date === date || event.date === otherDate));

						const longDay = new Date(slug).toLocaleString('default', { weekday: 'long' });
						const longMonth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleString('default', { month: 'long' });
						console.log('longMonth: ' + (parseInt(month) - 1));
						setNiceDate(`${longDay}, ${longMonth} ${day}, ${year}`);
					})
			} else if (query === 'other') {
				axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/other-events`)
					.then((res: AxiosResponse) => {
						const filteredEvents = res.data.events.filter((event: types.OtherEvent) => {
							if (typeof event.start === 'string' && typeof event.end === 'string') {
								const [startMonth, startDay, startYear] = event.start.split('/');
								const [endMonth, endDay, endYear] = event.end.split('/');
								const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
								const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
								const [dateMonth, dateDay, dateYear] = date.split('/');
								const dateDate = new Date(parseInt(dateYear), parseInt(dateMonth) - 1, parseInt(dateDay));
								return startDate <= dateDate && endDate >= dateDate;
							}
							return false;
						})
						setEvents(filteredEvents);

						const longDay = new Date(slug).toLocaleString('default', { weekday: 'long' });
						const longMonth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleString('default', { month: 'long' });
						console.log('longMonth: ' + (parseInt(month) - 1));
						setNiceDate(`${longDay}, ${longMonth} ${day}, ${year}`);
					})
			}
		}
	}, [slug])

	return (
		<>
			<ArrowBackIcon className={styles.arrow} onClick={() => router.back()} style={{ color: 'lightgray', fontSize: '60px' }} />
			<div className={styles.container}>
				<header>
					<h1><span className={styles.musicNote}>🎵</span>Events</h1>
					<div className={styles.date} id="currentDate">{niceDate}</div>
				</header>
				<div className={styles.eventsContainer} id="eventsContainer">
					{events && generateSortedEvents(events)}
				</div>
			</div>
		</>
	)
};

export default EventList;

