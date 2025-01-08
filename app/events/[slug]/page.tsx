'use client';

import styles from './EventList.module.css';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const EventList = () => {
	const params = useParams();
	const searchParams = useSearchParams();
	const slug = params.slug;
	const router = useRouter();
	const [events, setEvents] = useState<any>(null);
	const [niceDate, setNiceDate] = useState<any>(null);

	const generateSortedEvents = (events: any) => {
		events = events.sort((a: any, b: any) => {
			console.log(a.time);
			let [aTime, aMorningOrNight] = a.time.split(' ');
			let [aHours, aMinutes] = aTime.split(':');
			aHours = parseInt(aHours);
			aMinutes = parseInt(aMinutes);
			if (aMorningOrNight === 'PM') {
				aHours += 12;
			}

			let [bTime, bMorningOrNight] = b.time.split(' ');
			let [bHours, bMinutes] = bTime.split(':');
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

		return (
			events?.map((event: any) => {
				return (
					<div className={styles.eventCard} key={event.id}>
						<div className={styles.eventTitle}>{event.artist}</div>
						<div className={styles.eventTime}>{event.time}</div>
						<div className={styles.eventTime}>{event.venue}</div>
						<button onClick={() => window.open(event.link, '_blank')} className={`${styles.linkButton}`}>View Tickets/Venue</button>
					</div>
				)
			})
		)
	};

	useEffect(() => {
		if (typeof slug === 'string') {
			const [month, day, year] = slug?.replaceAll('-', '/').split('/');
			let date = `${month}/${day}/${year}`;
			let otherDate = `${month}/${day}/${year.substring(2)}`;
			console.log('params: ');
			console.log(params);
			const query = searchParams.get('eventType');
			if (query === 'music') {
			axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
				.then((res: any) => {
					setEvents(res.data.events.filter((event: any) => event.date === date || event.date === otherDate));

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
			<ArrowBackIcon className={styles.arrow} onClick={() => router.push('/music-calendar')} style={{ color: 'lightgray', fontSize: '60px' }} />
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

