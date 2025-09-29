'use client';

import React from 'react';
import { ExpandableCard } from '@/components/ui/expandable-card';
import { type Message } from 'ai/react';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type ChatMessageContentProps = {
  message: Message;
  isLast?: boolean;
  isLoading?: boolean;
  reload?: () => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  skipToolRendering?: boolean;
};

const CodeBlock = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  const firstLineBreak = content.indexOf('\n');
  const firstLine = content.substring(0, firstLineBreak).trim();
  const language = firstLine || 'text';
  const code = firstLine ? content.substring(firstLineBreak + 1) : content;

  const previewLines = code.split('\n').slice(0, 1).join('\n');
  const hasMoreLines = code.split('\n').length > 1;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="my-4 w-full overflow-hidden rounded-md"
    >
      <div className="bg-secondary text-secondary-foreground flex items-center justify-between rounded-t-md border-b px-4 py-1">
        <span className="text-xs">
          {language !== 'text' ? language : 'Code'}
        </span>
        <CollapsibleTrigger className="hover:bg-secondary/80 rounded p-1">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
      </div>

      <div className="bg-accent/80 text-accent-foreground rounded-b-md">
        {!isOpen && hasMoreLines ? (
          <pre className="px-4 py-3">
            <code className="text-sm">{previewLines + '\n...'}</code>
          </pre>
        ) : (
          <CollapsibleContent>
            <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
              <pre className="min-w-max px-4 py-3">
                <code className="text-sm whitespace-pre">{code}</code>
              </pre>
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};

function CompactImage({ src, alt }: { src: string; alt: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="h-20 w-20 rounded-lg object-cover"
      loading="lazy"
    />
  );
}

function MeCard({ personal }: { personal: any }) {
  return (
    <ExpandableCard type="me" data={personal}>
      <div className="bg-accent/50 border-border/60 flex w-full max-w-xl items-center gap-3 rounded-2xl border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <CompactImage src={personal.profileImage} alt={personal.name} />
        <div className="flex min-w-0 flex-col">
          <div className="text-foreground truncate text-sm font-semibold">{personal.name}</div>
          <div className="text-muted-foreground truncate text-xs">{personal.age} • {personal.location}</div>
          <div className="text-foreground mt-1 line-clamp-3 text-xs whitespace-pre-line">{personal.description}</div>
        </div>
      </div>
    </ExpandableCard>
  );
}

function ProjectCard({ project }: { project: any }) {
  const thumb = project.thumbnail || (project.images && project.images[0]?.src) || '';
  const tech = Array.isArray(project.techStack) ? project.techStack.slice(0, 6).join(', ') : '';
  return (
    <ExpandableCard type="projects" data={project}>
      <div className="bg-accent/50 border-border/60 flex w-full max-w-xl items-start gap-3 rounded-2xl border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <CompactImage src={thumb} alt={project.title} />
        <div className="flex min-w-0 flex-col">
          <div className="text-foreground truncate text-sm font-semibold">{project.title}</div>
          <div className="text-muted-foreground truncate text-[11px]">{project.category}{project.date ? ` • ${project.date}` : ''}</div>
          <div className="text-foreground mt-1 line-clamp-2 text-xs">{project.description}</div>
          {tech && <div className="text-muted-foreground mt-1 truncate text-[11px]"><span className="font-medium">Tech:</span> {tech}</div>}
          {Array.isArray(project.links) && project.links.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {project.links.slice(0, 3).map((l: any, i: number) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                  {l.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </ExpandableCard>
  );
}

function SkillsCard({ skills }: { skills: any[] }) {
  return (
    <div className="bg-accent/50 border-border/60 w-full max-w-xl rounded-2xl border p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-2">
        {skills.slice(0, 6).map((s: any, i: number) => (
          <div key={i} className="flex items-start gap-2">
            <div className="text-foreground shrink-0 text-xs font-semibold">{s.category}:</div>
            <div className="text-muted-foreground text-xs">{Array.isArray(s.skills) ? s.skills.join(', ') : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactCard({ contact }: { contact: any }) {
  return (
    <ExpandableCard type="contact" data={contact}>
      <div className="bg-accent/50 border-border/60 flex w-full max-w-xl items-start gap-3 rounded-2xl border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <CompactImage src="/AI Profile.png" alt={contact.name} />
        <div className="flex min-w-0 flex-col">
          <div className="text-foreground truncate text-sm font-semibold">{contact.name}</div>
          <div className="text-muted-foreground truncate text-xs">{contact.handle}</div>
          <a className="text-blue-600 text-xs hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>
          {Array.isArray(contact.socials) && contact.socials.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {contact.socials.slice(0, 5).map((s: any, i: number) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                  {s.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </ExpandableCard>
  );
}

function InternshipCardCompact({ internship }: { internship: any }) {
  return (
    <div className="bg-accent/50 border-border/60 flex w-full max-w-xl items-start gap-3 rounded-2xl border p-3 shadow-sm">
      <CompactImage src={internship.avatar || ''} alt={internship.name || 'Avatar'} />
      <div className="flex min-w-0 flex-col">
        <div className="text-foreground truncate text-sm font-semibold">{internship.name || ''}</div>
        <div className="text-muted-foreground truncate text-xs">{internship.location || ''}</div>
        <div className="text-foreground mt-1 text-xs">{internship.applicationStatus ? `Status: ${internship.applicationStatus}` : ''}</div>
        <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">{internship.goal || ''}</div>
      </div>
    </div>
  );
}

function ExperienceCard({ experience }: { experience: any }) {
  return (
    <div className="bg-accent/50 border-border/60 flex w-full max-w-xl items-start gap-3 rounded-2xl border p-3 shadow-sm">
      <div className="flex min-w-0 flex-col">
        <div className="text-foreground truncate text-sm font-semibold">{experience.company}</div>
        <div className="text-muted-foreground truncate text-xs">{experience.role}</div>
        <div className="text-foreground mt-1 line-clamp-3 text-xs whitespace-pre-line">{experience.description}</div>
      </div>
    </div>
  );
}

function EducationCard({ education }: { education: any }) {
  return (
    <div className="bg-accent/50 border-border/60 w-full max-w-xl rounded-2xl border p-3 shadow-sm">
      <div className="text-foreground truncate text-sm font-semibold">{education.institution}</div>
      <div className="text-muted-foreground truncate text-xs">{education.degree} • {education.duration}</div>
      {education.score && (
        <div className="text-muted-foreground mt-1 text-xs">Score: {education.score}</div>
      )}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: any }) {
  return (
    <div className="bg-accent/50 border-border/60 w-full max-w-xl rounded-2xl border p-3 shadow-sm">
      <div className="text-foreground truncate text-sm font-semibold">{achievement.title}</div>
      {Array.isArray(achievement.details) && achievement.details.length > 0 && (
        <ul className="text-muted-foreground mt-1 list-disc pl-5 text-xs">
          {achievement.details.map((d: string, i: number) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
      {Array.isArray(achievement.links) && achievement.links.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {achievement.links.map((l: any, i: number) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
              {l.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatMessageContent({
  message,
}: ChatMessageContentProps) {
  const contentRaw = useMemo(() => (message?.content || '').toString(), [message]);
  const content = contentRaw.trim();

  // Extract a JSON object that starts after a marker, tolerating trailing text
  function extractJsonAfterMarker(text: string, marker: string): any | null {
    const idx = text.indexOf(marker);
    if (idx === -1) return null;
    const after = text.slice(idx + marker.length);
    const start = after.indexOf('{');
    if (start === -1) return null;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < after.length; i++) {
      const ch = after[i];
      if (inStr) {
        if (esc) {
          esc = false;
        } else if (ch === '\\') {
          esc = true;
        } else if (ch === '"') {
          inStr = false;
        }
      } else {
        if (ch === '"') inStr = true;
        else if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            const jsonStr = after.slice(start, i + 1);
            try {
              return JSON.parse(jsonStr);
            } catch {
              return null;
            }
          }
        }
      }
    }
    return null;
  }

  // Card payload detection: ::card::{...json}
  if (content.includes('::card::')) {
    try {
      const payload = extractJsonAfterMarker(content, '::card::');
      if (!payload) throw new Error('no json');
      if (payload.type === 'me') return <MeCard personal={payload.personal} />;
      if (payload.type === 'projects') {
        const list = Array.isArray(payload.projects) ? payload.projects : [];
        return (
          <div className="flex w-full flex-col gap-2">
            {list.map((p: any, i: number) => (
              <ProjectCard key={i} project={p} />
            ))}
          </div>
        );
      }
      if (payload.type === 'skills') return <SkillsCard skills={payload.skills || []} />;
      if (payload.type === 'contact') return <ContactCard contact={payload.contact || {}} />;
      if (payload.type === 'internship') return <InternshipCardCompact internship={payload.internship || {}} />;
      if (payload.type === 'experience') {
        const list = Array.isArray(payload.experience) ? payload.experience : [];
        return (
          <div className="flex w-full flex-col gap-2">
            {list.map((e: any, i: number) => (
              <ExperienceCard key={`exp-${i}`} experience={e} />
            ))}
          </div>
        );
      }
      if (payload.type === 'resume') return (
        <div className="bg-accent/50 border-border/60 w-full max-w-xl rounded-2xl border p-3 shadow-sm">
          <a href={payload.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Open Resume</a>
        </div>
      );
      if (payload.type === 'education') {
        const list = Array.isArray(payload.education) ? payload.education : [];
        return (
          <div className="flex w-full flex-col gap-2">
            {list.map((ed: any, i: number) => (
              <EducationCard key={`edu-${i}`} education={ed} />
            ))}
          </div>
        );
      }
      if (payload.type === 'achievements') {
        const list = Array.isArray(payload.achievements) ? payload.achievements : [];
        return (
          <div className="flex w-full flex-col gap-2">
            {list.map((ach: any, i: number) => (
              <AchievementCard key={`ach-${i}`} achievement={ach} />
            ))}
          </div>
        );
      }
      if (payload.type === 'text') return <div className="text-sm">{payload.text}</div>;
    } catch {
      // fall through to markdown renderer
    }
  }

  // Multi-card payload detection: ::card-multi::{ items: [...] }
  if (content.includes('::card-multi::')) {
    try {
      const wrapper = extractJsonAfterMarker(content, '::card-multi::');
      if (!wrapper) throw new Error('no json');
      const items = Array.isArray(wrapper?.items) ? wrapper.items : [];
      return (
        <div className="flex w-full flex-col gap-2">
          {items.map((p: any, i: number) => {
            const blocks: React.ReactNode[] = [];
            if (p.natural) {
              blocks.push(
                <div key={`lead-${i}`} className="text-foreground text-sm">
                  {p.natural}
                </div>
              );
            }
            if (p.type === 'me') {
              blocks.push(<MeCard key={`me-${i}`} personal={p.personal} />);
            } else if (p.type === 'projects') {
              const list = Array.isArray(p.projects) ? p.projects : [];
              blocks.push(
                <div key={`projects-${i}`} className="flex w-full flex-col gap-2">
                  {list.map((proj: any, j: number) => (
                    <ProjectCard key={`proj-${i}-${j}`} project={proj} />
                  ))}
                </div>
              );
            } else if (p.type === 'skills') {
              blocks.push(<SkillsCard key={`skills-${i}`} skills={p.skills || []} />);
            } else if (p.type === 'contact') {
              blocks.push(<ContactCard key={`contact-${i}`} contact={p.contact || {}} />);
            } else if (p.type === 'experience') {
              const list = Array.isArray(p.experience) ? p.experience : [];
              blocks.push(
                <div key={`experience-${i}`} className="flex w-full flex-col gap-2">
                  {list.map((e: any, j: number) => (
                    <ExperienceCard key={`exp-${i}-${j}`} experience={e} />
                  ))}
                </div>
              );
            } else if (p.type === 'resume') {
              blocks.push(
                <div key={`resume-${i}`} className="bg-accent/50 border-border/60 w-full max-w-xl rounded-2xl border p-3 shadow-sm">
                  <a href={p.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Open Resume</a>
                </div>
              );
            } else if (p.type === 'education') {
              const list = Array.isArray(p.education) ? p.education : [];
              blocks.push(
                <div key={`education-${i}`} className="flex w-full flex-col gap-2">
                  {list.map((ed: any, j: number) => (
                    <EducationCard key={`edu-${i}-${j}`} education={ed} />
                  ))}
                </div>
              );
            } else if (p.type === 'achievements') {
              const list = Array.isArray(p.achievements) ? p.achievements : [];
              blocks.push(
                <div key={`achievements-${i}`} className="flex w-full flex-col gap-2">
                  {list.map((ach: any, j: number) => (
                    <AchievementCard key={`ach-${i}-${j}`} achievement={ach} />
                  ))}
                </div>
              );
            }
            return <React.Fragment key={`block-${i}`}>{blocks}</React.Fragment>;
          })}
        </div>
      );
    } catch {
      // ignore and fall back to markdown
    }
  }

  // Default: render as markdown/text with code support
  const renderContent = () => {
    return message.parts?.map((part, partIndex) => {
      if (part.type !== 'text' || !part.text) return null;
      const partText: string = part.text;

      // Intercept inline card payloads inside parts as well
      if (partText.includes('::card-multi::')) {
        try {
          const wrapper = extractJsonAfterMarker(partText, '::card-multi::');
          if (!wrapper) throw new Error('no json');
          const items = Array.isArray(wrapper?.items) ? wrapper.items : [];
          return (
            <div key={`multi-${partIndex}`} className="flex w-full flex-col gap-2">
              {items.map((p: any, i: number) => {
                const blocks: React.ReactNode[] = [];
                if (p.natural) {
                  blocks.push(
                    <div key={`lead-${i}`} className="text-foreground text-sm">
                      {p.natural}
                    </div>
                  );
                }
                if (p.type === 'me') {
                  blocks.push(<MeCard key={`me-${i}`} personal={p.personal} />);
                } else if (p.type === 'projects') {
                  const list = Array.isArray(p.projects) ? p.projects : [];
                  blocks.push(
                    <div key={`projects-${i}`} className="flex w-full flex-col gap-2">
                      {list.map((proj: any, j: number) => (
                        <ProjectCard key={`proj-${i}-${j}`} project={proj} />
                      ))}
                    </div>
                  );
                } else if (p.type === 'skills') {
                  blocks.push(<SkillsCard key={`skills-${i}`} skills={p.skills || []} />);
                } else if (p.type === 'contact') {
                  blocks.push(<ContactCard key={`contact-${i}`} contact={p.contact || {}} />);
                } else if (p.type === 'experience') {
                  const list = Array.isArray(p.experience) ? p.experience : [];
                  blocks.push(
                    <div key={`experience-${i}`} className="flex w-full flex-col gap-2">
                      {list.map((e: any, j: number) => (
                        <ExperienceCard key={`exp-${i}-${j}`} experience={e} />
                      ))}
                    </div>
                  );
                } else if (p.type === 'resume') {
                  blocks.push(
                    <div key={`resume-${i}`} className="bg-accent/50 border-border/60 w-full max-w-xl rounded-2xl border p-3 shadow-sm">
                      <a href={p.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Open Resume</a>
                    </div>
                  );
                }
                return <React.Fragment key={`block-${i}`}>{blocks}</React.Fragment>;
              })}
            </div>
          );
        } catch {
          // fall through to markdown renderer
        }
      }
      if (partText.includes('::card::')) {
        try {
          const payload = extractJsonAfterMarker(partText, '::card::');
          if (!payload) throw new Error('no json');
          if (payload.type === 'me') return <MeCard key={`me-${partIndex}`} personal={payload.personal} />;
          if (payload.type === 'projects') {
            const list = Array.isArray(payload.projects) ? payload.projects : [];
            return (
              <div key={`projects-${partIndex}`} className="flex w-full flex-col gap-2">
                {list.map((proj: any, j: number) => (
                  <ProjectCard key={`proj-${partIndex}-${j}`} project={proj} />
                ))}
              </div>
            );
          }
          if (payload.type === 'skills') return <SkillsCard key={`skills-${partIndex}`} skills={payload.skills || []} />;
          if (payload.type === 'contact') return <ContactCard key={`contact-${partIndex}`} contact={payload.contact || {}} />;
          if (payload.type === 'experience') {
            const list = Array.isArray(payload.experience) ? payload.experience : [];
            return (
              <div key={`experience-${partIndex}`} className="flex w-full flex-col gap-2">
                {list.map((e: any, j: number) => (
                  <ExperienceCard key={`exp-${partIndex}-${j}`} experience={e} />
                ))}
              </div>
            );
          }
          if (payload.type === 'resume') return (
            <div key={`resume-${partIndex}`} className="bg-accent/50 border-border/60 w-full max-w-xl rounded-2xl border p-3 shadow-sm">
              <a href={payload.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Open Resume</a>
            </div>
          );
          if (payload.type === 'education') {
            const list = Array.isArray(payload.education) ? payload.education : [];
            return (
              <div key={`education-${partIndex}`} className="flex w-full flex-col gap-2">
                {list.map((ed: any, j: number) => (
                  <EducationCard key={`edu-${partIndex}-${j}`} education={ed} />
                ))}
              </div>
            );
          }
          if (payload.type === 'achievements') {
            const list = Array.isArray(payload.achievements) ? payload.achievements : [];
            return (
              <div key={`achievements-${partIndex}`} className="flex w-full flex-col gap-2">
                {list.map((ach: any, j: number) => (
                  <AchievementCard key={`ach-${partIndex}-${j}`} achievement={ach} />
                ))}
              </div>
            );
          }
        } catch {
          // fall through to markdown renderer
        }
      }

      const contentParts = partText.split('```');

      return (
        <div key={partIndex} className="w-full space-y-4">
          {contentParts.map((content, i) =>
            i % 2 === 0 ? (
              <div key={`text-${i}`} className="prose dark:prose-invert w-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }: any) => (
                      <p className="break-words whitespace-pre-wrap text-sm">
                        {children}
                      </p>
                    ),
                    ul: ({ children }: any) => (
                      <ul className="my-4 list-disc pl-6">{children}</ul>
                    ),
                    ol: ({ children }: any) => (
                      <ol className="my-4 list-decimal pl-6">{children}</ol>
                    ),
                    li: ({ children }: any) => <li className="my-1">{children}</li>,
                    a: ({ href, children }: any) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {children}
                      </a>
                    ),
                    img: ({ src, alt }: any) => (
                      <img src={src || ''} alt={alt || ''} className="h-20 w-20 rounded-lg object-cover" />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <CodeBlock key={`code-${i}`} content={content} />
            )
          )}
        </div>
      );
    });
  };

  return <div className="w-full">{renderContent()}</div>;
}
