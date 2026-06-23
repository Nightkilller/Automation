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
 * Selects exactly 6 distinct topics for the daily roundup.
 * Prioritizes fresh RSS news items, falling back to tech concepts if needed.
 * @returns {Promise<Object>} Object containing { type: 'roundup', seeds: string[] }
 */
export async function pickTopic() {
  console.log('[PICKER] Gathering 6 distinct topics for today\'s tech roundup...');
  const selectedSeeds = [];

  // 1. Try to fetch news feeds
  try {
    const tcItems = await fetchRssItems('https://techcrunch.com/feed/');
    const hnItems = await fetchRssItems('https://news.ycombinator.com/rss');
    const allItems = [...tcItems, ...hnItems];

    console.log(`[PICKER] Fetched ${allItems.length} total news items from TechCrunch & HackerNews.`);

    // Filter out items used in the last 30 days
    const freshItems = allItems.filter(item => !isTopicRecent(item.title, 30));
    console.log(`[PICKER] ${freshItems.length} de-duplicated news items available.`);

    // Shuffle and pick up to 6 unique news items
    const shuffledNews = freshItems.sort(() => 0.5 - Math.random());
    for (const item of shuffledNews) {
      if (selectedSeeds.length >= 6) break;

      const titleClean = (item.title || '').trim();
      // Avoid adding duplicate seeds
      if (titleClean && !selectedSeeds.some(s => s.includes(titleClean))) {
        selectedSeeds.push(`News Title: ${titleClean} (Link: ${item.link})`);
      }
    }
  } catch (err) {
    console.error('[PICKER] Failed fetching RSS news. Relying on evergreen concepts.', err);
  }

  // 2. Fill remaining slots with evergreen concepts if news items are fewer than 6
  if (selectedSeeds.length < 6) {
    console.log(`[PICKER] News items insufficient (${selectedSeeds.length}/6). Filling remaining slots with concepts...`);
    const freshConcepts = EVERGREEN_CONCEPTS.filter(concept => !isTopicRecent(concept, 30));
    const shuffledConcepts = freshConcepts.sort(() => 0.5 - Math.random());

    for (const concept of shuffledConcepts) {
      if (selectedSeeds.length >= 6) break;
      const conceptClean = concept.trim();
      const formattedSeed = `Tech Concept: ${conceptClean}`;
      if (!selectedSeeds.includes(formattedSeed)) {
        selectedSeeds.push(formattedSeed);
      }
    }
  }

  // 3. Absolute fallback: if still short of 6 (e.g. extreme history exhaustion), ignore limits
  if (selectedSeeds.length < 6) {
    console.log('[PICKER] WARNING: Still short of 6 topics. Resetting history filter to fill slots.');
    const shuffledAllConcepts = [...EVERGREEN_CONCEPTS].sort(() => 0.5 - Math.random());
    for (const concept of shuffledAllConcepts) {
      if (selectedSeeds.length >= 6) break;
      const formattedSeed = `Tech Concept: ${concept.trim()}`;
      if (!selectedSeeds.includes(formattedSeed)) {
        selectedSeeds.push(formattedSeed);
      }
    }
  }

  console.log('[PICKER] Successfully chosen 6 topics for the daily roundup:');
  selectedSeeds.forEach((seed, idx) => {
    console.log(`  ${idx + 1}. ${seed.substring(0, 80)}`);
  });

  return {
    type: 'roundup',
    seeds: selectedSeeds
  };
}

/**
 * Safely fetches RSS items from a URL.
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
