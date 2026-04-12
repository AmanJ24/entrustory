// src/utils/merkle.ts

// Helper to hash two strings together
const hashPair = async (left: string, right: string): Promise<string> => {
  const combined = left + right;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generates a deterministic Merkle Root from an array of file hashes
export const generateMerkleRoot = async (hashes: string[]): Promise<string> => {
  if (hashes.length === 0) return '';
  if (hashes.length === 1) return hashes[0];

  // 1. Lexicographically sort hashes for determinism
  let currentLevel = [...hashes].sort();

  // 2. Build the tree upwards
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      // If odd number of nodes, duplicate the last node
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      
      const parentHash = await hashPair(left, right);
      nextLevel.push(parentHash);
    }
    
    currentLevel = nextLevel;
  }

  return currentLevel[0];
};
