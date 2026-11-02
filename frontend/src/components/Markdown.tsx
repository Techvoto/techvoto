import ReactMarkdown from 'react-markdown';

// react-markdown does not render raw HTML by default, so instructor content cannot inject scripts.
export default function Markdown({ children }: { children?: string | null }) {
  return <div className="prose-tv"><ReactMarkdown>{children || ''}</ReactMarkdown></div>;
}
