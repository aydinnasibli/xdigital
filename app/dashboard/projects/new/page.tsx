// app/dashboard/projects/new/page.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProject } from '@/app/actions/projects';
import { getTemplatesByPackage } from '@/app/actions/projectTemplates';
import { Check, ChevronRight, ChevronLeft, Eye, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import * as Sentry from '@sentry/nextjs';

type Step = 1 | 2 | 3 | 4;

export default function NewProjectPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Package Selection
        projectName: '',
        projectDescription: '',
        serviceType: 'web_development',
        package: 'basic',

        // Step 2: Template Selection
        templateId: '',

        // Step 3: Customization
        customization: {
            businessName: '',
            industry: '',
            brandColors: {
                primary: '#3B82F6',
                secondary: '#10B981',
                accent: '#F59E0B',
            },
            logoUrl: '',
            contactInfo: {
                email: '',
                phone: '',
                address: '',
            },
            socialMedia: {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: '',
            },
            specialRequirements: '',
        },
    });

    // Load templates when package changes
    useEffect(() => {
        if (currentStep === 2) {
            loadTemplates();
        }
    }, [currentStep, formData.package]);

    const loadTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const response = await getTemplatesByPackage(formData.serviceType, formData.package);
            if (response.success) {
                setTemplates(response.data || []);
            }
        } catch (error) {
            Sentry.captureException(error, { tags: { context: 'loadTemplates', serviceType: formData.serviceType, package: formData.package } });
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleSubmit = async () => {
        startTransition(async () => {
            const result = await createProject({
                ...formData,
                projectName: formData.projectName || formData.customization.businessName,
            });

            if (result.success) {
                toast.success('Project created successfully! Redirecting...');
                router.push('/dashboard/projects');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to create project');
            }
        });
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const canProceedToStep2 = formData.projectName && formData.projectDescription && formData.package;
    const canProceedToStep3 = formData.templateId;
    const canProceedToStep4 = formData.customization.businessName;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                ← Back to Projects
            </Link>

            {/* Step Indicator */}
            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center flex-1">
                            <div className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                        currentStep >= step
                                            ? 'bg-purple-600 text-white border border-purple-500/30'
                                            : 'bg-white/5 text-gray-500 border border-gray-700'
                                    }`}
                                >
                                    {currentStep > step ? <Check size={20} /> : step}
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${currentStep >= step ? 'text-white' : 'text-gray-500'}`}>
                                        {step === 1 && 'Choose Package'}
                                        {step === 2 && 'Select Template'}
                                        {step === 3 && 'Customize'}
                                        {step === 4 && 'Review & Submit'}
                                    </p>
                                </div>
                            </div>
                            {step < 4 && (
                                <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step ? 'bg-purple-600' : 'bg-gray-800'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 p-8 rounded-2xl min-h-[600px]">
                {/* Step 1: Package Selection */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold">Choose Your Package</h1>
                        <p className="text-gray-600">Let's start by selecting the perfect package for your needs</p>

                        <div>
                            <label className="block text-sm font-medium mb-2">Project Name *</label>
                            <input
                                type="text"
                                value={formData.projectName}
                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="My Awesome Website"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Project Description *</label>
                            <textarea
                                value={formData.projectDescription}
                                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                                required
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe what kind of website you need..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">Select Your Package *</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['basic', 'standard', 'premium', 'enterprise'].map((pkg) => (
                                    <div
                                        key={pkg}
                                        onClick={() => setFormData({ ...formData, package: pkg })}
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                                            formData.package === pkg
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xl font-semibold capitalize">{pkg}</h3>
                                            {formData.package === pkg && (
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <Check size={16} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <ul className="text-sm space-y-2 text-gray-700">
                                            {pkg === 'basic' && (
                                                <>
                                                    <li>✓ Up to 5 pages</li>
                                                    <li>✓ Basic SEO</li>
                                                    <li>✓ Mobile responsive</li>
                                                    <li>✓ Contact form</li>
                                                </>
                                            )}
                                            {pkg === 'standard' && (
                                                <>
                                                    <li>✓ Up to 10 pages</li>
                                                    <li>✓ Advanced SEO</li>
                                                    <li>✓ CMS integration</li>
                                                    <li>✓ Email marketing</li>
                                                </>
                                            )}
                                            {pkg === 'premium' && (
                                                <>
                                                    <li>✓ Unlimited pages</li>
                                                    <li>✓ E-commerce</li>
                                                    <li>✓ Custom integrations</li>
                                                    <li>✓ Analytics setup</li>
                                                </>
                                            )}
                                            {pkg === 'enterprise' && (
                                                <>
                                                    <li>✓ Custom solution</li>
                                                    <li>✓ Advanced features</li>
                                                    <li>✓ Dedicated support</li>
                                                    <li>✓ Priority development</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Template Selection */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold">Choose Your Template</h1>
                        <p className="text-gray-600">
                            Browse our professionally designed templates for {formData.package} package
                        </p>

                        {loadingTemplates ? (
                            <div className="text-center py-12">
                                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                                <p className="mt-4 text-gray-600">Loading templates...</p>
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">No templates available for this package yet.</p>
                                <p className="text-sm text-gray-500 mt-2">Please contact us for custom designs.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {templates.map((template) => (
                                    <div
                                        key={template._id}
                                        onClick={() => setFormData({ ...formData, templateId: template._id })}
                                        className={`border-2 rounded-lg overflow-hidden cursor-pointer transition ${
                                            formData.templateId === template._id
                                                ? 'border-blue-600 shadow-lg'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        {/* Template Screenshot */}
                                        <div className="relative h-48 bg-gray-100">
                                            {template.screenshots && template.screenshots[0] ? (
                                                <Image
                                                    src={template.screenshots[0]}
                                                    alt={template.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                                    🎨
                                                </div>
                                            )}
                                            {formData.templateId === template._id && (
                                                <div className="absolute top-3 right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <Check size={20} className="text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Template Info */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{template.description || 'Professional template'}</p>

                                            {template.category && (
                                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full mb-3">
                                                    {template.category}
                                                </span>
                                            )}

                                            {template.features && template.features.length > 0 && (
                                                <div className="mt-3">
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {template.features.slice(0, 3).map((feature: string, idx: number) => (
                                                            <li key={idx}>✓ {feature}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {template.demoUrl && (
                                                <a
                                                    href={template.demoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                                >
                                                    <Eye size={16} />
                                                    Preview Demo
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Customization */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold">Customize Your Website</h1>
                        <p className="text-gray-600">Tell us about your business so we can personalize your website</p>

                        <div className="space-y-6">
                            {/* Business Info */}
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <h2 className="text-xl font-semibold">Business Information</h2>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Business Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customization.businessName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customization: { ...formData.customization, businessName: e.target.value },
                                            })
                                        }
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Your Business Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Industry/Category</label>
                                    <input
                                        type="text"
                                        value={formData.customization.industry}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customization: { ...formData.customization, industry: e.target.value },
                                            })
                                        }
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Restaurant, E-commerce, Consulting"
                                    />
                                </div>
                            </div>

                            {/* Brand Colors */}
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <h2 className="text-xl font-semibold">Brand Colors</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Primary Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.customization.brandColors.primary}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        customization: {
                                                            ...formData.customization,
                                                            brandColors: {
                                                                ...formData.customization.brandColors,
                                                                primary: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                                className="w-16 h-10 border rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={formData.customization.brandColors.primary}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        customization: {
                                                            ...formData.customization,
                                                            brandColors: {
                                                                ...formData.customization.brandColors,
                                                                primary: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                                className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Secondary Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.customization.brandColors.secondary}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        customization: {
                                                            ...formData.customization,
                                                            brandColors: {
                                                                ...formData.customization.brandColors,
                                                                secondary: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                                className="w-16 h-10 border rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={formData.customization.brandColors.secondary}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        customization: {
                                                            ...formData.customization,
                                                            brandColors: {
                                                                ...formData.customization.brandColors,
                                                                secondary: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                                className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Accent Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.customization.brandColors.accent}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        customization: {
                                                            ...formData.customization,
                                                            brandColors: {
                                                                ...formData.customization.brandColors,
                                                                accent: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                                className="w-16 h-10 border rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={formData.customization.brandColors.accent}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        customization: {
                                                            ...formData.customization,
                                                            brandColors: {
                                                                ...formData.customization.brandColors,
                                                                accent: e.target.value,
                                                            },
                                                        },
                                                    })
                                                }
                                                className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <h2 className="text-xl font-semibold">Logo</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Logo URL</label>
                                    <input
                                        type="url"
                                        value={formData.customization.logoUrl}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customization: { ...formData.customization, logoUrl: e.target.value },
                                            })
                                        }
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://example.com/logo.png or upload via file manager after submission"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        You can also upload your logo later through the project file manager
                                    </p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <h2 className="text-xl font-semibold">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={formData.customization.contactInfo.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customization: {
                                                        ...formData.customization,
                                                        contactInfo: {
                                                            ...formData.customization.contactInfo,
                                                            email: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="contact@business.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.customization.contactInfo.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customization: {
                                                        ...formData.customization,
                                                        contactInfo: {
                                                            ...formData.customization.contactInfo,
                                                            phone: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Address</label>
                                    <input
                                        type="text"
                                        value={formData.customization.contactInfo.address}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customization: {
                                                    ...formData.customization,
                                                    contactInfo: {
                                                        ...formData.customization.contactInfo,
                                                        address: e.target.value,
                                                    },
                                                },
                                            })
                                        }
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="123 Main St, City, State 12345"
                                    />
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <h2 className="text-xl font-semibold">Social Media Links</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Facebook</label>
                                        <input
                                            type="url"
                                            value={formData.customization.socialMedia.facebook}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customization: {
                                                        ...formData.customization,
                                                        socialMedia: {
                                                            ...formData.customization.socialMedia,
                                                            facebook: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Twitter</label>
                                        <input
                                            type="url"
                                            value={formData.customization.socialMedia.twitter}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customization: {
                                                        ...formData.customization,
                                                        socialMedia: {
                                                            ...formData.customization.socialMedia,
                                                            twitter: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://twitter.com/yourhandle"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Instagram</label>
                                        <input
                                            type="url"
                                            value={formData.customization.socialMedia.instagram}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customization: {
                                                        ...formData.customization,
                                                        socialMedia: {
                                                            ...formData.customization.socialMedia,
                                                            instagram: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://instagram.com/yourprofile"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">LinkedIn</label>
                                        <input
                                            type="url"
                                            value={formData.customization.socialMedia.linkedin}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customization: {
                                                        ...formData.customization,
                                                        socialMedia: {
                                                            ...formData.customization.socialMedia,
                                                            linkedin: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://linkedin.com/company/yourcompany"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Special Requirements */}
                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <h2 className="text-xl font-semibold">Special Requirements</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Any special requests or features you need?
                                    </label>
                                    <textarea
                                        value={formData.customization.specialRequirements}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customization: {
                                                    ...formData.customization,
                                                    specialRequirements: e.target.value,
                                                },
                                            })
                                        }
                                        rows={4}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tell us about any specific features, integrations, or design elements you need..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review & Submit */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold">Review Your Project</h1>
                        <p className="text-gray-600">Please review your project details before submitting</p>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h2 className="text-lg font-semibold mb-3">Project Details</h2>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="font-medium">Project Name:</span> {formData.projectName}
                                    </p>
                                    <p>
                                        <span className="font-medium">Package:</span>{' '}
                                        <span className="capitalize">{formData.package}</span>
                                    </p>
                                    <p>
                                        <span className="font-medium">Description:</span> {formData.projectDescription}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h2 className="text-lg font-semibold mb-3">Business Information</h2>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="font-medium">Business Name:</span>{' '}
                                        {formData.customization.businessName}
                                    </p>
                                    {formData.customization.industry && (
                                        <p>
                                            <span className="font-medium">Industry:</span>{' '}
                                            {formData.customization.industry}
                                        </p>
                                    )}
                                    <p>
                                        <span className="font-medium">Brand Colors:</span>
                                        <span className="ml-2 inline-flex gap-2">
                                            <span
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: formData.customization.brandColors.primary }}
                                            />
                                            <span
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: formData.customization.brandColors.secondary }}
                                            />
                                            <span
                                                className="w-6 h-6 rounded border"
                                                style={{ backgroundColor: formData.customization.brandColors.accent }}
                                            />
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {(formData.customization.contactInfo.email ||
                                formData.customization.contactInfo.phone ||
                                formData.customization.contactInfo.address) && (
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
                                    <div className="space-y-2 text-sm">
                                        {formData.customization.contactInfo.email && (
                                            <p>
                                                <span className="font-medium">Email:</span>{' '}
                                                {formData.customization.contactInfo.email}
                                            </p>
                                        )}
                                        {formData.customization.contactInfo.phone && (
                                            <p>
                                                <span className="font-medium">Phone:</span>{' '}
                                                {formData.customization.contactInfo.phone}
                                            </p>
                                        )}
                                        {formData.customization.contactInfo.address && (
                                            <p>
                                                <span className="font-medium">Address:</span>{' '}
                                                {formData.customization.contactInfo.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>1. We&apos;ll review your project requirements</li>
                                    <li>2. Customize the selected template with your branding</li>
                                    <li>3. Deploy your website to your own Vercel account</li>
                                    <li>4. You&apos;ll be notified when your website is ready</li>
                                    <li>5. Track progress and analytics from your dashboard</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>

                    {currentStep < 4 ? (
                        <button
                            onClick={nextStep}
                            disabled={
                                (currentStep === 1 && !canProceedToStep2) ||
                                (currentStep === 2 && !canProceedToStep3) ||
                                (currentStep === 3 && !canProceedToStep4)
                            }
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {isPending ? 'Submitting...' : 'Submit Project'}
                            <Check size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
