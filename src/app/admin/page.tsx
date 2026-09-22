'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DbQuizSubmission, getRecentSubmissions, searchSubmissionsByEmail } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [submissions, setSubmissions] = useState<DbQuizSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<DbQuizSubmission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  // Submission ids with a Blueprint generation in flight. Generation runs at
  // high effort and can take over a minute, so the row must show progress.
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  // Check authentication
  const authenticate = async () => {
    const token = prompt('Enter admin token:');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAdminToken(token);
        loadSubmissions();
      } else {
        alert('Invalid admin token');
        router.push('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/');
    }
  };

  // Load recent submissions
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const recent = await getRecentSubmissions(100, 30);
      setSubmissions(recent);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search by email
  const handleSearch = async () => {
    if (!searchEmail) {
      loadSubmissions();
      return;
    }

    setLoading(true);
    try {
      const results = await searchSubmissionsByEmail(searchEmail);
      setSubmissions(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Retry email sending
  const retryEmail = async (submission: DbQuizSubmission) => {
    try {
      const response = await fetch('/api/admin/retry-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ submissionId: submission.id })
      });

      if (response.ok) {
        alert('Email retry initiated');
        loadSubmissions();
      } else {
        alert('Failed to retry email');
      }
    } catch (error) {
      console.error('Retry failed:', error);
      alert('Error retrying email');
    }
  };

  // Generate a StyleFinder ID Signature Style Blueprint and email it to her.
  // The click is the approval — there is no separate review step.
  const generateBlueprint = async (submission: DbQuizSubmission) => {
    const id = submission.id;
    if (!id) return;

    const confirmed = confirm(
      `Generate a Blueprint for ${submission.user_name} and email it to ` +
        `${submission.user_email}?\n\nThis takes up to two minutes.`
    );
    if (!confirmed) return;

    setGeneratingIds((prev) => new Set(prev).add(id));

    try {
      const response = await fetch('/api/admin/blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ submissionId: id })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Blueprint failed: ${result.error ?? 'Unknown error'}`);
        return;
      }

      if (result.emailed) {
        alert(
          `Blueprint sent to ${submission.user_email}.` +
            (result.archetype ? `\n\nArchetype: ${result.archetype}` : '')
        );
      } else {
        // Saved but not delivered — say so rather than reporting success.
        alert(
          `Blueprint generated and saved, but the email did not send: ` +
            `${result.emailError ?? 'unknown reason'}.\n\n` +
            `View it at /blueprint/${result.blueprintId}`
        );
      }
    } catch (error) {
      console.error('Blueprint generation failed:', error);
      alert('Error generating Blueprint');
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Date', 'Name', 'Email', 'Primary Style', 'Primary Score',
      'Secondary Style', 'Secondary Score', 'Supporting Style', 'Supporting Score',
      'Email Status'
    ];

    const rows = submissions.map(s => [
      new Date(s.submitted_at || '').toLocaleString(),
      s.user_name,
      s.user_email,
      s.primary_style,
      s.primary_score,
      s.secondary_style,
      s.secondary_score,
      s.supporting_style,
      s.supporting_score,
      s.email_sent ? 'Sent' : 'Failed'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    authenticate();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
          <p className="text-black">Please enter your admin token</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">StyleFinder Quiz Admin Dashboard</h1>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export to CSV
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border rounded text-black placeholder:text-black"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
            <button
              onClick={loadSubmissions}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-black">Loading submissions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Primary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Secondary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Supporting</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-black">
                        {new Date(submission.submitted_at || '').toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-black">{submission.user_name}</td>
                      <td className="px-4 py-3 text-sm text-black">{submission.user_email}</td>
                      <td className="px-4 py-3 text-sm text-black">
                        <div>
                          <span className="font-medium">{submission.primary_style}</span>
                          <span className="text-black ml-1">({submission.primary_score})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        <div>
                          <span>{submission.secondary_style}</span>
                          <span className="text-black ml-1">({submission.secondary_score})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        <div>
                          <span>{submission.supporting_style}</span>
                          <span className="text-black ml-1">({submission.supporting_score})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {submission.email_sent ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Sent
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                          {!submission.email_sent && (
                            <button
                              onClick={() => retryEmail(submission)}
                              className="text-orange-600 hover:text-orange-800"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            onClick={() => generateBlueprint(submission)}
                            disabled={generatingIds.has(submission.id ?? '')}
                            className="text-rose-600 hover:text-rose-800 disabled:cursor-not-allowed disabled:text-gray-400"
                          >
                            {generatingIds.has(submission.id ?? '')
                              ? 'Generating…'
                              : 'Blueprint'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {submissions.length === 0 && !loading && (
            <div className="p-8 text-center">
              <p className="text-black">No submissions found</p>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Submission Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-black hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-black">User Information</h3>
                  <p className="text-black"><strong>Name:</strong> {selectedSubmission.user_name}</p>
                  <p className="text-black"><strong>Email:</strong> {selectedSubmission.user_email}</p>
                  <p className="text-black"><strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at || '').toLocaleString()}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-black">Style Results</h3>
                  <p className="text-black"><strong>Primary:</strong> {selectedSubmission.primary_style} (Score: {selectedSubmission.primary_score})</p>
                  <p className="text-black"><strong>Secondary:</strong> {selectedSubmission.secondary_style} (Score: {selectedSubmission.secondary_score})</p>
                  <p className="text-black"><strong>Supporting:</strong> {selectedSubmission.supporting_style} (Score: {selectedSubmission.supporting_score})</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-black">All Scores</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(selectedSubmission.scores).map(([style, score]) => (
                      <div key={style} className="bg-gray-100 p-2 rounded text-black">
                        <span className="font-medium">{style}:</span> {score}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-black">Email Status</h3>
                  <p className="text-black"><strong>Sent:</strong> {selectedSubmission.email_sent ? 'Yes' : 'No'}</p>
                  {selectedSubmission.email_sent_at && (
                    <p className="text-black"><strong>Sent At:</strong> {new Date(selectedSubmission.email_sent_at).toLocaleString()}</p>
                  )}
                  {selectedSubmission.email_error && (
                    <p className="text-red-600"><strong>Error:</strong> {selectedSubmission.email_error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}