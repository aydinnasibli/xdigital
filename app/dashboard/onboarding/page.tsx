// app/dashboard/onboarding/page.tsx
'use client';

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();

    const handleComplete = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <OnboardingWizard onComplete={handleComplete} />
            </div>
        </div>
    );
}
