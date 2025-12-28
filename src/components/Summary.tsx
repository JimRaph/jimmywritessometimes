import React, { useEffect, useState } from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import ReactMarkdown from 'react-markdown'; 
import Admonition from '@theme/Admonition'; 

export default function Summary() {
  const { metadata } = useDoc();
  const [summary, setSummary] = useState(null);

  const relativePath = metadata.source
    .replace('@site/docs/', '')
    .replace('.md', '');

  useEffect(() => {
    async function fetchSummary() {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath }),
      });
      const data = await res.json();
      setSummary(data.summary || data.answer || data.error);
    }
    fetchSummary();
  }, [relativePath]);

  return (
    <div className="summary-container" style={{ marginBottom: '2rem' }}>
      {summary ? (
        <Admonition type="info" title="AI Summary">
          <div className="markdown"> 
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </Admonition>
      ) : (
        <div className="summary-placeholder">Jimmy is summarizing content, please hold....</div>
      )}
    </div>
  );
}