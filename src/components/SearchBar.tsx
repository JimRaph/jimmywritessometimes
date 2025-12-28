import React, { useState, useEffect, useRef } from 'react';
// import { pipeline, env } from '@xenova/transformers';
import { Search, Loader2, FileText, X } from 'lucide-react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      mA += vecA[i] * vecA[i];
      mB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
  };

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const indexRef = useRef<any[]>([]);
  const modelRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchIndexPath = useBaseUrl('/search-index.json');
  const modelLocalPath = useBaseUrl('/models/'); 


  const initAI = async () => {
    if (isReady || isInitializing) return;
    
    setIsInitializing(true);
    try {
      // build kept crashing and it's because this import at top level
      // so I moved it here to make it dynamic. This avoids build time evaluation
      // Docusaurus doesn't have a loader to deal with WASM or associated binary files
      // so it kept crashing. 
      const { pipeline, env } = await import('@xenova/transformers');

      env.allowLocalModels = true;
      env.localModelPath = modelLocalPath;
      env.allowRemoteModels = false;

      const response = await fetch(searchIndexPath);
      indexRef.current = await response.json();

      modelRef.current = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      setIsReady(true);
    } catch (err) {
      console.error('Initialization failed:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setResults([]);
        setQuery('')
        setHasSearched(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !isReady) return;

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const output = await modelRef.current(query, { pooling: 'mean', normalize: true });
      const queryVector = Array.from(output.data) as number[];

      const scored = indexRef.current.map(item => {
        const titleScore = cosineSimilarity(queryVector, item.globalEmbedding ?? []);
        const chunkScores = (item.chunkEmbeddings ?? []).map((chunkVec: number[]) => 
          cosineSimilarity(queryVector, chunkVec)
        );
        const bestChunkScore = chunkScores.length > 0 ? Math.max(...chunkScores) : 0;
        const finalScore = Math.max(titleScore * 1.1, bestChunkScore);

        return { ...item, score: finalScore };
      })
      .filter(item => item.score > 0.5) 
      .sort((a, b) => b.score - a.score) 
      .slice(0, 5); 

      setResults(scored);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container" ref={containerRef} style={{ position: 'relative' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search className="search-form-icon" size={18} />
          <input
            type="text"
            placeholder={isReady ? "Describe what you're looking for..." : "Click to wake Jimmy..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={initAI}
            className='search-form-input'
          />
          {isInitializing && <Loader2 className="animate-spin search-loader-inline" size={16} />}
        </div>
        <button 
          type="submit" 
          disabled={!isReady || isLoading}
          className="search-form-btn"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Search"}
        </button>
      </form>


      {(results.length > 0 || (hasSearched && !isLoading)) && (
        <div className="search-results-overlay">
          <div className="search-results-header">
            <span>{results.length} {` ${results.length > 1 ? 'results found': 'result found'}`} </span>
            <X size={16} className="close-icon" onClick={() => { setResults([]); setHasSearched(false); }} />
          </div>

          {results.length > 0 ? (
            <div className="search-results-list">
              {results.map((res: any) => (
                <Link to={res.path} key={res.path} className="search-result-link" onClick={() => setResults([])}>
                  <div className="search-result-card">
                    <div className="res-content-box">
                      <span className='search-result-card-title'>
                        <FileText size={14} style={{ marginRight: '8px' }} /> {res.title}
                      </span>
                      <span className='search-result-match-tag'>
                        {Math.round(res.score * 100)}% match
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-results-state">
              <p>Jimmy can't find articles that matches. Try different keywords.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}