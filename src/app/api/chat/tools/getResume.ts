import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

export const getResume = tool({
  description:
    'This tool show my resume.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const dbPath = path.join(process.cwd(), 'public', 'db.json');
      const raw = await fs.readFile(dbPath, 'utf-8');
      const db = JSON.parse(raw);
      const resumeUrl = db?.personal?.resume || '/KrishnaBantolaResume.pdf';
      return { resume: resumeUrl };
    } catch (e) {
      return { resume: '/KrishnaBantolaResume.pdf' };
    }
  },
});
