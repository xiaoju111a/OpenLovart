import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm prose-blue max-w-full break-words dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 1. 处理代码块：包装滚动容器并限制宽度
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="w-full overflow-x-auto my-4 rounded-lg shadow-sm border border-gray-100">
                <SyntaxHighlighter
                  style={oneLight}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              // 行内代码处理
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm break-all font-mono" {...props}>
                {children}
              </code>
            );
          },

          // 2. 处理表格：这是最容易溢出的地方，必须强制包裹滚动容器
          table({ children }) {
            return (
              <div className="w-full overflow-x-auto my-6 border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 m-0 text-sm">
                  {children}
                </table>
              </div>
            );
          },
          
          // 优化表格标题
          th({ children }) {
            return (
              <th className="px-4 py-2 bg-gray-50 text-left font-bold text-gray-700 whitespace-nowrap">
                {children}
              </th>
            );
          },
          
          // 优化表格单元格
          td({ children }) {
            return (
              <td className="px-4 py-2 border-t border-gray-100 text-gray-600">
                {children}
              </td>
            );
          },
          img({ src, alt }) {
            return <img src={src} alt={alt} className="rounded-lg border border-gray-200 my-4 max-h-96 object-cover" />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}