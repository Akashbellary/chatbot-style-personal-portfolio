'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { X } from 'lucide-react';

interface ExpandableCardProps {
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  type?: 'me' | 'projects' | 'contact' | 'experience' | 'achievements' | 'education' | 'skills';
  data?: any;
}

function CompactImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-full object-cover"
      loading="lazy"
    />
  );
}

function ExpandedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full md:w-[35%] flex-shrink-0">
      <img
        src={src}
        alt={alt}
        className="w-full h-48 md:h-full object-cover rounded-lg"
        loading="lazy"
      />
    </div>
  );
}

function ExpandedMeContent({ personal }: { personal: any }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      <ExpandedImage src={personal.profileImage} alt={personal.name} />
      <div className="flex-1 flex flex-col justify-between p-2">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{personal.name}</h3>
          <p className="text-muted-foreground text-sm mb-3">{personal.age} • {personal.location}</p>
          <div className="text-foreground text-sm leading-relaxed whitespace-pre-line">
            {personal.description}
          </div>
        </div>
        {personal.interests && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Interests:</h4>
            <p className="text-muted-foreground text-sm">{personal.interests}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpandedProjectContent({ project }: { project: any }) {
  const thumb = project.thumbnail || (project.images && project.images[0]?.src) || '';
  const tech = Array.isArray(project.techStack) ? project.techStack.join(', ') : '';
  
  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      <ExpandedImage src={thumb} alt={project.title} />
      <div className="flex-1 flex flex-col justify-between p-2">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{project.title}</h3>
          <p className="text-muted-foreground text-sm mb-3">
            {project.category}{project.date ? ` • ${project.date}` : ''}
          </p>
          <div className="text-foreground text-sm leading-relaxed mb-4">
            {project.description}
          </div>
          {tech && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-1">Tech Stack:</h4>
              <p className="text-muted-foreground text-sm">{tech}</p>
            </div>
          )}
        </div>
        {Array.isArray(project.links) && project.links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.links.map((l: any, i: number) => (
              <a 
                key={i} 
                href={l.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-700 transition-colors"
              >
                {l.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpandedContactContent({ contact }: { contact: any }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      <ExpandedImage src="/AI Profile.png" alt={contact.name} />
      <div className="flex-1 flex flex-col justify-between p-2">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{contact.name}</h3>
          <p className="text-muted-foreground text-sm mb-3">{contact.handle}</p>
          <a className="text-blue-600 text-sm hover:underline block mb-4" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
        {Array.isArray(contact.socials) && contact.socials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {contact.socials.map((s: any, i: number) => (
              <a 
                key={i} 
                href={s.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-700 transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExpandableCard({ children, type, data }: ExpandableCardProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't make skills expandable as requested
  if (type === 'skills') {
    return <div>{children}</div>;
  }

  const getExpandedContent = () => {
    switch (type) {
      case 'me':
        return <ExpandedMeContent personal={data} />;
      case 'projects':
        return <ExpandedProjectContent project={data} />;
      case 'contact':
        return <ExpandedContactContent contact={data} />;
      default:
        return null;
    }
  };

  const expandedContent = getExpandedContent();

  if (!expandedContent) {
    return <div>{children}</div>;
  }

  return (
    <>
      <motion.div
        onClick={() => setIsExpanded(true)}
        className="cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full max-w-4xl max-h-[80vh] rounded-2xl p-6 relative ${
                theme === 'dark' 
                  ? 'bg-gray-900 border border-gray-600' 
                  : 'bg-white border border-gray-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsExpanded(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X size={20} />
              </button>
              <div className="h-full overflow-y-auto pr-8">
                {expandedContent}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}