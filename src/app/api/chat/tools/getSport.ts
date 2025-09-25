
import { tool } from "ai";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';


export const getSports = tool({
  description:
    "This tool will show some photos of Krishna Bantola doing sports",
  parameters: z.object({}),
  execute: async () => {
    try {
      const dbPath = path.join(process.cwd(), 'public', 'db.json');
      const raw = await fs.readFile(dbPath, 'utf-8');
      const db = JSON.parse(raw);
      return { interests: db.interests || [] };
    } catch (e) {
      return { interests: [] };
    }
  },
});