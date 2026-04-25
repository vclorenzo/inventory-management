export type AggregatedDataItem = {
	name: string;
	color?: string;
	amount: number;
};

export type AggregatedData = {
	[category: string]: AggregatedDataItem;
};
