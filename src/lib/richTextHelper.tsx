import React from 'react';

/**
 * Custom rich text formatter that safely converts:
 * - **bold** to <strong> tags
 * - Lines starting with '*', '-', or '•' to list items (<li>) grouped inside lists (<ul>)
 * - Normal text lines to paragraphs/spacing.
 */
export const formatRichText = (text: string): React.ReactNode => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inList = false;

  const parseInline = (str: string): React.ReactNode[] => {
    // Split by **text** markers
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-church-wood">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    // Match line starting with list characters: *, -, or •
    const listMatch = trimmed.match(/^[*•-]\s+(.*)/);

    if (listMatch) {
      if (!inList) {
        inList = true;
      }
      listItems.push(
        <li key={`li-${lineIndex}`} className="list-disc ml-5 mt-1 text-church-charcoal/80">
          {parseInline(listMatch[1])}
        </li>
      );
    } else {
      if (inList) {
        elements.push(
          <ul key={`ul-${lineIndex}`} className="space-y-1 my-2">
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }

      if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${lineIndex}`} className="leading-relaxed mb-2">
            {parseInline(line)}
          </p>
        );
      } else {
        elements.push(<div key={`br-${lineIndex}`} className="h-2" />);
      }
    }
  });

  if (inList) {
    elements.push(
      <ul key="ul-final" className="space-y-1 my-2">
        {listItems}
      </ul>
    );
  }

  return <>{elements}</>;
};
