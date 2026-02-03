import React from 'react';

type ButtonProps = {
	text: string;
	onClick: () => void;
	variant: 'filled' | 'outlined';
};

const Button = ({ text, onClick, variant }: ButtonProps) => {
	return (
		<button
			type="submit"
			onClick={onClick}
			className={`px-4 py-2 rounded w-[150px] h-[50px] ${
				variant === 'filled'
					? 'bg-blue-500 text-white hover:bg-blue-700'
					: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50'
			}`}
		>
			{text}
		</button>
	);
};

export default Button;
