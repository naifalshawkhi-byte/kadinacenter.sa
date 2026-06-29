import type { Metadata } from "next";
import "./globals.css";
import { PreferencesProvider } from "@/components/providers/PreferencesProvider";
import { ClinicBrandingProvider } from "@/components/providers/ClinicBrandingProvider";
import { STORAGE_KEY } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "العيادة | نظام إدارة العيادات",
  description: "نظام متكامل لإدارة العيادات: الحجوزات، الاستفسارات، المواعيد، والحملات",
};

const themeScript = `(function(){try{var p=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"{}");if(p.theme==="dark")document.documentElement.classList.add("dark");if(p.locale==="en"){document.documentElement.lang="en";document.documentElement.dir="ltr";}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <PreferencesProvider>
          <ClinicBrandingProvider>{children}</ClinicBrandingProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
