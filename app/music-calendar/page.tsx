'use client';

import React, { useEffect, useState } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './ReactBigCalendar.css';
import Loading from "../loading";
import MobileCalendar from './mobile-calendar';
import DesktopCalendar from './desktop-calendar';
import Dropdown from '../lib/Dropdown';

export default function CustomCalendar() {
	const [isClient, setIsClient] = useState<boolean>(false);
	useEffect(() => {
		setIsClient(true);
	}, [])
	return (
		<>
			<Dropdown current={'Music'} />
			{isClient && <>
				<div className="hidden md:block">
					<DesktopCalendar />
				</div>
				<div className="md:hidden">
					<MobileCalendar />
				</div>
			</>}
			{!isClient && <Loading />}
		</>
	)
};
