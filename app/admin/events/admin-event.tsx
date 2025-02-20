import React from 'react';
import { MusicEvent, OtherEvent } from '@/app/lib/types';

const MusicEventCard = ({ event }: { event: MusicEvent }) => (
	<div className="event-card">
		<h3>{event.artist}</h3>
		<p className="event-date">{typeof event.date === 'string' ? event.date : event.date.toLocaleDateString()}</p>
		<p className="event-venue">{event.venue}</p>
		<p className="event-date">{event.time}</p>
		<p><a className="event-link" href={event.link}>{event.link}</a></p>
	</div>
);

const OtherEventCard = ({ event }: { event: OtherEvent }) => (
	<div className="event-card bg-[#201f1f]">
		<h3 className="text-white">{event.title}</h3>
		<p className="event-date">
			{typeof event.start === 'string' ? event.start : event.start.toLocaleDateString()} - 
			{typeof event.end === 'string' ? event.end : event.end.toLocaleDateString()}
		</p>
		<p className="event-date">{event.time}</p>
		<p><a className="event-link" target="_blank" rel="noopener noreferrer" href={event.link}>{event.link}</a></p>
		<p className="event-link">{event.category}</p>
	</div>
);

const AdminEventCard = ({ event, eventType }: { event: MusicEvent | OtherEvent, eventType: string }) => {
	if (eventType.toLowerCase().trim() === 'music' && 'artist' in event) {
		return <MusicEventCard event={event} />;
	}
	
	if (eventType.toLowerCase().trim() === 'other' && 'title' in event) {
		return <OtherEventCard event={event} />;
	}

	return <h1>Invalid event type</h1>;
};

export default AdminEventCard;
