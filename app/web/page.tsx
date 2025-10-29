import { getFaqWeb, getPricingPackages } from '@/lib/sanityQueries'
import WebPageClient from './WebPageClient'

// This tells Next.js to revalidate this page every hour
export const revalidate = 86400

export default async function WebPage() {
    // Fetch data on the server at build time and every hour
    const [faqs, packages] = await Promise.all([
        getFaqWeb(),
        getPricingPackages()
    ])

    return <WebPageClient initialFaqs={faqs} initialPackages={packages} />
}