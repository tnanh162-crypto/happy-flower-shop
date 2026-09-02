import { Fraunces, Work_Sans } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata = {
  title: "Happy Flower - Hoa sáp Hải Phòng",
  description:
    "Happy Flower - Hoa sáp Hải Phòng. Nhận đặt hoa sáp và giao hàng tại Hải Phòng.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="font-body min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
