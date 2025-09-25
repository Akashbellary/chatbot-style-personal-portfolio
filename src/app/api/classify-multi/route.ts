export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    console.log('[classify-multi] incoming query:', query);
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ cards: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.error('[classify-multi] NVIDIA_API_KEY is missing');
      return new Response(JSON.stringify({ cards: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = {
      model: 'nvidia/nvidia-nemotron-nano-9b-v2',
      messages: [
        { role: 'system', content: '/no_think' },
        {
          role: 'user',
          content: `You classify user queries="${query}" for a personal portfolio UI. From this set: Me, Projects, Skills, Experience, Contact, Resume, Education, Achievements — return which cards to show. STRICTLY JSON OUTPUT, NO NATURAL LANGUAGE. Output EXACTLY a JSON array of objects with keys {"natural": string, "card": "Me|Projects|Skills|Experience|Contact|Resume|Education|Achievements"}. Each object's natural must be a short, natural-sounding lead-in that fits the user's phrasing. No explanation, no extra text.\n\nqueries = {${query}}\n\nExample:\n[{"natural":"Okay let me introduce myself","card":"Me"},{"natural":"And here are some projects you can try","card":"Projects"}]`,
        },
      ],
      temperature: 0.0,
      top_p: 1.0,
      max_tokens: 128,
      stream: false,
      frequency_penalty: 0,
      presence_penalty: 0,
      extra_body: {
        min_thinking_tokens: 0,
        max_thinking_tokens: 0,
      },
    };

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => '');
      console.error('[classify-multi] LLM HTTP error', res.status, errTxt);
      return new Response(JSON.stringify({ cards: [] }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const data = await res.json();
    console.log('[classify-multi] full LLM JSON:', JSON.stringify(data));
    const msg = data?.choices?.[0]?.message || {};
    const rawContent = (msg?.content || '').trim();
    const rawReason = (msg?.reasoning_content || '').trim();
    let raw = (rawContent || rawReason || '').trim();
    console.log('[classify-multi] raw LLM reply:', raw);
    let itemsOut: { natural: string; card: string }[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // If array of objects with natural/card
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
          itemsOut = parsed
            .map((it: any) => ({
              natural: String(it?.natural || '').trim(),
              card: String(it?.card || '').trim(),
            }))
            .filter((it: any) => it.natural && it.card);
        } else {
          // Backward compatibility: array of strings
          const allow = new Set(['me','projects','skills','experience','contact','resume','education','achievements']);
          itemsOut = parsed
            .map((c: any) => String(c).toLowerCase())
            .filter((c: string) => allow.has(c))
            .map((c: string) => ({ natural: '', card: c }));
        }
      }
    } catch {
      // try to extract JSON array substring
      const m = raw.match(/\[(.|\n|\r)*\]/);
      if (m) {
        try {
          const arr = JSON.parse(m[0]);
          if (Array.isArray(arr)) {
            if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null) {
              itemsOut = arr
                .map((it: any) => ({
                  natural: String(it?.natural || '').trim(),
                  card: String(it?.card || '').trim(),
                }))
                .filter((it: any) => it.natural && it.card);
            } else {
              const allow = new Set(['me','projects','skills','experience','contact','resume','education','achievements']);
              itemsOut = arr
                .map((c: any) => String(c).toLowerCase())
                .filter((c: string) => allow.has(c))
                .map((c: string) => ({ natural: '', card: c }));
            }
          }
        } catch {}
      }
      // Attempt simple recovery if truncated (common when finish_reason === 'length')
      if (raw.startsWith('[') && !raw.trim().endsWith(']')) {
        try {
          const recovered = JSON.parse(raw + ']');
          if (Array.isArray(recovered)) {
            recovered.forEach((it: any) => {
              const natural = String(it?.natural || '').trim();
              const card = String(it?.card || '').trim();
              if (natural && card) itemsOut.push({ natural, card });
            });
          }
        } catch {}
      }
    }

    // Normalize cards and trim natural
    const mapCard = (c: string) => {
      const n = c.toLowerCase();
      if (n === 'project' || n === 'projects') return 'projects';
      if (n === 'skills' || n === 'skill') return 'skills';
      if (n === 'experience' || n === 'experiences') return 'experience';
      if (n === 'resume' || n === 'cv') return 'resume';
      if (n === 'education' || n === 'degree' || n === 'studies') return 'education';
      if (n === 'achievements' || n === 'achievement' || n === 'awards') return 'achievements';
      if (n === 'contact' || n === 'contacts') return 'contact';
      if (n === 'me') return 'me';
      return '';
    };
    const normalizedItems = itemsOut
      .map((it) => ({ natural: it.natural, card: mapCard(it.card) }))
      .filter((it) => it.card);
    console.log('[classify-multi] normalized items:', normalizedItems);

    // If empty, fallback to single intent classifier
    if (normalizedItems.length === 0) {
      try {
        const single = await fetch('http://localhost:3000/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const sj = await single.json();
        console.log('[classify-multi] fallback single intent:', sj);
        const map: Record<string, string> = { me: 'me', project: 'projects', projects: 'projects', skills: 'skills', fun: 'fun', contact: 'contact' };
        const m = map[String(sj.intent || '').toLowerCase()];
        if (m) normalizedItems.push({ natural: '', card: m });
      } catch {}
    }

    return new Response(JSON.stringify({ items: normalizedItems }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    console.error('[classify-multi] unhandled error');
    return new Response(JSON.stringify({ cards: [] }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }
}


