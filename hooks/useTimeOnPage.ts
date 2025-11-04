// hooks/useTimeOnPage.ts
import { useEffect, useState } from 'react'

interface UseTimeOnPageOptions {
    threshold: number // in milliseconds
    onThresholdReached: () => void
    trackActiveTime?: boolean // only count when tab is active
    requireScroll?: boolean // require user to scroll before counting
    scrollThreshold?: number // pixels to scroll
    sessionKey?: string // key to store in sessionStorage to prevent multiple shows
}

export function useTimeOnPage({
    threshold,
    onThresholdReached,
    trackActiveTime = true,
    requireScroll = false,
    scrollThreshold = 500,
    sessionKey = 'timeOnPageTriggered'
}: UseTimeOnPageOptions) {
    const [timeSpent, setTimeSpent] = useState(0)
    const [isActive, setIsActive] = useState(true)
    const [hasScrolled, setHasScrolled] = useState(false)

    useEffect(() => {
        // Early return if not in browser
        if (typeof window === 'undefined') return

        // Check if already triggered in this session
        const hasTriggeredBefore = sessionStorage.getItem(sessionKey)
        if (hasTriggeredBefore) return

        let interval: NodeJS.Timeout | null = null
        let hasTriggered = false

        const startTracking = () => {
            // Don't start if we require scroll and user hasn't scrolled yet
            if (requireScroll && !hasScrolled) return

            // Clear existing interval if any
            if (interval) clearInterval(interval)

            interval = setInterval(() => {
                setTimeSpent((prev) => {
                    const newTime = prev + 1000
                    if (newTime >= threshold && !hasTriggered) {
                        hasTriggered = true
                        sessionStorage.setItem(sessionKey, 'true') // Mark as triggered
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
                // If we're waiting for scroll and just scrolled, start tracking
                if (requireScroll && !interval) {
                    startTracking()
                }
            }
        }

        // Initialize isActive state after mounting
        setIsActive(!document.hidden)

        // Check initial scroll position
        if (requireScroll) {
            setHasScrolled(window.scrollY > scrollThreshold)
        }

        // Start tracking if conditions are met
        if (!trackActiveTime || !document.hidden) {
            if (!requireScroll || window.scrollY > scrollThreshold) {
                startTracking()
            }
        }

        // Add event listeners
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
    }, [threshold, onThresholdReached, trackActiveTime, requireScroll, scrollThreshold, sessionKey, hasScrolled])

    return { timeSpent, isActive, hasScrolled }
}