'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/lib/api';
import type { User } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, login, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiPost<{ success: boolean; user: User; token: string }>('/auth/register', data);
      if (res.success && res.token) {
        login(res.token);
        if (res.user) setUser(res.user);
        toast.success('Account created');
        router.push('/');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Registration failed');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[340px] sm:max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 sm:w-[400px]">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            {...register('email')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            {...register('password')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-center text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="text-slate-900 underline">Login</Link>
      </p>
    </div>
  );
}
