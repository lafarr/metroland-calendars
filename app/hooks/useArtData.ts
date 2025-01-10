import { useEffect, useState } from "react";

export function useMobileMusicData(selectedDate: Date, setFilteredEvents: any, setDisplayedEvents: any, showAllEvents: any): (any | Function)[] {
	const [musicData, setMusicData] = useState<any[] | null>(null);

	function fetchData(selectedDate: Date) {
		return fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
			.then((res: any) => {
				return res.json()
					.then(({ events }: any) => {
						// TODO: Fix the times mobile music data
						const realEvents = events?.map((boop: any) => ({ ...boop, start: new Date(boop.start), end: new Date(boop.end), date: new Date(boop.date) }));
						const relevantEvents = realEvents?.filter((event: any) => event.date.getMonth() === selectedDate.getMonth() && event.date.getDate() === selectedDate.getDate() && event.date.getFullYear() === selectedDate.getFullYear()); setMusicData(relevantEvents);
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

	return [musicData, fetchData];
}

