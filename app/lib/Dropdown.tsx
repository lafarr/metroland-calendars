'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function Dropdown({ current }: { current: string }) {
	const options = ['Music', 'Other'];
	const router = useRouter();

	// Set the first item as the default selected option
	const [selected, setSelected] = useState(current);

	return (
		<div className="p-4 bg-[#2a2727]">
			<select
				id="my-dropdown"
				value={selected}
				onChange={(e) => {
					setSelected(e.target.value);
					router.push(`/${e.target.value.toLowerCase()}-calendar`);
				}}
				className="outline-none text-gray-300 border-gray-700 p-4 bg-[#2a2727] border border-gray-300 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-blue-500"
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

