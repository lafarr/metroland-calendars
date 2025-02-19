'use client';

import axios from 'axios';
import AdminEvent from './admin-event';
import './EventManagement.css';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminEventsGrid({ eventType }: any) {
	const [events, setEvents] = useState([]);
	const [gridIsLoading, setGridIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (eventType === 'music') {
			setGridIsLoading(true);
			axios.get('/api/events')
				.then(response => {
					setEvents(response.data.events);
					setGridIsLoading(false);
				})
				.catch(error => {
					console.error('Error fetching events:', error);
					setGridIsLoading(false);
				});
		} else if (eventType === 'other') {
			setGridIsLoading(true);
			axios.get('/api/other-events')
				.then(response => {
					setEvents(response.data.events);
					setGridIsLoading(false);
				})
				.catch(error => {
					console.error('Error fetching events:', error);
					setGridIsLoading(false);
				});
		}
	}, [eventType]);

	return (
		<>
			{gridIsLoading && (
				<div className="flex justify-center items-center mt-8">
					<Loader2 className="text-white animate-spin" size={24} />
				</div>
			)}
			{!gridIsLoading && <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{events.map((event: any) => (
					<AdminEvent eventType={eventType} key={event._id} event={event} />
				))}
			</div>}
		</>
	);
}
