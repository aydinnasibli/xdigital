import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
    return (
        <div className=" container max-w-md mt-20 mx-auto py-16 px-4 flex justify-between flex-col items-center">


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