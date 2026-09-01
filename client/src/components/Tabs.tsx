'use client';

import { useState } from 'react';

type Tab = {
	label: string;
	content: React.ReactNode;
};

type TabsProps = {
	tabs: Tab[];
	defaultIndex?: number;
	activeIndex?: number;
	onChange?: (index: number) => void;
};

import React from 'react';

const Tabs = ({
	tabs,
	defaultIndex = 0,
	activeIndex: controlledIndex,
	onChange,
}: TabsProps) => {
	const [internalIndex, setInternalIndex] = useState(defaultIndex);
	const activeIndex = controlledIndex ?? internalIndex;

	const handleTabClick = (index: number) => {
		if (controlledIndex === undefined) {
			setInternalIndex(index);
		}
		onChange?.(index);
	};

	return (
		<div className="w-full">
			{/* Tab headers */}
			<div className="relative flex border-b border-gray-200">
				{tabs.map((tab, index) => {
					const isActive = index === activeIndex;

					return (
						<button
							key={tab.label}
							onClick={() => handleTabClick(index)}
							className={`
                relative px-4 py-2 text-sm font-medium transition-colors
                ${isActive ? 'text-black' : 'text-gray-500 hover:text-gray-700'}
              `}
						>
							{tab.label}

							{/* Active underline */}
							{isActive && (
								<span className="absolute inset-x-0 -bottom-px h-0.5 bg-black transition-all" />
							)}
						</button>
					);
				})}
			</div>

			{/* Tab content */}
			<div className="mt-4">
				<div key={activeIndex} className="animate-fade-in">
					{tabs[activeIndex].content}
				</div>
			</div>
		</div>
	);
};

export default Tabs;
