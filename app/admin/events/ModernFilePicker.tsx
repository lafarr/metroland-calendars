'use client';

import React, { useState, useRef } from 'react';

const ModernFilePicker = (props: any) => {
	const [file, setFile] = useState<any>(null);
	const fileInputRef = useRef<any>(null);

	const handleFileChange = (event: any) => {
		const selectedFile = event.target.files[0];
		if (selectedFile) {
			setFile(selectedFile);
			if (props.onChange) {
				props.onChange(selectedFile);
			}
		}
	};

	const handleDragOver = (event: any) => {
		event.preventDefault();
	};

	const handleDrop = (event: any) => {
		event.preventDefault();
		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile) {
			setFile(droppedFile);
			if (props.onChange) {
				props.onChange(droppedFile);
			}
		}
	};

	const handleDelete = () => {
		setFile(null);
		if (props.onChange) {
			props.onChange(null);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleReplace = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div
			style={{
				width: '100%',
				maxWidth: '100%',
				margin: '20px auto',
				fontFamily: 'Arial, sans-serif',
			}}
		>
			<div
				style={{
					border: '1px solid #e0e0e0',
					borderRadius: '10px',
					padding: '20px',
					textAlign: 'center',
					cursor: 'pointer',
					transition: 'background-color 0.3s',
					backgroundColor: '#2a2727',
				}}
				onClick={() => fileInputRef.current.click()}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept={props.type === 'image' ? '*' : '.xlsx, .xls'}
					style={{ display: 'none' }}
				/>
				{file ? (
					<div>
						{props.type === 'image' &&
							<>
								<img
									src={URL.createObjectURL(file)}
									alt="Selected file"
									style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px' }}
								/>
								<p style={{ margin: '0', fontSize: '14px', color: 'lightgray' }}>{file.name}</p>
							</>
						}
						{props.type !== 'image' &&
							<>
								<p style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px' }}><strong>Selected File</strong> </p>
								<p style={{ margin: '0', fontSize: '14px', color: 'lightgray' }}>{file.name}</p>
							</>
						}
					</div>
				) : (
					<div>
						<p style={{ margin: '0', fontSize: '16px', color: 'lightgray' }}>
							{props.text}
						</p>
					</div>
				)}
			</div>
			{file && (
				<div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
					<button
						onClick={handleReplace}
						style={{
							backgroundColor: '#3498db',
							color: 'white',
							border: 'none',
							padding: '8px 16px',
							borderRadius: '5px',
							cursor: 'pointer',
							fontSize: '14px',
							display: 'flex',
							alignItems: 'center',
							marginLeft: '1vw',
							marginRight: '1vw'
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
							<polyline points="17 8 12 3 7 8"></polyline>
							<line x1="12" y1="3" x2="12" y2="15"></line>
						</svg>
						Replace
					</button>
					<button
						onClick={handleDelete}
						style={{
							backgroundColor: '#e74c3c',
							color: 'white',
							border: 'none',
							padding: '8px 16px',
							borderRadius: '5px',
							cursor: 'pointer',
							fontSize: '14px',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
							<polyline points="3 6 5 6 21 6"></polyline>
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
							<line x1="10" y1="11" x2="10" y2="17"></line>
							<line x1="14" y1="11" x2="14" y2="17"></line>
						</svg>
						Delete
					</button>
				</div>
			)}
		</div>
	);
};

export default ModernFilePicker;
