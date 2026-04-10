"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Code2, 
  TerminalSquare, 
  ChevronDown,
  BookOpen,
  MonitorPlay,
  Briefcase,
  Zap
} from "lucide-react";
import { useState } from "react";

const domains = [
  { id: "software", label: "Software Engineering" },
  { id: "digital", label: "Digital Electronics" },
  { id: "analog", label: "Analog Electronics" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [activeDomain, setActiveDomain] = useState(domains[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const coreNavLinks = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/dsa", label: "Data Structures", icon: Code2 },
    { href: "/system-design", label: "System Design", icon: TerminalSquare },
  ];

  const analogNavLinks = [
    { href: "/learn/half-wave-rectifier", label: "Half-Wave Rectifier", icon: Zap },
  ];

  const navLinks = activeDomain.id === "analog" ? analogNavLinks : coreNavLinks;

  const comingSoonLinks = [
    { label: "Discover", icon: BookOpen },
    { label: "Courses", icon: MonitorPlay },
    { label: "Opportunities", icon: Briefcase },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 md:flex flex-col border-r border-slate-200 dark:border-slate-800/50 bg-background z-40 hidden">
      {/* Brand & Domain Selector */}
      <div className="p-6">
        <div className="font-extrabold text-2xl tracking-wider text-(--heading-color) mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm">
            <Code2 size={18} />
          </div>
          <div>
            Pro<span className="text-orange-500">Trainer</span>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full nm-button flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-(--heading-color)"
          >
            <span className="truncate">{activeDomain.label}</span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 nm-flat rounded-xl overflow-hidden z-50 py-1">
              {domains.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => {
                    setActiveDomain(domain);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                    activeDomain.id === domain.id ? 'text-orange-500 font-bold' : 'text-foreground'
                  }`}
                >
                  {domain.label}
                  {domain.id !== "software" && (
                    <span className="ml-2 text-[10px] uppercase font-bold opacity-50 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">Soon</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-6">
        <div className="text-xs font-bold text-foreground opacity-50 uppercase tracking-wider mb-4 px-2 mt-4">
          Core Learning
        </div>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? "nm-inset text-orange-500" 
                  : "text-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-(--heading-color)"
              }`}
            >
              <link.icon size={18} className={isActive ? "text-orange-500" : "opacity-70"} />
              {link.label}
            </Link>
          );
        })}

        <div className="text-xs font-bold text-foreground opacity-50 uppercase tracking-wider mb-4 px-2 pt-8">
          Explore
        </div>
        {comingSoonLinks.map((link) => (
          <div
            key={link.label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-foreground opacity-50 cursor-not-allowed"
          >
            <link.icon size={18} />
            {link.label}
            <span className="ml-auto text-[10px] uppercase font-bold bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">Soon</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
