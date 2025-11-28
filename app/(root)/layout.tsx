import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HorizontalScrollBar from "@/components/ui/horizontal-scrollbar";

export default function GenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Navbar />

            <main >
                {children}
            </main>

            <Footer />
        </div>
    );
}