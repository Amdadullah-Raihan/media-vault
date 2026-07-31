import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '@/services/auth.service';
import { Button, Input } from '@/components/ui';
import { APP_NAME } from '@/constants';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});
export default function LoginPage() {
    const navigate = useNavigate();
    const [login, { isLoading }] = useLoginMutation();
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = async (data) => {
        try {
            await login(data).unwrap();
            toast.success('Welcome back!');
            navigate('/');
        }
        catch (err) {
            const apiErr = err;
            toast.error(apiErr.data?.message ?? 'Invalid credentials');
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: _jsxs("div", { className: "w-full max-w-sm", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary", children: _jsx(Lock, { className: "h-6 w-6 text-primary-foreground" }) }), _jsx("h1", { className: "text-2xl font-bold tracking-tight", children: APP_NAME }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in to manage your media server" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { id: "username", label: "Username", placeholder: "Enter your username", error: errors.username?.message, autoFocus: true, ...register('username') }), _jsx(Input, { id: "password", label: "Password", type: "password", placeholder: "Enter your password", error: errors.password?.message, ...register('password') }), _jsx(Button, { type: "submit", className: "w-full", loading: isLoading, children: "Sign in" })] }), _jsx("p", { className: "mt-6 text-center text-xs text-muted-foreground", children: "MediaVault v1.0.0 \u2014 Self-hosted media management" })] }) }));
}
//# sourceMappingURL=login.js.map