import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { FileQuestion } from 'lucide-react';
export default function NotFoundPage() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center px-4", children: [_jsx("div", { className: "mb-6 rounded-full bg-muted p-4", children: _jsx(FileQuestion, { className: "h-8 w-8 text-muted-foreground" }) }), _jsx("h1", { className: "text-4xl font-bold", children: "404" }), _jsx("p", { className: "mt-2 text-lg text-muted-foreground", children: "Page not found" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }), _jsx(Button, { className: "mt-6", onClick: () => navigate('/'), children: "Go to Dashboard" })] }));
}
//# sourceMappingURL=not-found.js.map