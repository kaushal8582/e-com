'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';

const schema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
    }
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    try {
      await apiPost<{ success: boolean; message: string }>('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      toast.success('Password reset successfully');
      setTimeout(() => router.push('/login'), 2000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reset failed');
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
        <p>Missing or invalid reset link. Request a new one from the login page.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-slate-900 underline">
          Forgot password
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
        <p>Your password has been reset. Redirecting to login...</p>
        <Link href="/login" className="mt-4 inline-block text-slate-900 underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[340px] sm:max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 sm:w-[400px]">
        <div>
          <label className="block text-sm font-medium text-slate-700">New password</label>
          <input
            type="password"
            {...register('newPassword')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Confirm password</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
      <p className="mt-4 text-center text-slate-600">
        <Link href="/login" className="text-slate-900 underline">Back to login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-8 text-center text-slate-500">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
