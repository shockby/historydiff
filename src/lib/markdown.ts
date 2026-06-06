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

export function getEventPerspectives(eventId: string, lang = 'en'): EventPerspective[] {
  const folderPath = path.join(contentDirectory, eventId);
  if (!fs.existsSync(folderPath)) return [];
  const files = fs.readdirSync(folderPath);

  // We look for files ending with -en.md, -ja.md, -zh.md, or -ko.md
  // Supporting fallback to -ja.md if the requested language file is missing
  let filteredFiles = files.filter((file) => file.endsWith(`-${lang}.md`));
  
  if (filteredFiles.length === 0) {
    filteredFiles = files.filter((file) => file.endsWith('-ja.md'));
  }

  return filteredFiles.map((file) => {
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

export function getEventNotes(eventId: string, lang = 'en'): EventNotes | null {
  const fileName = lang === 'ja' ? 'notes.json' : `notes-${lang}.json`;
  let notesPath = path.join(contentDirectory, eventId, fileName);
  
  if (!fs.existsSync(notesPath)) {
    notesPath = path.join(contentDirectory, eventId, 'notes.json');
    if (!fs.existsSync(notesPath)) {
      return null;
    }
  }
  
  const fileContents = fs.readFileSync(notesPath, 'utf8');
  return JSON.parse(fileContents) as EventNotes;
}

export interface PhotoSource {
  title: string;
  url: string;
  license: string;
  author: string;
}

export interface EventPhoto {
  id: string;
  url: string;
  caption: {
    ja?: string;
    en?: string;
    zh?: string;
    ko?: string;
  };
  source: PhotoSource;
}

export interface EventPhotos {
  eventId: string;
  photos: EventPhoto[];
}

export function getEventPhotos(eventId: string): EventPhotos | null {
  const photosPath = path.join(contentDirectory, eventId, 'photos.json');
  if (!fs.existsSync(photosPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(photosPath, 'utf8');
  return JSON.parse(fileContents) as EventPhotos;
}

