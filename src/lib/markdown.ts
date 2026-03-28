import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content/events');

export interface EventPerspective {
  id: string;
  title: string;
  category: string;
  year: string;
  location: string;
  country: string;
  language: string;
  source: string;
  content: string;
}

export function getAllEvents() {
  const eventFolders = fs.readdirSync(contentDirectory);
  return eventFolders.map((folder) => {
    const filePath = path.join(contentDirectory, folder);
    const files = fs.readdirSync(filePath);
    return {
      id: folder,
      perspectives: files.map((file) => file.replace(/\.md$/, '')),
    };
  });
}

export function getPerspectiveData(eventId: string, perspectiveId: string): EventPerspective {
  const fullPath = path.join(contentDirectory, eventId, `${perspectiveId}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const { data, content } = matter(fileContents);

  return {
    id: eventId,
    content,
    ...(data as Omit<EventPerspective, 'id' | 'content'>),
  };
}

export function getEventPerspectives(eventId: string): EventPerspective[] {
  const folderPath = path.join(contentDirectory, eventId);
  const files = fs.readdirSync(folderPath);

  return files.map((file) => {
    const perspectiveId = file.replace(/\.md$/, '');
    return getPerspectiveData(eventId, perspectiveId);
  });
}
