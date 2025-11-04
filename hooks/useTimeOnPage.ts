// hooks/useTimeOnPage.ts
import { useEffect, useState } from 'react'

type StorageType = 'sessionStorage' | 'cookie'

interface UseTimeOnPageOptions {
    threshold: number
    onThresholdReached: () => void
    trackActiveTime?: boolean
    requireScroll?: boolean
    scrollThreshold?: number
    storageKey?: string
    storageType?: StorageType
    cookieExpiryDays?: number // Only used if storageType is 'cookie'
}

// Helper functions for cookie management
const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

const getCookie = (name: string): string | null => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

export function useTimeOnPage({
    threshold,
    onThresholdReached,
    trackActiveTime = true,
    requireScroll = false,
    scrollThreshold = 500,
    storageKey = 'timeOnPageTriggered',
    storageType = 'cookie', // Default to cookie
    cookieExpiryDays = 30 // 30 days default
}: UseTimeOnPageOptions) {
    const [timeSpent, setTimeSpent] = useState(0)
    const [isActive, setIsActive] = useState(true)
    const [hasScrolled, setHasScrolled] = useState(false)

    // Check if already triggered based on storage type
    const hasTriggeredBefore = () => {
        if (typeof window === 'undefined') return false

        if (storageType === 'cookie') {
            return getCookie(storageKey) !== null
        } else {
            return sessionStorage.getItem(storageKey) !== null
        }
    }

    // Mark as triggered based on storage type
    const markAsTriggered = () => {
        if (typeof window === 'undefined') return

        if (storageType === 'cookie') {
            setCookie(storageKey, 'true', cookieExpiryDays)
        } else {
            sessionStorage.setItem(storageKey, 'true')
        }
    }

    useEffect(() => {
        if (typeof window === 'undefined') return

        // Check if already triggered
        if (hasTriggeredBefore()) return

        let interval: NodeJS.Timeout | null = null
        let hasTriggered = false

        const startTracking = () => {
            if (requireScroll && !hasScrolled) return
            if (interval) clearInterval(interval)

            interval = setInterval(() => {
                setTimeSpent((prev) => {
                    const newTime = prev + 1000
                    if (newTime >= threshold && !hasTriggered) {
                        hasTriggered = true
                        markAsTriggered()
                        onThresholdReached()
                        if (interval) clearInterval(interval)
                    }
                    return newTime
                })
            }, 1000)
        }

        const stopTracking = () => {
            if (interval) {
                clearInterval(interval)
                interval = null
            }
        }

        const handleVisibilityChange = () => {
            const isVisible = !document.hidden
            setIsActive(isVisible)

            if (trackActiveTime) {
                if (isVisible) {
                    startTracking()
                } else {
                    stopTracking()
                }
            }
        }

        const handleScroll = () => {
            if (window.scrollY > scrollThreshold) {
                setHasScrolled(true)
                if (requireScroll && !interval) {
                    startTracking()
                }
            }
        }

        setIsActive(!document.hidden)

        if (requireScroll) {
            setHasScrolled(window.scrollY > scrollThreshold)
        }

        if (!trackActiveTime || !document.hidden) {
            if (!requireScroll || window.scrollY > scrollThreshold) {
                startTracking()
            }
        }

        if (trackActiveTime) {
            document.addEventListener('visibilitychange', handleVisibilityChange)
        }
        if (requireScroll) {
            window.addEventListener('scroll', handleScroll, { passive: true })
        }

        return () => {
            stopTracking()
            if (trackActiveTime) {
                document.removeEventListener('visibilitychange', handleVisibilityChange)
            }
            if (requireScroll) {
                window.removeEventListener('scroll', handleScroll)
            }
        }
    }, [threshold, onThresholdReached, trackActiveTime, requireScroll, scrollThreshold, storageKey, storageType, cookieExpiryDays, hasScrolled])

    return { timeSpent, isActive, hasScrolled }
}