'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ButtonLoading } from '@/components/SkeletonLoader';

/**
 * Identifier for the consent copy below. Stored on every submission so a future
 * wording change cannot retroactively redefine what past takers agreed to.
 * BUMP THIS whenever the privacy notice text changes.
 */
export const CONSENT_VERSION = '2026-09-23-no-retailer-ask';

const userInfoSchema = z.object({
  userName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, apostrophes, and hyphens'),
  userEmail: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  // Retailer sharing is not asked on this form. The field stays in the schema
  // as optional so the submission type is unchanged, but nothing sets it —
  // leaving it undefined, which persists as NULL ("never asked"). Do not give
  // it a default: a default would record consent she was never asked for.
  // See migration 002.
  shareWithRetailers: z.boolean().optional(),
});

type UserInfoFormData = z.infer<typeof userInfoSchema>;

interface UserInfoFormProps {
  onSubmit: (data: UserInfoFormData) => void;
  initialValues?: Partial<UserInfoFormData>;
}

export default function UserInfoForm({ onSubmit, initialValues }: UserInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
    mode: 'onChange',
    defaultValues: { ...(initialValues || {}) }
  });

  const onFormSubmit = async (data: UserInfoFormData) => {
    setIsSubmitting(true);
    // Small delay to show loading state
    setTimeout(() => {
      onSubmit(data);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Let's Get Started
          </h2>
          <p className="text-gray-600">
            Please provide your information to begin the StyleFinder ID® assessment. 
            Your results will be shared with your personal style coach.
          </p>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              {...register('userName')}
              type="text"
              id="userName"
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-black ${
                errors.userName 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={isSubmitting}
            />
            {errors.userName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.userName.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              {...register('userEmail')}
              type="email"
              id="userEmail"
              placeholder="Enter your email address"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-black ${
                errors.userEmail 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={isSubmitting}
            />
            {errors.userEmail && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.userEmail.message}
              </p>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Privacy &amp; Data Use</p>
                <p>
                  Your information is used for this assessment and shared with your
                  personal style coach for guidance. We use a secure AI service to help
                  write your personalized Style Blueprint from your results. We never
                  sell your data. You can withdraw consent at any time by contacting
                  us.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <ButtonLoading
            type="submit"
            isLoading={isSubmitting}
            loadingText="Processing..."
            disabled={!isValid}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              isValid && !isSubmitting
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 transform hover:scale-[1.02] shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Begin Style Assessment
          </ButtonLoading>

          <p className="text-xs text-gray-500 text-center">
            * Required fields
          </p>
        </form>
      </div>
    </div>
  );
}