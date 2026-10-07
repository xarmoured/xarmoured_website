import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { safeUrl, slugify } from '@/lib/modules';
function plain(node: ReactNode): string {
  return Children.toArray(node)
    .map((x) =>
      typeof x === 'string' || typeof x === 'number'
        ? String(x)
        : isValidElement<{ children?: ReactNode }>(x)
          ? plain(x.props.children)
          : ''
    )
    .join('');
}
function syntax(source: string) {
  // Presentation-only tokens. React escapes every token; no HTML is injected.
  return source
    .split(
      /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|var|return|if|else|import|from|async|await|function|class|def|True|False|None|true|false|null|SELECT|FROM|WHERE|GET|POST|PUT|DELETE)\b|\b\d+(?:\.\d+)?\b)/g
    )
    .map((token, i) => (
      <span
        key={i}
        className={
          /^["']/.test(token)
            ? 'xa-code-string'
            : /^\d/.test(token)
              ? 'xa-code-number'
              : /^(const|let|var|return|if|else|import|from|async|await|function|class|def|True|False|None|true|false|null|SELECT|FROM|WHERE|GET|POST|PUT|DELETE)$/.test(
                    token
                  )
                ? 'xa-code-keyword'
                : undefined
        }
      >
        {token}
      </span>
    ));
}
export function Markdown({ children }: { children: string }) {
  const used = new Map<string, number>();
  const heading = (level: 2 | 3 | 4) =>
    function Heading({ children }: { children?: ReactNode }) {
      const label = plain(children);
      const slug = slugify(label) || 'section';
      const count = used.get(slug) || 0;
      used.set(slug, count + 1);
      const id = count ? `${slug}-${count + 1}` : slug;
      const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
      return (
        <Tag id={id}>
          {children}
          <a href={`#${id}`} className="heading-anchor" aria-label={`Link to ${label}`}>
            #
          </a>
        </Tag>
      );
    };
  return (
    <div className="prose">
      <ReactMarkdown
        components={{
          h1: heading(2),
          h2: heading(2),
          h3: heading(3),
          h4: heading(4),
          a: ({ href, children }) => (
            <a
              href={href && (href.startsWith('#') || safeUrl(href)) ? href : undefined}
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === 'string' && safeUrl(src) ? (
              <img src={src} alt={alt || ''} loading="lazy" />
            ) : null,
          code: ({ children, className }) => (
            <code className={className}>
              {className || plain(children).includes('\n') ? syntax(plain(children)) : children}
            </code>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
