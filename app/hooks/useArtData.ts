import { useEffect, useState } from "react";
import * as types from '@/app/lib/types';
export function useMobileMusicData(selectedDate: Date, setFilteredEvents: (events: types.MusicEvent[]|null) => void, setDisplayedEvents: (events: types.MusicEvent[]) => void, showAllEvents: boolean): [types.MusicEvent[], (date: Date) => Promise<types.MusicEvent[]|null>] {
	const [musicData, setMusicData] = useState<types.MusicEvent[] | null>(null);

	function fetchData(selectedDate: Date) {
		return fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
			.then((res: Response) => {
				return res.json()
					.then(({ events }: { events: (types.MusicEvent & { start: Date, end: Date })[] }) => {
						const realEvents = events?.map((event: (types.MusicEvent & { start: Date, end: Date })) => ({
							...event,
							start: new Date(event.start),
							end: new Date(event.end),
							date: new Date(event.date)
						}));

						const relevantEvents = realEvents?.filter(event => 
							event.date.getMonth() === selectedDate.getMonth() && 
							event.date.getDate() === selectedDate.getDate() && 
							event.date.getFullYear() === selectedDate.getFullYear()
						);

						setMusicData(relevantEvents);
						return relevantEvents;
					})
			})
	}

	useEffect(() => {
		fetchData(selectedDate)
			.then((res) => {
				setMusicData(res);
				setFilteredEvents(res);
				setDisplayedEvents(showAllEvents ? res : res?.slice(0, 4));
			});
	}, [selectedDate, showAllEvents])

	return [musicData || [], fetchData];
}
