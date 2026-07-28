import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProjectMutation } from '@/services/projects.service';
import { PageHeader } from '@/components/shared';
import { Button, Input, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ApiError } from '@/types';

const createSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  });

  const onSubmit = async (data: CreateFormData) => {
    try {
      const result = await createProject({
        name: data.name,
        description: data.description ?? null,
      }).unwrap();
      toast.success('Project created');
      navigate(`/projects/${result.data.id}`);
    } catch (err: unknown) {
      const apiErr = err as { data?: ApiError };
      toast.error(apiErr?.data?.message ?? 'Failed to create project');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <PageHeader
        title="Create Project"
        description="Set up a new project to organize your media files."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Project Name"
          placeholder="my-app"
          error={errors.name?.message}
          {...register('name')}
        />
        <Textarea
          id="description"
          label="Description (optional)"
          placeholder="A short description of this project..."
          error={errors.description?.message}
          rows={3}
          {...register('description')}
        />
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
}
