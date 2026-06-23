import Parser from 'rss-parser';
import { isTopicRecent } from './history.js';

const parser = new Parser();

// A list of 40 high-quality evergreen tech and AI concepts to explain
const EVERGREEN_CONCEPTS = [
  "Retrieval-Augmented Generation (RAG)",
  "Vector Embeddings",
  "Transformer Attention Mechanism",
  "Quantization in LLMs",
  "WebAssembly (Wasm)",
  "Edge Computing",
  "Zero-Knowledge Proofs (ZKPs)",
  "Conflict-Free Replicated Data Types (CRDTs)",
  "Retrieval-Aware Fine-Tuning (RAFT)",
  "Low-Rank Adaptation (LoRA)",
  "Microservices vs. Monoliths",
  "Serverless Architecture",
  "Kubernetes & Container Orchestration",
  "Graph Neural Networks (GNNs)",
  "Mixture of Experts (MoE)",
  "Neural Radiance Fields (NeRF)",
  "Diffusion Models (How text-to-image works)",
  "WebSockets and Real-time Web",
  "HTTP/3 and the QUIC Protocol",
  "Event Sourcing & CQRS",
  "GraphQL vs REST APIs",
  "Cross-Site Scripting (XSS) & Prevention",
  "Zero Trust Security Model",
  "Docker & Containerization Basics",
  "Server-Sent Events (SSE)",
  "Content Delivery Networks (CDNs)",
  "SQL vs NoSQL Databases",
  "Distributed Consensus (Raft vs Paxos)",
  "OAuth 2.0 & OpenID Connect",
  "AI Agents & Tool Use",
  "Reinforcement Learning from Human Feedback (RLHF)",
  "Direct Preference Optimization (DPO)",
  "Prompt Engineering Techniques",
  "Chain of Thought (CoT) Prompting",
  "Vector Databases (e.g. Pinecone, Chroma)",
  "Cache Invalidation & Strategies",
  "SSG vs SSR vs ISR",
  "Infrastructure as Code (IaC)",
  "Decentralized Identifiers (DIDs)",
  "Semantic Search vs Lexical Search"
];

/**
 * Decides a topic using a mix strategy: RSS feeds vs evergreen concepts.
 * @returns {Promise<Object>} Object containing { type: 'news' | 'concept', seed: string }
 */
export async function pickTopic() {
  const chooseNews = Math.random() < 0.5;
  console.log(`[PICKER] Strategy chosen: ${chooseNews ? 'Trending News' : 'Evergreen Concept'}`);

  if (chooseNews) {
    try {
      const tcItems = await fetchRssItems('https://techcrunch.com/feed/');
      const hnItems = await fetchRssItems('https://news.ycombinator.com/rss');
      const allItems = [...tcItems, ...hnItems];

      console.log(`[PICKER] Fetched ${allItems.length} total news items from TechCrunch & HackerNews.`);

      // Filter out items used in the last 30 days
      const freshItems = allItems.filter(item => !isTopicRecent(item.title, 30));
      console.log(`[PICKER] ${freshItems.length} news items remaining after 30-day de-duplication.`);

      if (freshItems.length > 0) {
        const selected = freshItems[Math.floor(Math.random() * freshItems.length)];
        return {
          type: 'news',
          seed: `Title: ${selected.title}\nLink: ${selected.link}`
        };
      }
      console.log('[PICKER] No fresh news items found. Falling back to evergreen concepts.');
    } catch (err) {
      console.error('[PICKER] Failed to fetch/parse news RSS feeds. Falling back to concepts.', err);
    }
  }

  // Concept picking path (or fallback if news failed/exhausted)
  const freshConcepts = EVERGREEN_CONCEPTS.filter(concept => !isTopicRecent(concept, 30));
  console.log(`[PICKER] ${freshConcepts.length} concepts remaining after 30-day de-duplication.`);

  if (freshConcepts.length > 0) {
    const selected = freshConcepts[Math.floor(Math.random() * freshConcepts.length)];
    return {
      type: 'concept',
      seed: selected
    };
  }

  // Absolute fallback: ignore the 30-day constraint if everything is exhausted
  console.log('[PICKER] WARNING: All concepts used in last 30 days. Disregarding 30-day history rule to proceed.');
  const selected = EVERGREEN_CONCEPTS[Math.floor(Math.random() * EVERGREEN_CONCEPTS.length)];
  return {
    type: 'concept',
    seed: selected
  };
}

/**
 * Safely fetches RSS items from a URL.
 * @param {string} url - RSS feed URL
 * @returns {Promise<Array>} Array of parsed items containing { title, link }
 */
async function fetchRssItems(url) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map(item => ({
      title: item.title || '',
      link: item.link || ''
    }));
  } catch (err) {
    console.error(`[PICKER] Failed parsing RSS from ${url}:`, err);
    return [];
  }
}
