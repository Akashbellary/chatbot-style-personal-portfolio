import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export const getPresentation = tool({
  description:
    'This tool returns a concise personal introduction of Krishna Bantola D. It is used to answer the question "Who are you?" or "Tell me about yourself"',
  parameters: z.object({}),
  execute: async () => {
    try {
      const dbPath = path.join(process.cwd(), 'public', 'db.json');
      const raw = await fs.readFile(dbPath, 'utf-8');
      const db = JSON.parse(raw);
      const p = db?.personal || {};
      return {
        presentation: p.description || '',
        name: p.name || '',
        age: p.age || '',
        location: p.location || '',
        tags: p.tags || [],
      };
    } catch (e) {
      return { presentation: 'Unable to load profile at the moment.' };
    }
  },
});
