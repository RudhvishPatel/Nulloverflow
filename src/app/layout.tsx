import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BootSequence from "@/components/BootSequence";

export const metadata: Metadata = {
  title: { default: "Null Overflow — AI/ML studio", template: "%s · Null Overflow" },
  description:
    "Retro-terminal AI/ML studio led by Rudhvish Patel. Production GenAI, ML engineering, research — inquiry only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BootSequence />
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap footer-row">
            <span>NULL∅VERFLOW · AI/ML studio · inquiry only · no public pricing</span>
            <a className="bmc" href="#" title="Buy Me a Coffee — URL TBD" rel="noopener noreferrer">
              Buy me a coffee
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
