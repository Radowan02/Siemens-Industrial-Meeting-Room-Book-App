import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/assets/styles/globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Meeting Room Book App",
  description: "Book a meeting room for your team",
};
export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang='en'>
        <body className={inter.className}>
          <Header />
          <main className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </AuthProvider>
  );
}


