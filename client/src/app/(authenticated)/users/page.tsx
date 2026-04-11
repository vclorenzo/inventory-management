'use client';
import Header from '@/components/Header';
import { useUsers } from '@/hooks/useUsers';
import { CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Props = {};

const columns: GridColDef[] = [
	{ field: 'userId', headerName: 'ID', width: 90 },
	{ field: 'name', headerName: 'Name', width: 200 },
	{ field: 'email', headerName: 'Email', width: 200 },
];

const Users = (props: Props) => {
	const { users, error, isLoading } = useUsers();

	if (isLoading) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		);
	}

	if (error || !users) {
		return (
			<div className="text-center text-red-500 py-4">Failed to fetch users</div>
		);
	}
	return (
		<div className="flex flex-col">
			<Header name="Users" />
			<DataGrid
				rows={users}
				columns={columns}
				getRowId={(row) => row.userId}
				checkboxSelection
				className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
			/>
		</div>
	);
};

export default Users;
