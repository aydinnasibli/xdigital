import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HorizontalScrollBar from "@/components/HorizontalScrollbar";

export default function GenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Navbar />

            <main className="max-w-7xl mx-auto tracking-widest">
                {children}
            </main>

            <Footer />
        </div>
    );
}