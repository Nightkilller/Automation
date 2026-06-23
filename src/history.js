import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.resolve('history.json');

/**
 * Loads the topic history from history.json.
 * @returns {Array} List of historical topic objects.
 */
export function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data || '[]');
    }
  } catch (error) {
    console.error('Error loading history.json, fallback to empty array:', error);
  }
  return [];
}

/**
 * Saves a topic run to history.json and prunes records older than 90 days.
 * @param {Object} topicObj - { type: 'news' | 'concept', seed: string }
 */
export function saveTopicToHistory(topicObj) {
  try {
    const history = loadHistory();
    history.push({
      topic: topicObj.seed,
      type: topicObj.type,
      date: new Date().toISOString(),
    });

    // Prune entries older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const prunedHistory = history.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= ninetyDaysAgo;
    });

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(prunedHistory, null, 2), 'utf-8');
    console.log(`Saved "${topicObj.seed}" to history. Pruned history size is ${prunedHistory.length}.`);
  } catch (error) {
    console.error('Failed to write history file:', error);
  }
}

/**
 * Checks if a topic has been used within the specified number of days.
 * @param {string} topicTitle - The topic seed to check.
 * @param {number} days - Number of days to look back (default 30).
 * @returns {boolean} True if the topic matches a recent entry.
 */
export function isTopicRecent(topicTitle, days = 30) {
  const history = loadHistory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const cleanString = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanedTarget = cleanString(topicTitle);

  if (!cleanedTarget) return false;

  return history.some(entry => {
    const entryDate = new Date(entry.date);
    if (entryDate < cutoffDate) return false;

    const cleanedEntry = cleanString(entry.topic);
    // Simple fuzzy substring match
    return cleanedTarget.includes(cleanedEntry) || cleanedEntry.includes(cleanedTarget);
  });
}
