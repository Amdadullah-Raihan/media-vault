import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/ui';
import { Activity } from 'lucide-react';
export default function LogsPage() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Activity Logs", description: "View recent activity and server logs." }), _jsx(EmptyState, { icon: _jsx(Activity, { className: "h-6 w-6" }), title: "Coming soon", description: "Activity logs will be available in a future update." })] }));
}
//# sourceMappingURL=logs.js.map