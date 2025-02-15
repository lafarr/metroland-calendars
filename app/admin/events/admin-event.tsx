'use client';

const AdminEventCard = ({ event, eventType }: any) => {
    eventType = eventType.toLowerCase().trim();
    if (eventType === 'music') {
        return (
            <div className="event-card">
                <h3>{event.artist}</h3>
                <p className="event-date">{event.date}</p>
                <p className="event-venue">{event.venue}</p>
                <p className="event-date">{event.time}</p>
                <p><a className="event-link" href={event.link}>{event.link}</a></p>
            </div>
        );
    } else if (eventType === 'other') {
        // 
        // title: String,
        // venue: String,
        // start: String,
        // end: String,
        // category: String,
        // link: String,
        // time: String
        return (
            <div className="event-card bg-[#201f1f]">
                <h3>{event.title}</h3>
                <p className="event-date">{event.start} - {event.end}</p>
                <p className="event-date">{event.time}</p>
                <p><a className="event-link" href={event.link}>{event.link}</a></p>
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