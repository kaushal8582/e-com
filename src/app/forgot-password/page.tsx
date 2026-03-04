'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await apiPost<{ success: boolean; message: string }>('/auth/forgot-password', data);
      setSent(true);
      toast.success('If an account exists, we sent a reset link to your email.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[340px] sm:max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
      {sent ? (
        <p className="mt-6 text-slate-600">
          If an account exists for that email, we&apos;ve sent a reset link. Check your inbox and spam.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 sm:w-[400px]">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-slate-600">
        <Link href="/login" className="text-slate-900 underline">Back to login</Link>
      </p>
    </div>
  );
}
