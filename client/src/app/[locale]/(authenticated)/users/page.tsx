"use client";
import Header from "@/components/Header";
import { useUsers } from "@/hooks/useUsers";
import { CircularProgress } from "@mui/material";

type Props = {};

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
    </div>
  );
};

export default Users;
