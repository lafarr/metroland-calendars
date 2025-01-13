'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Plus, Save, X, Filter, Trash2 } from 'lucide-react';
import './EventManagement.css';
import axios from 'axios';
import ModernFilePicker from './ModernFilePicker';

const EventCard = ({ event, onEdit, onDelete, onSave, onCancel, isEditing }: any) => {
	const [editedEvent, setEditedEvent] = useState<any>(event);

	const handleInputChange = (e: any) => {
		let { name, value } = e.target;
		if (name === 'date') {
			let [year, month, day] = value.split('-');
			year = year.substring(2);
			if (month.length === 2 && month.charAt(0) === '0') {
				month = month.charAt(1);
			}
			if (day.length === 2 && day.charAt(0) === '0') {
				day = day.charAt(1);
			}
			value = `${month}/${day}/${year}`;
		}
		setEditedEvent({ ...editedEvent, [name]: value });
	};

	function fixTime(timeToFix: any) {
		const withSpaceRegex = /(?<hours>\d\d?):(?<minutes>\d\d) (?<timeOfDay>([pP][mM])|([aA][mM]))/g;
		const withoutSpaceRegex = /(?<hours>\d\d?):(?<minutes>\d\d)(?<timeOfDay>([pP][mM])|([aA][mM]))/g;
		const hasSpace = withSpaceRegex.exec(timeToFix);
		const noSpace = withoutSpaceRegex.exec(timeToFix);
		if (hasSpace || noSpace) {
			const res = hasSpace ? hasSpace : noSpace;
			let { hours, minutes, timeOfDay }: any = res?.groups;
			if (hours === '12' && timeOfDay.toLowerCase() === 'am') {
				hours = '00';
			} else if (timeOfDay.toLowerCase() === 'pm') {
				hours = (parseInt(hours) + 12).toString();
			}
			return `${hours}:${minutes}`;
		}
	}

	function fixDate(date: string) {
		let [month, day, year] = date.split('/');
		if (year.length === 2) {
			year = '20' + year;
		}
		if (month.length === 1) {
			month = '0' + month;
		}
		if (day.length === 1) {
			day = '0' + day;
		}
		return `${year}-${month}-${day}`;
	}

	if (isEditing) {
		return (
			<div className="event-card editing">
				<label htmlFor="artist">Artist Name</label>
				<input
					id="artist"
					type="text"
					name="artist"
					value={editedEvent.artist}
					onChange={handleInputChange}
					placeholder="Artist Name"
				/>
				<label htmlFor="date">Date</label>
				<input
					id="date"
					type="date"
					name="date"
					value={fixDate(editedEvent.date)}
					onChange={handleInputChange}
				/>
				<label htmlFor="venue">Venue</label>
				<input
					id="venue"
					type="text"
					name="venue"
					value={editedEvent.venue}
					onChange={handleInputChange}
					placeholder="Venue"
				/>
				<label htmlFor="time">Time</label>
				<input
					type="time"
					id="time"
					name="time"
					value={fixTime(editedEvent.time)}
					onChange={handleInputChange}
					placeholder="Event Time"
				/>
				<label htmlFor="link">Link</label>
				<input
					type="text"
					id="link"
					name="link"
					value={editedEvent.link}
					onChange={handleInputChange}
					placeholder="Link"
				/>
				<div className="button-group">
					<button onClick={() => onSave(editedEvent)} className="save-button">
						<Save size={16} /> Save
					</button>
					<button onClick={onCancel} className="cancel-button">
						<X size={16} /> Cancel
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="event-card">
			<h3>{event.artist}</h3>
			<p className="event-date">{event.date}</p>
			<p className="event-venue">{event.venue}</p>
			<p className="event-date">{event.time}</p>
			<p><a className="event-link" href={event.link}>{event.link}</a></p>
			<div className="button-group">
				<button onClick={onEdit} className="edit-button">
					<Edit size={16} /> Edit
				</button>
				<button onClick={() => onDelete(event.id)} className="delete-button">
					<Trash2 size={16} /> Delete
				</button>
			</div>
		</div>
	);
};

const AdminEvents = () => {
	const [events, setEvents] = useState<any>([]);

	const [editingId, setEditingId] = useState<any>(null);
	const [showAddForm, setShowAddForm] = useState<boolean>(false);
	const [newEvent, setNewEvent] = useState<any>({ artist: '', date: new Date().toISOString().split('T')[0], venue: '', town: '', time: '00:00', link: '' });
	const [filters, setFilters] = useState<any>({ artist: '', date: '', venue: '', town: '' });
	const [filteredEvents, setFilteredEvents] = useState<any[]>(events);
	const [csv, setCsv] = useState<any>(null);
	const [selectedCsvType, setSelectedCsvType] = useState<string>('music');

	function csvToBase64(file: any) {
		if (file) {
			const reader = new FileReader();
			reader.onload = (e: any) => {
				const base64 = e?.target?.result?.split(',')[1];
				setCsv(base64);
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
		const filtered = events.filter((event: any) => {
			const [month, day, year] = event.date.split('/');
			const filterDate = `20${year}-${month}-${day}`;
			return (
				event.artist.toLowerCase().includes(filters.artist.toLowerCase()) &&
				(filterDate === filters.date || !filters.date) &&
				event.venue.toLowerCase().includes(filters.venue.toLowerCase())
			)
		});
		setFilteredEvents(filtered);
	}, [events, filters]);

	const handleEdit = (id: any) => {
		setEditingId(id);
	};

	const handleSave = (editedEvent: any) => {
		axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`, {
			_id: editedEvent._id,
			artist: editedEvent.artist,
			venue: editedEvent.venue,
			date: editedEvent.date,
			time: editedEvent.time,
			link: editedEvent.link
		})
			.then(_ => {
				setEditingId(null);
				axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
					.then(res => {
						setEvents(res.data.events || []);
					});
			})
			.catch(err => console.log(err));
	};

	const handleCancel = () => {
		setEditingId(null);
	};

	const handleDelete = (id: any) => {
		axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/api/events?id=${id}`)
			.then(_ => {
				axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
					.then(res => {
						setEvents(res.data.events || []);
					});
			})
			.catch(err => console.log(err));
	};

	const handleAddInputChange = (e: any) => {
		const { name, value } = e.target;
		setNewEvent({ ...newEvent, [name]: value });
	};

	function cleanDate(date: any) {
		const [year, month, day] = date.split('-');
		return `${month}/${day}/${year}`;
	}

	function cleanTime(time: any) {
		const chunks = time.split(':');
		let hours = chunks[2];
		const minutes = chunks[1];
		let isPm = false;

		if (hours > 12) {
			hours -= 12;
			isPm = true;
		}

		return `${hours}:${minutes} ${isPm ? 'PM' : 'AM'}`;
	}

	const handleAddEvent = () => {
		if (newEvent.artist && newEvent.date) {
			setNewEvent({ artist: '', date: new Date().toISOString().split('T')[0], venue: '', town: '', time: '00:00', link: '' });
			setShowAddForm(false);
			axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/events`, {
				artist: newEvent.artist,
				date: cleanDate(newEvent.date),
				venue: newEvent.venue,
				town: newEvent.town,
				time: cleanTime(newEvent.time),
				link: newEvent.link
			})
				.then(_ => {
					axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
						.then(res => {
							setEvents(res.data.events || []);
						});
				})
				.catch(err => console.log(err));
		}
	};

	const handleFilterChange = (e: any) => {
		const { name, value } = e.target;
		setFilters({ ...filters, [name]: value });
	};

	function handleCsvSubmit() {
		console.log(`USING selectedCsvType=${selectedCsvType}`);
		axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/csv`, {
			file: csv,
			type: selectedCsvType
		})
			.then((res: any) => {
				axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/events`)
					.then(res => {
						setEvents(res.data.events || []);
						setShowAddForm(false);
					});
			})
			.catch(err => console.log(err));
	}

	return (
		<div className="event-management-container">
			<h1>Event Management</h1>
			<div className="controls">
				<button onClick={() => setShowAddForm(true)} className="add-event-button">
					<Plus size={16} /> Add New Event
				</button>
				<div className="filter-controls">
					<Filter size={16} />
					<input
						type="text"
						name="artist"
						value={filters.artist}
						onChange={handleFilterChange}
						placeholder="Filter by artist"
					/>
					<input
						type="date"
						name="date"
						value={filters.date}
						onChange={handleFilterChange}
					/>
					<input
						type="text"
						name="venue"
						value={filters.venue}
						onChange={handleFilterChange}
						placeholder="Filter by venue"
					/>
				</div>
			</div>
			{showAddForm && (
				<div className="add-event-form">
					<input
						type="text"
						name="artist"
						value={newEvent.artist}
						onChange={handleAddInputChange}
						placeholder="Artist Name"
					/>
					<input
						type="date"
						name="date"
						value={newEvent.date ? newEvent.date : new Date().toISOString().split('T')[0]}
						onChange={handleAddInputChange}
					/>
					<input
						type="text"
						name="venue"
						value={newEvent.venue}
						onChange={handleAddInputChange}
						placeholder="Venue"
					/>
					<input
						type="text"
						name="town"
						value={newEvent.town}
						onChange={handleAddInputChange}
						placeholder="Town"
					/>
					<input
						type="time"
						name="time"
						value={newEvent.time == '' ? '00:00' : newEvent.time}
						onChange={handleAddInputChange}
					/>
					<input
						type="text"
						name="link"
						value={newEvent.link}
						placeholder={'Link'}
						onChange={handleAddInputChange}
					/>
					<div className="button-group">
						<button onClick={handleAddEvent} className="save-button">
							<Save size={16} /> Add Event
						</button>
						<button onClick={() => {
							setShowAddForm(false)
							setNewEvent({ artist: '', date: new Date().toISOString().split('T')[0], venue: '', town: '', time: '00:00', link: '' });
						}} className="cancel-button">
							<X size={16} /> Cancel
						</button>
					</div>
					<div className='w-full'>
						<p className="text-center text-gray-400 mt-[2.5vh] mb-[2.5vh]">OR</p>
						<div className="flex justify-center">
							<button onClick={() => setSelectedCsvType('music')} className={`${selectedCsvType !== 'music' ? 'hover:opacity-75 ' : ''}m-auto rounded h-10 w-80 text-black bg-[#faff00]${selectedCsvType === 'music' ? ' opacity-30' : ' opacity-100'}`}>Music events</button>
							<button onClick={() => setSelectedCsvType('other')} className={`${selectedCsvType !== 'other' ? 'hover:opacity-75 ' : ''}m-auto rounded h-10 w-80 text-black bg-[#faff00]${selectedCsvType === 'other' ? ' opacity-30' : ' opacity-100'}`}>Other events</button>
						</div>
						<ModernFilePicker onChange={csvToBase64} text={'Click or drag and drop to upload an Excel file'} />
						<div className='flex justify-center'>
							<button onClick={handleCsvSubmit}
								className="m-auto rounded h-10 w-80 text-white bg-[#4CAF50]">
								Add Excel Events
							</button>
						</div>
					</div>
				</div>
			)}
			<div className="event-grid">
				{filteredEvents.map((event: any) => (
					<EventCard
						key={event._id}
						event={event}
						onEdit={() => handleEdit(event.id)}
						onDelete={() => handleDelete(event._id)}
						onSave={handleSave}
						onCancel={handleCancel}
						isEditing={editingId === event.id}
					/>
				))}
			</div>
		</div>
	);
};

export default AdminEvents;
