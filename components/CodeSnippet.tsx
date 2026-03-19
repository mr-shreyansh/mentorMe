"use client";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeSnippet({ code }: { code: string }) {
  return (
    <div className="text-sm font-mono overflow-hidden nm-inset rounded-[2rem] p-4">
      <SyntaxHighlighter
        language="python"
        style={vscDarkPlus}
        customStyle={{ 
          margin: 0, 
          padding: '1.5rem', 
          background: 'transparent', // Let local theme leak through
          borderRadius: '1.5rem',
          lineHeight: '1.6',
        }}
        wrapLines={true}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
