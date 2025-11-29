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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_50%)]"></div>
            </div>

            <div className="w-full max-w-4xl relative z-10">
                <OnboardingWizard onComplete={handleComplete} />
            </div>
        </div>
    );
}
