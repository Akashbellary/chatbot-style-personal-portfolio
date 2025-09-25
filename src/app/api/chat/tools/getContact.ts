import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export const getContact = tool({
  description:
    'This tool show a my contact informations.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const dbPath = path.join(process.cwd(), 'public', 'db.json');
      const raw = await fs.readFile(dbPath, 'utf-8');
      const db = JSON.parse(raw);
      return { contact: db.contact || {} };
    } catch (e) {
      return { contact: {} };
    }
  },
});
