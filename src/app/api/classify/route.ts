export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ intent: 'none' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ intent: 'none' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = {
      model: 'nvidia/nvidia-nemotron-nano-9b-v2',
      messages: [
        {
          role: 'system',
          content:
            'You classify queries for a personal portfolio. Answer in ONE WORD ONLY from this set: Me, Projects, Skills, Experience, Contact, Resume, Education, Achievements. No punctuation, no extra text.',
        },
        {
          role: 'user',
          content: `Answer in one word: What is the user asking for in this query: "${query}"? Options: [Me, Projects, Skills, Experience, Contact, Resume, Education, Achievements]`,
        },
      ],
      temperature: 0.0,
      top_p: 1.0,
      max_tokens: 3,
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
      return new Response(JSON.stringify({ intent: 'none' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const data = await res.json();
    const raw = (data?.choices?.[0]?.message?.content || '').trim();
    const oneWord = raw.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '') || '';
    const normalized = oneWord.toLowerCase();
    let intent = 'none';
    if (normalized === 'me') intent = 'me';
    else if (normalized === 'project' || normalized === 'projects' || normalized === 'work') intent = 'projects';
    else if (normalized === 'skills' || normalized === 'skill') intent = 'skills';
    else if (normalized === 'experience' || normalized === 'experiences') intent = 'experience';
    else if (normalized === 'contact' || normalized === 'contacts') intent = 'contact';
    else if (normalized === 'resume' || normalized === 'cv') intent = 'resume';
    else if (normalized === 'education' || normalized === 'degree' || normalized === 'studies') intent = 'education';
    else if (normalized === 'achievements' || normalized === 'achievement' || normalized === 'awards') intent = 'achievements';

    return new Response(JSON.stringify({ intent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ intent: 'none' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }
}


