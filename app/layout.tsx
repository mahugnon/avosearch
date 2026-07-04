import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { Toaster } from "@/components/ui/sonner";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-app",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "AvoSearch — Vos contrats, relus et sécurisés",
    template: "%s | AvoSearch",
  },
  description:
    "Déposez votre contrat : une aide documentaire automatisée identifie les points d'attention, et des avocats inscrits au barreau peuvent valider chaque modification ou prendre le relais au forfait.",
  icons: {
    icon: "/logo/avosearch-mark.svg",
    apple: "/logo/avosearch-mark.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${plusJakarta.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale} dictionary={dictionary}>
          {children}
        </LocaleProvider>
        <Toaster />
      </body>
    </html>
  );
}
