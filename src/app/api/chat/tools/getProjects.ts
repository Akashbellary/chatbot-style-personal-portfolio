
import { tool } from "ai";
import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';


export const getProjects = tool({
  description:
    "This tool will show a list of all projects made by Krishna",
  parameters: z.object({}),
  execute: async () => {
    try {
      const dbPath = path.join(process.cwd(), 'public', 'db.json');
      const raw = await fs.readFile(dbPath, 'utf-8');
      const db = JSON.parse(raw);
      return { projects: db.projects || [] };
    } catch (e) {
      return { projects: [] };
    }
  },
});