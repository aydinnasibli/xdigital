
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <main className="max-w-7xl mx-auto tracking-widest">
                {children}
            </main>

        </div>
    );
}