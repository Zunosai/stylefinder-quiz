'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizSubmission } from '@/lib/types';
import { QuizStorage, useQuizStorage, type QuizStep } from '@/lib/storage';
import { logger } from '@/lib/logger';
import UserInfoForm, { CONSENT_VERSION } from '@/components/UserInfoForm';
import QuizSection1 from '@/components/QuizSection1';
import QuizSection2 from '@/components/QuizSection2';
import AutoSaveIndicator from '@/components/AutoSaveIndicator';
import { QuizSkeleton } from '@/components/SkeletonLoader';

export default function QuizPage() {
  const router = useRouter();
  const storage = useQuizStorage();
  
  const [currentStep, setCurrentStep] = useState<QuizStep>('userInfo');
  const [quizData, setQuizData] = useState<Partial<QuizSubmission>>({
    timestamp: new Date()
  });
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize component and check for saved data
  useEffect(() => {
    const initializeQuiz = () => {
      try {
        // Clean up any old or expired data
        QuizStorage.cleanup();

        // Capture store attribution from the URL (?store=&src=). Read straight
        // off window.location rather than useSearchParams so this client page
        // does not need a Suspense boundary. Attribution only — it does not
        // grant the referring store any ownership of the submission.
        const params = new URLSearchParams(window.location.search);
        const referralStoreId = params.get('store') || undefined;
        const referralSource = params.get('src') || undefined;
        if (referralStoreId || referralSource) {
          setQuizData(prev => ({ ...prev, referralStoreId, referralSource }));
          logger.info('quiz', 'Referral attribution captured', {
            referralStoreId,
            referralSource
          });
        }

        logger.info('quiz', 'Quiz initialized');
      } catch (error: any) {
        logger.error('quiz', 'Error initializing quiz', { error: error.message });
      } finally {
        setIsInitialized(true);
      }
    };

    initializeQuiz();
  }, [storage]);

  // Auto-save when quiz data changes
  useEffect(() => {
    if (!isInitialized || currentStep === 'submitting') return;

    const saveData = {
      userData: {
        userName: quizData.userName,
        userEmail: quizData.userEmail
      },
      quizProgress: {
        currentStep,
        section1: quizData.section1 || {},
        section2: quizData.section2 || { answers: [] },
        completedGroups: [], // Will be updated by individual components
      }
    };

    storage.autoSave(saveData, 1000); // Debounce saves by 1 second
  }, [quizData, currentStep, isInitialized, storage]);


  const handleUserInfoSubmit = (userInfo: {
    userName: string;
    userEmail: string;
    // Not asked on the form; stays undefined so it persists as NULL.
    shareWithRetailers?: boolean;
  }) => {
    const updatedData = {
      ...quizData,
      ...userInfo,
      consentVersion: CONSENT_VERSION
    };
    setQuizData(updatedData);
    setCurrentStep('section1');

    // Auto-save user info immediately. Consent is deliberately NOT persisted to
    // local storage — it is re-affirmed on the form rather than resurrected from
    // a stale draft.
    storage.autoSave({
      userData: {
        userName: userInfo.userName,
        userEmail: userInfo.userEmail
      },
      quizProgress: {
        currentStep: 'section1',
        section1: {},
        section2: { answers: [] },
        completedGroups: []
      }
    }, 0); // Save immediately for user info
    
    logger.info('quiz', 'User info submitted', { userName: userInfo.userName });
  };

  const handleSection1Complete = (section1Data: QuizSubmission['section1']) => {
    const updatedData = { ...quizData, section1: section1Data };
    setQuizData(updatedData);
    setCurrentStep('section2');
    
    // Auto-save section 1 completion
    storage.autoSave({
      userData: {
        userName: updatedData.userName,
        userEmail: updatedData.userEmail
      },
      quizProgress: {
        currentStep: 'section2',
        section1: section1Data,
        section2: { answers: [] },
        completedGroups: []
      }
    }, 0); // Save immediately for section completion
    
    logger.info('quiz', 'Section 1 completed', { 
      groupsCompleted: Object.keys(section1Data).length 
    });
  };

  const handleSection2Complete = async (section2Data: QuizSubmission['section2']) => {
    const completeData: QuizSubmission = {
      ...quizData,
      section1: quizData.section1!,
      section2: section2Data,
      userName: quizData.userName!,
      userEmail: quizData.userEmail!,
      timestamp: new Date(),
      // The form no longer asks about retailer sharing, so this is undefined
      // and the server records NULL ("never asked") — never a fabricated false
      // or true. See migration 002.
      shareWithRetailers: quizData.shareWithRetailers,
      consentVersion: quizData.consentVersion,
      referralStoreId: quizData.referralStoreId,
      referralSource: quizData.referralSource
    };

    setCurrentStep('submitting');
    setError(null);

    // Save completion state before submitting
    storage.autoSave({
      userData: {
        userName: completeData.userName,
        userEmail: completeData.userEmail
      },
      quizProgress: {
        currentStep: 'submitting',
        section1: completeData.section1,
        section2: section2Data,
        completedGroups: []
      }
    }, 0);

    try {
      const response = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit quiz');
      }

      // Clear saved data on successful submission
      storage.clear();
      logger.info('quiz', 'Quiz submitted successfully, cleared saved data');

      // Redirect to results page with primary style
      router.push(`/results/${result.primaryStyle.toLowerCase()}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      logger.error('quiz', 'Failed to submit quiz', { 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
      
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your quiz.');
      setCurrentStep('section2'); // Go back to section 2 to retry
      
      // Restore section 2 state in storage
      storage.autoSave({
        userData: {
          userName: completeData.userName,
          userEmail: completeData.userEmail
        },
        quizProgress: {
          currentStep: 'section2',
          section1: completeData.section1,
          section2: section2Data,
          completedGroups: []
        }
      }, 0);
    } finally {
      // Submission complete - state managed by success/error handlers
    }
  };


  // Show skeleton screen until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header skeleton */}
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-80 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-60 mx-auto"></div>
            </div>
          </div>

          {/* Progress bar skeleton */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3"></div>
              <div className="mt-2 flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>

          {/* Quiz skeleton */}
          <QuizSkeleton type="userInfo" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">

      {/* Auto-save Indicator */}
      <AutoSaveIndicator />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            StyleFinder ID® Assessment
          </h1>
          <p className="text-gray-600">Discover your unique style identity</p>
        </div>


        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Quiz Steps */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'userInfo' && (
            <UserInfoForm 
              onSubmit={handleUserInfoSubmit}
              initialValues={{
                userName: quizData.userName,
                userEmail: quizData.userEmail
              }}
            />
          )}

          {currentStep === 'section1' && (
            <QuizSection1 
              onComplete={handleSection1Complete}
              onBack={() => setCurrentStep('userInfo')}
            />
          )}

          {currentStep === 'section2' && (
            <QuizSection2 
              onComplete={handleSection2Complete}
              onBack={() => setCurrentStep('section1')}
            />
          )}

          {currentStep === 'submitting' && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Processing Your Results
                </h3>
                <p className="text-gray-600">
                  Analyzing your style preferences and sending results to your coach...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}