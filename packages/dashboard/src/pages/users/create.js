import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUserMutation } from '@/services/users.service';
import { useGetRolesQuery } from '@/services/roles.service';
import { Button, Input, Select } from '@/components/ui';
import { ROUTES } from '@/constants';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
const createUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    roleId: z.string().min(1, 'Role is required'),
});
export default function UserCreatePage() {
    const navigate = useNavigate();
    const [createUser, { isLoading }] = useCreateUserMutation();
    const { data: rolesData } = useGetRolesQuery();
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            roleId: 'viewer',
        },
    });
    const roles = rolesData?.data ?? [];
    const onSubmit = async (data) => {
        try {
            await createUser(data).unwrap();
            toast.success('User created successfully');
            navigate(ROUTES.USERS);
        }
        catch (err) {
            const apiErr = err;
            toast.error(apiErr.data?.message ?? 'Failed to create user');
        }
    };
    return (_jsxs("div", { className: "mx-auto max-w-lg space-y-6", children: [_jsxs("button", { onClick: () => {
                    navigate(ROUTES.USERS);
                }, className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Users"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Create User" }), _jsx("p", { className: "text-muted-foreground", children: "Add a new administrator to MediaVault." })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { id: "firstName", label: "First Name", placeholder: "John", error: errors.firstName?.message, ...register('firstName') }), _jsx(Input, { id: "lastName", label: "Last Name", placeholder: "Doe", error: errors.lastName?.message, ...register('lastName') })] }), _jsx(Input, { id: "username", label: "Username", placeholder: "johndoe", error: errors.username?.message, ...register('username') }), _jsx(Input, { id: "email", label: "Email", type: "email", placeholder: "john@mediavault.local", error: errors.email?.message, ...register('email') }), _jsx(Input, { id: "password", label: "Password", type: "password", placeholder: "Minimum 8 characters", error: errors.password?.message, ...register('password') }), _jsx(Select, { id: "roleId", label: "Role", error: errors.roleId?.message, ...register('roleId'), options: roles.map((r) => ({
                            value: r.id,
                            label: r.name,
                        })) }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "submit", loading: isLoading, children: "Create User" }), _jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                    navigate(ROUTES.USERS);
                                }, children: "Cancel" })] })] })] }));
}
//# sourceMappingURL=create.js.map