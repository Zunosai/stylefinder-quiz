/**
 * List recent quiz submissions.
 *
 * The admin dashboard queries Supabase directly from the browser, which means
 * nothing server-side can find a submission by id — including the Blueprint
 * route, which needs one. This is that lookup.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecentSubmissions, searchSubmissionsByEmail } from '@/lib/supabase';

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_TOKEN || 'admin123';
  return authHeader === `Bearer ${adminToken}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = request.nextUrl.searchParams.get('email');
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 25);
  const days = Number(request.nextUrl.searchParams.get('days') ?? 30);

  try {
    const submissions = email
      ? await searchSubmissionsByEmail(email)
      : await getRecentSubmissions(limit, days);

    // Identifiers and results only — quiz answers stay out of the response.
    return NextResponse.json({
      count: submissions.length,
      submissions: submissions.slice(0, limit).map((s) => ({
        id: s.id,
        userName: s.user_name,
        userEmail: s.user_email,
        submittedAt: s.submitted_at,
        primaryStyle: s.primary_style,
        secondaryStyle: s.secondary_style,
        supportingStyle: s.supporting_style,
        emailSent: s.email_sent,
      })),
    });
  } catch (error) {
    console.error('Failed to list submissions:', error);
    return NextResponse.json(
      { error: 'Failed to list submissions' },
      { status: 500 },
    );
  }
}
