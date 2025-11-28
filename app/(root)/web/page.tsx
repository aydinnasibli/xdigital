import { getFaqWeb, getPricingPackages, getComparisonFeatures, getPortfolioShowcases } from '@/lib/sanity/queries'
import WebPageClient from './WebPageClient'

// This tells Next.js to revalidate this page every day
export const revalidate = 86400

export default async function WebPage() {
    // Fetch data on the server at build time and every day
    const [faqs, packages, comparisonFeatures, portfolioShowcase] = await Promise.all([
        getFaqWeb(),
        getPricingPackages(),
        getComparisonFeatures(),
        getPortfolioShowcases(),
    ])

    return (
        <WebPageClient
            initialFaqs={faqs}
            initialPackages={packages}
            initialComparisonFeatures={comparisonFeatures}
            initialPortfolioShowcase={portfolioShowcase}
        />
    )
}