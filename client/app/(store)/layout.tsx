import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ChatBot from "@/components/ui/ChatBot";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        {children}
        <ChatBot />
      </main>
      <Footer />
    </div>
  );
}
