import React from 'react';

interface HighlightedTextProps {
  text: string;
  searchTerms: string[];
  className?: string;
}

export function HighlightedText({ text, searchTerms, className = '' }: HighlightedTextProps) {
  if (!searchTerms || searchTerms.length === 0) {
    return <span className={className}>{text}</span>;
  }
  
  const lowerText = text.toLowerCase();
  const matches: Array<{term: string, start: number, end: number}> = [];
  
  // Find all matches
  searchTerms.forEach(term => {
    const lowerTerm = term.toLowerCase();
    let pos = 0;
    while ((pos = lowerText.indexOf(lowerTerm, pos)) !== -1) {
      matches.push({
        term: lowerTerm,
        start: pos,
        end: pos + lowerTerm.length
      });
      pos += lowerTerm.length;
    }
  });
  
  if (matches.length === 0) {
    return <span className={className}>{text}</span>;
  }
  
  // Sort by position
  matches.sort((a, b) => a.start - b.start);
  
  // Build highlighted text
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  matches.forEach((match, idx) => {
    // Skip overlapping matches
    if (match.start < lastIndex) return;
    
    // Add text before match
    if (match.start > lastIndex) {
      parts.push(
        <span key={`text-${idx}`}>
          {text.substring(lastIndex, match.start)}
        </span>
      );
    }
    
    // Add highlighted match
    parts.push(
      <mark
        key={`match-${idx}`}
        className="bg-yellow-200 text-gray-900 font-medium px-0.5 rounded"
      >
        {text.substring(match.start, match.end)}
      </mark>
    );
    
    lastIndex = match.end;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">
        {text.substring(lastIndex)}
      </span>
    );
  }
  
  return <span className={className}>{parts}</span>;
}
