import { Interface } from "readline";

export interface ModernFilePickerProps {
  onChange?: (file: File | null) => void;
  type: 'image' | 'csv';
  text: string;
}

export interface MusicEvent {
	_id: string;
	artist: string;
	date: string|Date;
	venue: string;
	time: string;
	eventType?: string;
}

export interface OtherEvent {
	_id: string;
	title: string;
	start: string|Date;
	end: string|Date;
	time: string;
	link: string;
	venue: string;
	category: string;
	eventType?: string;
}

export interface Filter {
	artist: string;
	date: string;
	venue: string;
	town: string;
}

export interface CustomToolbarProps {
    filterValue: string;
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setShowingMonthly: (value: boolean) => void;
    setShowingWeekly: (value: boolean) => void;
    setView: (view: string) => void;
    view: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
}
