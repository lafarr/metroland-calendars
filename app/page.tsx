import { redirect } from 'next/navigation'

export default function Home() {
	// /music-calendar should always be the default
	redirect('/music-calendar');
}
