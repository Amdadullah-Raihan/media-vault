import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProjectMutation } from '@/services/projects.service';
import { PageHeader } from '@/components/shared';
import { Button, Input, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
const createSchema = z.object({
    name: z
        .string()
        .min(1, 'Project name is required')
        .max(100, 'Name must be 100 characters or less')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores'),
    description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});
export default function ProjectCreatePage() {
    const navigate = useNavigate();
    const [createProject, { isLoading }] = useCreateProjectMutation();
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(createSchema),
    });
    const onSubmit = async (data) => {
        try {
            const result = await createProject({
                name: data.name,
                description: data.description ?? null,
            }).unwrap();
            toast.success('Project created');
            navigate(`/projects/${result.data.id}`);
        }
        catch (err) {
            const apiErr = err;
            toast.error(apiErr?.data?.message ?? 'Failed to create project');
        }
    };
    return (_jsxs("div", { className: "mx-auto max-w-lg space-y-6", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back"] }), _jsx(PageHeader, { title: "Create Project", description: "Set up a new project to organize your media files." }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { id: "name", label: "Project Name", placeholder: "my-app", error: errors.name?.message, ...register('name') }), _jsx(Textarea, { id: "description", label: "Description (optional)", placeholder: "A short description of this project...", error: errors.description?.message, rows: 3, ...register('description') }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate(-1), children: "Cancel" }), _jsx(Button, { type: "submit", loading: isLoading, children: "Create Project" })] })] })] }));
}
//# sourceMappingURL=create.js.map