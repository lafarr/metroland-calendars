'use client';

import axios from 'axios';
import AdminEvent from './admin-event';
import './EventManagement.css';
import { useEffect, useState } from 'react';

export default function AdminEventsGrid({ eventType }: any) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (eventType === 'music') {
            axios.get('/api/events')
                .then(response => {
                    setEvents(response.data.events);
                })
                .catch(error => {
                    console.error('Error fetching events:', error);
                });
        } else if (eventType === 'other') {
            axios.get('/api/other-events')
                .then(response => {
                    setEvents(response.data.events);
                })
                .catch(error => {
                    console.error('Error fetching events:', error);
                });
        }
    }, [eventType]);

    return (
        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any) => (
                <AdminEvent eventType={eventType} key={event._id} event={event} />
            ))}
        </div>
    );
}
