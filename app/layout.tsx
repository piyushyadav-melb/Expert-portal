import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { siteConfig } from "@/config/site";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/themes/light.css";
import Providers from "@/provider/providers";
import TanstackProvider from "@/provider/providers.client";
import DirectionProvider from "@/provider/direction.provider";
import ReduxProvider from "@/redux/redux-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <ReduxProvider>
        <NextIntlClientProvider messages={messages}>
          <TanstackProvider>
            <Providers>
              <DirectionProvider lang={locale}>{children}</DirectionProvider>
            </Providers>
          </TanstackProvider>
        </NextIntlClientProvider>
      </ReduxProvider>
    </html>
  );
}
