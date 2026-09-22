import Link from 'next/link';

/**
 * Attribution params are carried from the landing page into the quiz so a
 * boutique that drives a take gets credit for it. SFID stays TBH-branded —
 * this is referral attribution, NOT a white-labeled per-store quiz.
 */
function buildQuizHref(searchParams: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const key of ['store', 'src'] as const) {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/quiz?${qs}` : '/quiz';
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const quizHref = buildQuizHref(await searchParams);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Logo/Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              StyleFinder ID
              <span className="text-lg align-top">®</span>
            </h1>
            <p className="text-xl text-gray-600 mb-2">Personal Style Assessment</p>
            <p className="text-gray-500">Discover your unique style identity</p>
          </div>

          {/* Description */}
          <div className="mb-8 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Take our comprehensive style assessment to discover your personal style profile. 
              This professional quiz analyzes your preferences across fashion, lifestyle, and 
              aesthetic choices to identify your primary style identity.
            </p>
            
            <div className="bg-rose-50 rounded-lg p-4 text-sm text-gray-600">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-rose-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Assessment Details</span>
              </div>
              <ul className="space-y-1 ml-7">
                <li>• Approximately 10-15 minutes to complete</li>
                <li>• Results sent to your personal style coach</li>
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Link
              href={quizHref}
              className="inline-block w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-rose-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Start Your Style Assessment
            </Link>

            <p className="text-xs text-gray-500">
              By proceeding, you agree to share your results with your assigned style coach
              for personalized guidance. On the next step you can also choose to share your
              style result with boutiques you already shop with.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>StyleFinder ID® Personal Style Assessment System</p>
        </div>
      </div>
    </div>
  );
}
