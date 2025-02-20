export interface MusicEvent {
	_id: string;
	artist: string;
	date: string|Date;
	venue: string;
	time: string;
	link: string;
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
}

export interface Filter {
	artist: string;
	date: string;
	venue: string;
	town: string;
}
