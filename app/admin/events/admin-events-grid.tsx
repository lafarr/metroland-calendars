'use client';

import axios from 'axios';
import AdminEvent from './admin-event';
import './EventManagement.css';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { MusicEvent, OtherEvent } from '@/app/lib/types'

export default function AdminEventsGrid({ events }: Readonly<{ events: (MusicEvent|OtherEvent)[]}>) {
	const [gridIsLoading, setGridIsLoading] = useState<boolean>(true);

	useEffect(() => {
		setGridIsLoading(false);
	}, [events]);

	return (
		<>
			{gridIsLoading && (
				<div className="flex justify-center items-center mt-8">
					<Loader2 className="text-white animate-spin" size={24} />
				</div>
			)}
			{!gridIsLoading && <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{events.map((event: MusicEvent | OtherEvent) => (
					<AdminEvent eventType={'artist' in event ? 'music' : 'other' } key={event._id} event={event} />
				))}
			</div>}
		</>
	);
}
