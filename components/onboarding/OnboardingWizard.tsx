// components/onboarding/OnboardingWizard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: string;
}

const steps: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to XDigital!',
        description: "Let's get you started with your project management journey",
        icon: '👋',
    },
    {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Help us personalize your experience',
        icon: '👤',
    },
    {
        id: 'preferences',
        title: 'Set Your Preferences',
        description: 'Configure notifications and settings',
        icon: '⚙️',
    },
    {
        id: 'first-project',
        title: 'Create Your First Project',
        description: 'Start collaborating with our team',
        icon: '🚀',
    },
    {
        id: 'complete',
        title: "You're All Set!",
        description: 'Ready to explore your dashboard',
        icon: '🎉',
    },
];

interface FormData {
    company?: string;
    position?: string;
    phone?: string;
    website?: string;
    notificationPreferences?: string[];
}

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>({});
    const router = useRouter();

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Complete onboarding
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const updateFormData = (key: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const renderStepContent = () => {
        const step = steps[currentStep];

        switch (step.id) {
            case 'welcome':
                return (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">{step.icon}</div>
                        <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
                        <p className="text-gray-600">{step.description}</p>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">{step.icon}</div>
                            <h3 className="text-xl font-bold">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={formData.company || ''}
                                onChange={(e) => updateFormData('company', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Your Company"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Position
                            </label>
                            <input
                                type="text"
                                value={formData.position || ''}
                                onChange={(e) => updateFormData('position', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="CEO, Manager, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => updateFormData('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.website || ''}
                                onChange={(e) => updateFormData('website', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">{step.icon}</div>
                            <h3 className="text-xl font-bold">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                        </div>

                        <div className="space-y-3">
                            <p className="font-medium text-gray-700">
                                How would you like to receive notifications?
                            </p>

                            {['Email notifications', 'Project updates', 'Message alerts', 'Invoice notifications'].map((option) => (
                                <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        defaultChecked
                                    />
                                    <span className="text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 'first-project':
                return (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">{step.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-6">{step.description}</p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h4 className="font-medium text-blue-900 mb-2">
                                Ready to create your first project?
                            </h4>
                            <p className="text-sm text-blue-700">
                                You can create a project now or explore the dashboard first
                            </p>
                        </div>

                        <button
                            onClick={() => router.push('/dashboard/projects/new')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Project Now
                        </button>
                    </div>
                );

            case 'complete':
                return (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">{step.icon}</div>
                        <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
                        <p className="text-gray-600 mb-6">{step.description}</p>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <h4 className="font-medium text-green-900 mb-2">
                                What you can do now:
                            </h4>
                            <ul className="text-sm text-green-700 space-y-1 text-left max-w-md mx-auto">
                                <li>• Create and manage projects</li>
                                <li>• Communicate with your team</li>
                                <li>• Upload and share files</li>
                                <li>• Track project progress</li>
                                <li>• View invoices and payments</li>
                            </ul>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Progress Bar */}
                <div className="px-6 pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Skip tour
                        </button>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {renderStepContent()}
                </div>

                {/* Navigation */}
                <div className="border-t px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex gap-1">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
