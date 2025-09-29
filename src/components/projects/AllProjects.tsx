"use client";
import { Card, Carousel } from "@/components/projects/apple-cards-carousel";
import { ProjectContent, type ProjectProps } from "@/components/projects/ProjectContent";
import { useEffect, useState } from "react";

export default function AllProjects() {
  const [projects, setProjects] = useState<ProjectProps[]>([]);

  useEffect(() => {
    fetch('/db.json')
      .then((res) => res.json())
      .then((db) => {
        const list: ProjectProps[] = db.projects || [];
        setProjects(list);
      })
      .catch(() => setProjects([]));
  }, []);

  const cards = projects.map((p, index) => (
    <Card
      key={(p.thumbnail || p.title) + index}
      card={{
        src: p.thumbnail || (p.images && p.images[0]?.src) || '',
        title: p.title,
        category: p.category || '',
        content: <ProjectContent project={p} />,
      }}
      index={index}
      layout={true}
    />
  ));

  return (
    <div className="w-full h-full pt-8">
      <h2 className="max-w-7xl mx-auto text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        My Projects
      </h2>
      <Carousel items={cards} />
    </div>
  );
}
