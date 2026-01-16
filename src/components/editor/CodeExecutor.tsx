'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { Play, Square, Loader2 } from 'lucide-react';

// Code Executor Node - allows running JavaScript code
export const CodeExecutorNode = Node.create({
  name: 'codeExecutor',
  group: 'block',
  content: 'text*',
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: {
        default: 'javascript',
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          if (!attributes.language) {
            return {};
          }
          return { 'data-language': attributes.language };
        },
      },
      executed: {
        default: false,
        parseHTML: element => element.hasAttribute('data-executed'),
        renderHTML: attributes => {
          if (!attributes.executed) {
            return {};
          }
          return { 'data-executed': 'true' };
        },
      },
      output: {
        default: null,
        parseHTML: element => element.getAttribute('data-output'),
        renderHTML: attributes => {
          if (!attributes.output) {
            return {};
          }
          return { 'data-output': attributes.output };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-type="code-executor"]',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'pre',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'code-executor',
        class: 'bg-gray-900 text-gray-100 p-4 rounded-lg my-4 relative',
      }),
      [
        'code',
        {
          class: `language-${HTMLAttributes.language || 'javascript'}`,
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div');
      dom.className = 'code-executor-wrapper my-4';

      const pre = document.createElement('pre');
      pre.className = 'bg-gray-900 text-gray-100 p-4 rounded-lg mb-2';
      pre.setAttribute('data-type', 'code-executor');
      pre.setAttribute('data-language', node.attrs.language || 'javascript');

      const code = document.createElement('code');
      code.className = `language-${node.attrs.language || 'javascript'}`;
      code.textContent = node.textContent;

      const toolbar = document.createElement('div');
      toolbar.className = 'flex items-center justify-between mb-2';

      const languageLabel = document.createElement('span');
      languageLabel.className = 'text-xs text-gray-500 font-mono';
      languageLabel.textContent = node.attrs.language || 'javascript';

      const runButton = document.createElement('button');
      runButton.className = 'px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium';
      runButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Run Code';

      const outputDiv = document.createElement('div');
      outputDiv.className = 'mt-2 p-3 bg-gray-800 text-green-400 rounded-lg font-mono text-sm';
      outputDiv.style.display = node.attrs.executed && node.attrs.output ? 'block' : 'none';
      if (node.attrs.output) {
        outputDiv.textContent = `Output: ${node.attrs.output}`;
      }

      runButton.addEventListener('click', () => {
        if (node.attrs.language === 'javascript') {
          try {
            // WARNING: This executes user code - should be sandboxed in production!
            const result = eval(node.textContent);
            const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
            
            if (typeof getPos === 'function') {
              editor.commands.updateAttributes('codeExecutor', {
                executed: true,
                output: output,
              });
            }
            
            outputDiv.textContent = `Output: ${output}`;
            outputDiv.style.display = 'block';
          } catch (error: any) {
            outputDiv.textContent = `Error: ${error.message}`;
            outputDiv.className = 'mt-2 p-3 bg-gray-800 text-red-400 rounded-lg font-mono text-sm';
            outputDiv.style.display = 'block';
          }
        } else {
          outputDiv.textContent = 'Only JavaScript is supported for execution';
          outputDiv.className = 'mt-2 p-3 bg-gray-800 text-amber-400 rounded-lg font-mono text-sm';
          outputDiv.style.display = 'block';
        }
      });

      toolbar.appendChild(languageLabel);
      toolbar.appendChild(runButton);
      
      dom.appendChild(toolbar);
      dom.appendChild(pre);
      pre.appendChild(code);
      dom.appendChild(outputDiv);

      return {
        dom,
        contentDOM: code,
      };
    };
  },

  addCommands() {
    return {
      setCodeExecutor: (options: { language?: string; code?: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            language: options.language || 'javascript',
          },
          content: options.code ? [{ type: 'text', text: options.code }] : undefined,
        });
      },
    } as any;
  },
});

