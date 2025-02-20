"use client";
import React from 'react';
import { MusicEvent, OtherEvent } from '@/app/lib/types';

const AdminEventCard = ({ event, eventType }: { event: MusicEvent | OtherEvent, eventType: string }) => {
	eventType = eventType.toLowerCase().trim();
	if (eventType === 'music' && 'artist' in event && 'date' in event && 'venue' in event && 'time' in event && 'link' in event) {
		return (
			<div className="event-card">
				<h3>{event.artist}</h3>
				<p className="event-date">{event.date}</p>
				<p className="event-venue">{event.venue}</p>
				<p className="event-date">{event.time}</p>
				<p><a className="event-link" href={event.link}>{event.link}</a></p>
			</div>
		);
	} else if (eventType === 'other' && 'title' in event && 'start' in event && 'end' in event && 'time' in event && 'link' in event && 'category' in event) {
		return (
			<div className="event-card bg-[#201f1f]">
				<h3 className="text-white">{event.title}</h3>
				<p className="event-date">{event.start} - {event.end}</p>
				<p className="event-date">{event.time}</p>
				<p><a className="event-link" target="_blank" rel="noopener noreferrer" href={event.link}>{event.link}</a></p>
				<p className="event-link">{event.category}</p>
			</div>
		);
	} else {
		return (
			<h1>Invalid event type</h1>
		);
	}
};

export default AdminEventCard;
