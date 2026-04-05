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

  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const perspectiveId = file.replace(/\.md$/, '');
      return getPerspectiveData(eventId, perspectiveId);
    });
}

export interface NoteSource {
  title: string;
  url: string;
  publisher: string;
  type: 'government' | 'academic' | 'media' | 'ngo' | 'international' | 'archive';
}

export interface EventNote {
  id: string;
  claim: string;
  context: string;
  verdict: string;
  sources: NoteSource[];
}

export interface EventNotes {
  eventId: string;
  notes: EventNote[];
}

export function getEventNotes(eventId: string): EventNotes | null {
  const notesPath = path.join(contentDirectory, eventId, 'notes.json');
  if (!fs.existsSync(notesPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(notesPath, 'utf8');
  return JSON.parse(fileContents) as EventNotes;
}
