import ReactMarkdown from 'react-markdown';
import { safeUrl } from '@/lib/modules';
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href && safeUrl(href) ? href : undefined} rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === 'string' && safeUrl(src) ? (
              <img src={src} alt={alt || ''} loading="lazy" />
            ) : null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
