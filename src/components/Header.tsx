"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/work", label: "Work" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/lab", label: "Lab" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo" aria-label="Null Overflow home">
          NULL<span>∅</span>VERFLOW
        </Link>
        <nav aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <a className="bmc" href="#" title="Buy Me a Coffee — URL TBD" rel="noopener noreferrer">
            Buy me a coffee
          </a>
        </nav>
      </div>
    </header>
  );
}
