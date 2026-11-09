import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Aroha Travels – Kerala & South India",
    default: "Aroha Travels – Curated Kerala & South India Experiences",
  },
  description:
    "Discover South India, Beautifully. Curated boutique journeys across Kerala backwaters, Munnar tea highlands, and sacred temple circuits with authentic local luxury.",
  keywords: [
    "Kerala Tour Operator",
    "Munnar Houseboat Package",
    "Alleppey Luxury Houseboat",
    "South India Tours",
    "Aroha Travels",
    "Kerala Holiday Packages",
  ],
  authors: [{ name: "Aroha Travels" }],
  openGraph: {
    title: "Aroha Travels – Curated Kerala & South India Experiences",
    description: "Discover South India, Beautifully. Handcrafted journeys across misty plantations, heritage backwaters, and coastal sanctuaries.",
    url: "https://aroha-travels.com",
    siteName: "Aroha Travels",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#FAF9F6] text-[#252925] font-sans antialiased selection:bg-[#173D32] selection:text-[#FAF9F6]">
        {children}
      </body>
    </html>
  );
}
