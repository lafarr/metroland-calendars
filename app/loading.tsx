export default function Loading() {
	const css = `body { background-color: #2a2727; }`
	return (
		<div className="h-[90vh] w-screen flex justify-center align-center">
		<style>{css}</style>
			<img className="w-[90%] object-contain" src="/loading.png" />
		</div>
	)
}

