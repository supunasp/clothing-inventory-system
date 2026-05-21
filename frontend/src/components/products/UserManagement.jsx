import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialUsers = [
    {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        role: "staff",
    },
    {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@email.com",
        role: "staff",
    },
    {
        id: 3,
        firstName: "Admin",
        lastName: "User",
        email: "admin@email.com",
        role: "admin",
    },
];

const UserManagement = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState(initialUsers);
    const [searchText, setSearchText] = useState("");

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        if (!normalizedSearch) {
            return users;
        }

        return users.filter((user) => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

            return (
                fullName.includes(normalizedSearch) ||
                user.email.toLowerCase().includes(normalizedSearch) ||
                user.role.toLowerCase().includes(normalizedSearch)
            );
        });
    }, [searchText, users]);

    const handleRoleChange = (userId, role) => {
        setUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === userId
                    ? {
                        ...user,
                        role,
                    }
                    : user
            )
        );
    };

    return (
        <>
            <div className="mb-5 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="text-xl text-gray-700 hover:text-gray-900"
                    aria-label="Back to dashboard"
                >
                    ←
                </button>

                <h1 className="text-lg font-semibold text-gray-900">
                    Users
                </h1>
            </div>

            <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <h2 className="text-sm font-medium text-gray-900">
                        Users
                    </h2>

                    <div className="relative w-full max-w-sm">
                        <Search
                            size={16}
                            strokeWidth={1.8}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-hidden="true"
                        />

                        <input
                            type="search"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Search"
                            className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-y border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-5 py-3 font-medium">First Name</th>
                            <th className="px-5 py-3 font-medium">Last Name</th>
                            <th className="px-5 py-3 font-medium">Email</th>
                            <th className="px-5 py-3 font-medium">Role</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-gray-100">
                                <td className="px-5 py-4 font-medium text-gray-900">
                                    {user.firstName}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {user.lastName}
                                </td>
                                <td className="px-5 py-4 text-gray-600">
                                    {user.email}
                                </td>
                                <td className="px-5 py-4">
                                    <select
                                        value={user.role}
                                        onChange={(event) =>
                                            handleRoleChange(user.id, event.target.value)
                                        }
                                        className="h-8 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium capitalize text-gray-700 outline-none focus:border-blue-500"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}

                        {filteredUsers.length === 0 && (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="px-5 py-8 text-center text-xs text-gray-500"
                                >
                                    No users found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-center gap-5 px-5 py-4 text-xs text-gray-600">
                    <button className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
                        ← Previous
                    </button>

                    <button className="rounded-md border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
                        Next →
                    </button>
                </div>
            </section>
        </>
    );
};

export default UserManagement;