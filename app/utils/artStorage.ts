// Shared localStorage helper for Artist Pack mini-apps
// Stores a single JSON object under key `omni_artist_v1` with an array of projects.
// Each project has { id, app, name, createdAt, updatedAt, data }

export type ArtistProject = {
  id: string;
  app: string; // e.g., 'colorpicker', 'contrast', 'sketch', 'gridoverlay', 'value'
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  data: unknown; // app-specific payload
};

const STORAGE_KEY = "omni_artist_v1";

function readRaw(): { projects: ArtistProject[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { projects: [] };
    return JSON.parse(raw) as { projects: ArtistProject[] };
  } catch (e) {
    console.error("artStorage: failed to read storage", e);
    return { projects: [] };
  }
}

function writeRaw(payload: { projects: ArtistProject[] }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("artStorage: failed to write storage", e);
  }
}

function genId(prefix = "p") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function listAllProjects(): ArtistProject[] {
  return readRaw().projects;
}

export function listProjectsForApp(app: string): ArtistProject[] {
  return readRaw().projects.filter((p) => p.app === app);
}

export function getProject(app: string, id: string): ArtistProject | undefined {
  return readRaw().projects.find((p) => p.app === app && p.id === id);
}

export function saveProject(app: string, name: string, data: unknown, id?: string): ArtistProject {
  const now = new Date().toISOString();
  const store = readRaw();
  let project: ArtistProject;
  if (id) {
    const existing = store.projects.find((p) => p.id === id && p.app === app);
    if (existing) {
      existing.name = name;
      existing.data = data;
      existing.updatedAt = now;
      project = existing;
    } else {
      project = { id, app, name, data, createdAt: now, updatedAt: now };
      store.projects.push(project);
    }
  } else {
    project = { id: genId(app), app, name, data, createdAt: now, updatedAt: now };
    store.projects.push(project);
  }
  writeRaw(store);
  return project;
}

export function deleteProject(app: string, id: string): boolean {
  const store = readRaw();
  const before = store.projects.length;
  store.projects = store.projects.filter((p) => !(p.app === app && p.id === id));
  writeRaw(store);
  return store.projects.length < before;
}

export function clearAllArtistStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("artStorage: failed to clear storage", e);
  }
}

export default {
  listAllProjects,
  listProjectsForApp,
  getProject,
  saveProject,
  deleteProject,
  clearAllArtistStorage,
};
