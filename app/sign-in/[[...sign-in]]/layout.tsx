import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export default function SignInLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
