import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import SearchBarWrapper from '../components/SearchBarWrapper';


interface Article {
  title: string;
  cover: string;
  date: string;
  tags: string[];
  series: string;
  link: string;
}

const ArticleCard = ({ article }: { article: Article }) => {
  const localDate = new Date(article.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const img = useBaseUrl(article.cover);

  return (
    <a href={article.link} className="article-card">
      <div className="article-card-image-wrapper">
        <img src={img} alt={article.title} className="article-card-image" />
      </div>
      <div className="article-card-content">
        <div className="article-card-tag-row">
          {article.tags.map(tag => (
            <span key={tag} className="article-card-tag">#{tag}</span>
          ))}
        </div>
        <h2 className="article-card-title">{article.title}</h2>
        <h3 className="article-card-description">{article.series}</h3>
        <time className="article-card-date">{localDate}</time>
      </div>
    </a>
  );
};

export default function Home(): React.JSX.Element {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/articles/metadata.json')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Metadata fetch failed", err);
        setLoading(false);
      });
  }, []);

  return (
    <Layout title="Articles">
      <header className="landing-hero" style={{position: "relative"}}>

        <div className='landing-hero-img'></div>
          <h1 className="landing-hero-title">
            Jimmy Writes <span className="landing-hero-italic">Sometimes.</span>
          </h1>
          <p className="landing-hero-sub">AI and Software Engineering.</p>
      </header>
      
      <SearchBarWrapper /> 
      
      <main className="landing-container">
        <div className={`landing-grid ${loading ? 'grid-loading' : 'grid-loaded'}`}>
          {articles.map((article, idx) => (
            <ArticleCard key={idx} article={article} />
          ))}
        </div>
      </main>
    </Layout>
  );
}