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
import type { ApiError } from '@/types';

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roleId: z.string().min(1, 'Role is required'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function UserCreatePage() {
  const navigate = useNavigate();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { data: rolesData } = useGetRolesQuery();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      roleId: 'viewer',
    },
  });

  const roles = rolesData?.data ?? [];

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser(data).unwrap();
      toast.success('User created successfully');
      navigate(ROUTES.USERS);
    } catch (err: unknown) {
      const apiErr = err as { data?: ApiError };

      // Map server field-level errors to form fields (shown inline, not as toast)
      const details = apiErr.data?.error.details;
      if (details && details.length > 0) {
        let matched = false;
        for (const { path, message } of details) {
          if (path in createUserSchema.shape) {
            setError(path as keyof CreateUserFormData, { message });
            matched = true;
          }
        }
        if (matched) {
          return; // field errors shown inline — no toast needed
        }
      }

      toast.error(apiErr.data?.error.message ?? 'Failed to create user');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <button
        onClick={() => {
          navigate(ROUTES.USERS);
        }}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
        <p className="text-muted-foreground">Add a new administrator to MediaVault.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="firstName"
            label="First Name"
            placeholder="John"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            id="lastName"
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          id="username"
          label="Username"
          placeholder="johndoe"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="john@mediavault.local"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <Select
          id="roleId"
          label="Role"
          error={errors.roleId?.message}
          {...register('roleId')}
          options={roles.map((r) => ({
            value: r.id,
            label: r.name,
          }))}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={isLoading}>
            Create User
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              navigate(ROUTES.USERS);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
