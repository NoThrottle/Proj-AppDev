import { Providers } from "@/app/providers";
import { Navigation } from "./Navigation"; // Adjust path as needed
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground">
        <Providers>
          <Navigation />
          <main className="p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}