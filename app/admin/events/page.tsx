"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import './EventManagement.css';
import axios, { AxiosResponse } from 'axios';
import ModernFilePicker from './ModernFilePicker';
import AdminEventsGrid from './admin-events-grid';
import { Filter, MusicEvent, OtherEvent } from '@/app/lib/types';

const AdminEvents = () => {
	const [events, setEvents] = useState<MusicEvent[] | OtherEvent[]>([]);

	const [filters] = useState<Filter>({ artist: '', date: '', venue: '', town: '' });
	const [, setFilteredEvents] = useState<MusicEvent[] | OtherEvent[]>(events);
	const [csv, setCsv] = useState<string | null>(null);
	const [selectedCsvType, setSelectedCsvType] = useState<string>('music');
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
	const [fileUploadIsLoading, setFileUploadIsLoading] = useState<boolean>(false);
	const [selectedGridType, setSelectedGridType] = useState<string>('music');

	function csvToBase64(file: File | null) {
		if (file) {
			setUploadError(null);
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				const base64 = e.target?.result?.toString().split(',')[1];
				if (base64) {
					setCsv(base64);
				}
			};
			reader.readAsDataURL(file);
		}
	}

	useEffect(() => {
		axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
			.then((res) => {
				setEvents(res.data.events || []);
			})
			.catch(err => console.log(err));
	}, [])
	useEffect(() => {
		const filtered = events.filter((event): event is MusicEvent => {
			if (!('date' in event) || !('artist' in event) || !('venue' in event)) return false;
			if (typeof event.date === 'string') {
				const [month, day, year] = event.date.split('/');
				const filterDate = `20${year}-${month}-${day}`;
				return (
					event.artist.toLowerCase().includes(filters.artist.toLowerCase()) &&
					(filterDate === filters.date || !filters.date) &&
					event.venue.toLowerCase().includes(filters.venue.toLowerCase())
				)
			}
			return false;
		});
		setFilteredEvents(filtered);
	}, [events, filters]);

	function handleCsvSubmit() {
		setFileUploadIsLoading(true);
		axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/csv`, {
			file: csv,
			type: selectedCsvType
		})
			.then((_: AxiosResponse) => {
				axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
					.then(res => {
						setEvents(res.data.events || []);
						setUploadError(null);
						setUploadSuccess(true);
						setTimeout(() => setUploadSuccess(false), 5000);
						setFileUploadIsLoading(false);
					});
			})
			.catch(err => {
				setUploadError(err.response?.data?.message || 'An error occurred while uploading the file');
				setUploadSuccess(false);
				setFileUploadIsLoading(false);
			});
	}

	return (
		<div className="event-management-container">
			<h1 className="text-gray-300">Event Management</h1>
			<div className="controls">
			</div>
			<div className="add-event-form">
				{uploadError && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
						<span className="block sm:inline">{uploadError}</span>
					</div>
				)}
				{uploadSuccess && (
					<div className="bg-green-100 border text-center border-green-400 text-black px-4 py-3 rounded relative mb-4 animate-[slideIn_1.3s_ease-in-out]">
						<span className="block sm:inline">Upload successful</span>
					</div>
				)}
				<div className='w-full'>
					{fileUploadIsLoading && (
						<div className="flex justify-center items-center">
							<Loader2 className="text-white animate-spin" size={24} />
						</div>
					)}
					{!fileUploadIsLoading && <>
						<div className="flex justify-center gap-4">
							<button onClick={() => setSelectedCsvType('music')} className={`${selectedCsvType !== 'music' ? 'hover:opacity-75 ' : ''}rounded h-10 w-80 text-black bg-[#faff00]${selectedCsvType === 'music' ? ' opacity-30' : ' opacity-100'}`}>Music events</button>
							<button onClick={() => setSelectedCsvType('other')} className={`${selectedCsvType !== 'other' ? 'hover:opacity-75 ' : ''}rounded h-10 w-80 text-black bg-[#faff00]${selectedCsvType === 'other' ? ' opacity-30' : ' opacity-100'}`}>Other events</button>
						</div>
						<ModernFilePicker onChange={csvToBase64} text={'Click or drag and drop to upload an Excel file'} type={'csv'} />
						<div className='flex justify-center gap-4'>
							<button onClick={handleCsvSubmit}
								className="rounded h-10 w-80 text-white bg-[#4CAF50]">
								Add Excel Events
							</button>
						</div>
					</>}
				</div>
			</div>
			<div className='flex justify-center gap-4'>
				<button onClick={() => setSelectedGridType('music')}
					className={`${selectedGridType !== 'music' ? 'hover:opacity-75 ' : ''}
				rounded h-10 w-80 text-black bg-[#faff00]${selectedGridType === 'music' ? ' opacity-30' : ' opacity-100'}`}>
					Music events
				</button>
				<button onClick={() => setSelectedGridType('other')}
					className={`${selectedGridType !== 'other' ? 'hover:opacity-75 ' : ''}
				rounded h-10 w-80 text-black bg-[#faff00]${selectedGridType === 'other' ? ' opacity-30' : ' opacity-100'}`}>
					Other events
				</button>
			</div>
			<AdminEventsGrid eventType={selectedGridType} />
		</div>
	);
};

export default AdminEvents;
