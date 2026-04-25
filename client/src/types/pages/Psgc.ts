export type Region = {
	code: string;
	name: string;
	regionName: string;
	islandGroupCode: string;
	psgc10DigitCode: string;
};
export type Province = {
	code: string;
	name: string;
	regionCode: string;
	islandGroupCode: string;
};
export type City = {
	code: string;
	name: string;
	oldName: string;
	isCapital: boolean;
	districtCode: string;
	provinceCode: string;
	regionCode: string;
	islandGroupCode: string;
};
export type Barangay = {
	code: string;
	name: string;
	oldName: string;
	subMunicipalityCode: string;
	cityCode: string;
	municipalityCode: string;
	districtCode: string;
	provinceCode: string;
	regionCode: string;
	islandGroupCode: string;
};
