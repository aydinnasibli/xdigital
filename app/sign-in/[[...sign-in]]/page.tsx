import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
    return (
        <div className="container max-w-md py-16 flex flex-col items-center">
            <Link href="/" className="mb-8 text-primary hover:underline flex items-center">
                ← Back to home
            </Link>

            <div className="w-full">
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "shadow-lg border",
                            headerTitle: "text-2xl font-bold",
                            headerSubtitle: "text-muted-foreground",
                        }
                    }}
                />
            </div>
        </div>
    )
}