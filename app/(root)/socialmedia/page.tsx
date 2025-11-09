'use client'
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Clock } from 'lucide-react';

export default function ComingSoon() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        setMounted(true);
        const launchDate = new Date('2025-12-31T00:00:00').getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = launchDate - now;

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, []);


    return (
        <div className="min-h-screen  flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-8 text-center">
                {/* Logo/Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Clock className="w-8 h-8 text-slate-50 dark:text-slate-900" />
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                        Coming Soon
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        Something amazing is on the way.
                    </p>
                </div>

                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
                    {!mounted ? (
                        // Show placeholder during SSR to prevent hydration mismatch
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
                                    00
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {['Days', 'Hours', 'Minutes', 'Seconds'][i - 1]}
                                </div>
                            </div>
                        ))
                    ) : (
                        [
                            { label: 'Days', value: timeLeft.days },
                            { label: 'Hours', value: timeLeft.hours },
                            { label: 'Minutes', value: timeLeft.minutes },
                            { label: 'Seconds', value: timeLeft.seconds }
                        ].map((item) => (
                            <div key={item.label} className="bg-black rounded-xl p-4 shadow-sm">
                                <div className="text-3xl md:text-4xl font-bold text-gray-100">
                                    {item.value.toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {item.label}
                                </div>
                            </div>
                        ))
                    )}
                </div>




            </div>
        </div>
    );
}