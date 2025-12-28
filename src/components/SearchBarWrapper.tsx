import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function SearchBarWrapper() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // this wrapper component is needed to help skip SSR during build time.
    // It is not strictly needed here, because the only browser utility 'document.add*' in
    // SearchBar.tsx is inside a useEffect. But to avoid or ensure third party integration later
    // doesn't affect me. 
    import('./SearchBar').then((module) => {
      setComponent(() => module.default);
    });
  }, []);

  return (
    <BrowserOnly fallback={<div className="search-skeleton">Loading Search...</div>}>
      {() => {
        if (!Component) return <div className="search-skeleton">Waking up AI...</div>;
        return <Component />;
      }}
    </BrowserOnly>
  );
}


