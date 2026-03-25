"use client";

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function CodeSnippet({ code }: { code: string }) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  if (!mounted) {
    return (
      <div className="text-sm font-mono overflow-hidden nm-inset rounded-lg p-4 min-h-[100px] animate-pulse">
        <div className="blur-md opacity-20">{code}</div>
      </div>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const syntaxStyle = currentTheme === 'dark' ? vscDarkPlus : oneLight;

  return (
    <div className="relative group p-1">
      <div className={`text-sm font-mono overflow-hidden nm-inset rounded-lg p-4 transition-all duration-700 ${!show ? 'blur-md select-none' : ''}`}>
        <SyntaxHighlighter
          language="python"
          style={syntaxStyle}
          customStyle={{ 
            margin: 0, 
            padding: '1.5rem', 
            background: 'transparent',
            borderRadius: '1.5rem',
            lineHeight: '1.6',
          }}
          wrapLines={true}
          showLineNumbers={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        {show && (
          <div className="relative">
            {copied && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                COPIED!
              </div>
            )}
            <button 
              onClick={handleCopy}
              className="nm-button p-2.5 rounded-md text-orange-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
              title="Copy code"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShow(!show);
          }}
          className="nm-button p-2.5 rounded-md text-orange-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          title={show ? "Hide code" : "Show code"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {!show && (
        <div 
          className="absolute inset-0 cursor-pointer rounded-lg z-10 flex items-center justify-center" 
          onClick={() => setShow(true)}
        >
          <div className="nm-flat rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <Eye size={24} className="text-orange-500/50" />
          </div>
        </div>
      )}
    </div>
  );
}
