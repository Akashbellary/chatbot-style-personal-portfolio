import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export const getInternship = tool({
  description:
    "Gives a summary of the internship details and contact info from db.",
  parameters: z.object({}),
  execute: async () => {
    try {
      const dbPath = path.join(process.cwd(), 'public', 'db.json');
      const raw = await fs.readFile(dbPath, 'utf-8');
      const db = JSON.parse(raw);
      return { internship: db.internship || {} };
    } catch (e) {
      return { internship: {} };
    }
  },
});
