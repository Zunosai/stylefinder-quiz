import { createClient } from '@supabase/supabase-js';
import { QuizSubmission, StyleResult } from './types';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for public operations (browser-safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server-side operations with elevated privileges
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database types
export interface DbQuizSubmission {
  id?: string;
  user_name: string;
  user_email: string;
  submitted_at?: string;
  section1_responses: any; // JSONB type in database can store any structure
  section2_responses: any; // JSONB type in database can store any structure
  scores: Record<string, number>;
  primary_style: string;
  primary_score: number;
  secondary_style: string;
  secondary_score: number;
  supporting_style: string;
  supporting_score: number;
  email_sent?: boolean;
  email_sent_at?: string | null;
  email_error?: string | null;
  email_retry_count?: number;
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
  /** See migration 002. NULL = never asked; only `true` permits retailer outreach. */
  share_with_retailers?: boolean | null;
  consent_version?: string | null;
  referral_store_id?: string | null;
  referral_source?: string | null;
}

export interface DbEmailQueue {
  id?: string;
  submission_id: string;
  recipient_email: string;
  email_type: 'coach_notification' | 'user_confirmation';
  email_data: any;
  status?: 'pending' | 'processing' | 'sent' | 'failed';
  attempts?: number;
  max_attempts?: number;
  last_error?: string | null;
  last_attempt_at?: string | null;
  scheduled_for?: string;
  sent_at?: string | null;
}

/**
 * Save quiz submission to database
 */
export async function saveQuizSubmission(
  submission: QuizSubmission,
  results: StyleResult,
  request?: Request
): Promise<{ success: boolean; submissionId?: string; error?: string }> {
  try {
    // Use admin client if available, otherwise regular client
    const client = supabaseAdmin || supabase;

    // Extract metadata from request if available
    const ip_address = request?.headers?.get('x-forwarded-for') ||
                      request?.headers?.get('x-real-ip') ||
                      null;
    const user_agent = request?.headers?.get('user-agent') || null;

    // Calculate all scores
    const scores: Record<string, number> = {};
    const styleIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    // Get scores from results object
    styleIds.forEach(id => {
      if (id === results.primary.id) {
        scores[id] = results.primary.score;
      } else if (id === results.secondary.id) {
        scores[id] = results.secondary.score;
      } else if (id === results.supporting.id) {
        scores[id] = results.supporting.score;
      } else {
        // Calculate scores for other styles if needed
        scores[id] = 0; // This should be calculated from the actual scoring
      }
    });

    // Prepare submission data
    const dbSubmission: DbQuizSubmission = {
      user_name: submission.userName,
      user_email: submission.userEmail,
      section1_responses: submission.section1,
      section2_responses: submission.section2,
      scores,
      primary_style: results.primary.name,
      primary_score: results.primary.score,
      secondary_style: results.secondary.name,
      secondary_score: results.secondary.score,
      supporting_style: results.supporting.name,
      supporting_score: results.supporting.score,
      email_sent: false,
      ip_address,
      user_agent,
      session_id: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      // Consent is recorded EXACTLY as given. `undefined` means the taker was
      // never asked (e.g. a client on the pre-2026-08-04 build) and must persist
      // as NULL, not false and never true — see migration 002.
      share_with_retailers: typeof submission.shareWithRetailers === 'boolean'
        ? submission.shareWithRetailers
        : null,
      consent_version: submission.consentVersion ?? null,
      referral_store_id: submission.referralStoreId ?? null,
      referral_source: submission.referralSource ?? null
    };

    // Insert submission
    const { data, error } = await client
      .from('quiz_submissions')
      .insert([dbSubmission])
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, submissionId: data.id };
  } catch (error: any) {
    console.error('Failed to save quiz submission:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update email status after sending attempt
 */
export async function updateEmailStatus(
  submissionId: string,
  sent: boolean,
  error?: string
): Promise<void> {
  try {
    const client = supabaseAdmin || supabase;

    await client
      .from('quiz_submissions')
      .update({
        email_sent: sent,
        email_sent_at: sent ? new Date().toISOString() : null,
        email_error: error || null,
        email_retry_count: sent ? 0 : client.rpc('increment', { column: 'email_retry_count' })
      })
      .eq('id', submissionId);
  } catch (error) {
    console.error('Failed to update email status:', error);
  }
}

/**
 * Add email to queue for retry mechanism
 */
export async function queueEmail(
  submissionId: string,
  recipientEmail: string,
  emailData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = supabaseAdmin || supabase;

    const queueEntry: DbEmailQueue = {
      submission_id: submissionId,
      recipient_email: recipientEmail,
      email_type: 'coach_notification',
      email_data: emailData,
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
      scheduled_for: new Date().toISOString()
    };

    const { error } = await client
      .from('email_queue')
      .insert([queueEntry]);

    if (error) {
      console.error('Failed to queue email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to queue email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get recent quiz submissions for admin dashboard
 */
export async function getRecentSubmissions(
  limit: number = 100,
  days: number = 7
): Promise<DbQuizSubmission[]> {
  try {
    const client = supabaseAdmin || supabase;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await client
      .from('quiz_submissions')
      .select('*')
      .gte('submitted_at', fromDate.toISOString())
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get recent submissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get recent submissions:', error);
    return [];
  }
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(id: string): Promise<DbQuizSubmission | null> {
  try {
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('quiz_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to get submission:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get submission:', error);
    return null;
  }
}

/**
 * Search submissions by email
 */
export async function searchSubmissionsByEmail(
  email: string
): Promise<DbQuizSubmission[]> {
  try {
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('quiz_submissions')
      .select('*')
      .ilike('user_email', `%${email}%`)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Failed to search submissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to search submissions:', error);
    return [];
  }
}

/**
 * Get pending emails from queue
 */
export async function getPendingEmails(limit: number = 10): Promise<DbEmailQueue[]> {
  try {
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .lte('scheduled_for', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to get pending emails:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get pending emails:', error);
    return [];
  }
}

/**
 * Update email queue status
 */
export async function updateEmailQueueStatus(
  queueId: string,
  status: 'processing' | 'sent' | 'failed',
  error?: string
): Promise<void> {
  try {
    const client = supabaseAdmin || supabase;

    const updates: any = {
      status,
      last_attempt_at: new Date().toISOString()
    };

    if (status === 'sent') {
      updates.sent_at = new Date().toISOString();
    }

    if (status === 'failed') {
      updates.attempts = client.rpc('increment', { column: 'attempts' });
      updates.last_error = error || 'Unknown error';
    }

    await client
      .from('email_queue')
      .update(updates)
      .eq('id', queueId);
  } catch (error) {
    console.error('Failed to update email queue status:', error);
  }
}

/**
 * Check if database is configured and accessible
 */
export async function isDatabaseConfigured(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  try {
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('quiz_submissions')
      .select('id')
      .limit(1);

    return !error;
  } catch {
    return false;
  }
}