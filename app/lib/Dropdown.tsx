'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function Dropdown({ current }: { current: string }) {
	const options = ['Music', 'Art', 'Theater'];
	const router = useRouter();

	// Set the first item as the default selected option
	const [selected, setSelected] = useState(options[0]);

	return (
		<div className="p-4 bg-[#2a2727]">
			<label htmlFor="my-dropdown" className="mr-2 font-medium">
				Choose an option:
			</label>
			<select
				id="my-dropdown"
				value={selected}
				onChange={(e) => setSelected(e.target.value)}
				onClick={() => router.push(`/${selected.toLowerCase()}-calendar`)}
				className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}

