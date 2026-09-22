import { useState, useEffect, useCallback } from 'react';
import type { ResumeStructuredContent, ResumeAnalysisData } from './resumeData';
import { parseResumeRawText, extractTextFromFile } from './resumeParser';
import { reScoreResume } from './resumeScoringEngine';

export interface ResumeHistoryEntry {
  timestamp: string;
  description: string;
  content: ResumeStructuredContent;
}

export interface StoredResume {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  rawText: string;
  content: ResumeStructuredContent;
  analysis: ResumeAnalysisData;
  lastModifiedAt: string;
  history?: ResumeHistoryEntry[];
}

const STORAGE_RESUMES_KEY = 'skillproof_stored_resumes_v2';
const STORAGE_SELECTED_ID_KEY = 'skillproof_selected_resume_id_v2';

// In-memory cache & pub-sub listeners
let memoryResumes: StoredResume[] = [];
let memorySelectedId: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function loadInitialFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const rawList = localStorage.getItem(STORAGE_RESUMES_KEY);
    if (rawList) {
      memoryResumes = JSON.parse(rawList);
    } else {
      memoryResumes = [];
    }

    const savedSelected = localStorage.getItem(STORAGE_SELECTED_ID_KEY);
    if (savedSelected && memoryResumes.some((r) => r.id === savedSelected)) {
      memorySelectedId = savedSelected;
    } else if (memoryResumes.length > 0) {
      memorySelectedId = memoryResumes[0].id;
    } else {
      memorySelectedId = null;
    }
  } catch (e) {
    console.warn('Failed to read resumes from storage:', e);
    memoryResumes = [];
    memorySelectedId = null;
  }
}

// Initialize on module load
loadInitialFromStorage();

function persistToStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_RESUMES_KEY, JSON.stringify(memoryResumes));
    if (memorySelectedId) {
      localStorage.setItem(STORAGE_SELECTED_ID_KEY, memorySelectedId);
    } else {
      localStorage.removeItem(STORAGE_SELECTED_ID_KEY);
    }
  } catch (e) {
    console.warn('Failed to save resumes to storage:', e);
  }
}

/**
 * Global API for resume store
 */
export const resumeStore = {
  getResumes(): StoredResume[] {
    return memoryResumes;
  },

  getSelectedId(): string | null {
    return memorySelectedId;
  },

  getActiveResume(): StoredResume | null {
    if (!memorySelectedId) return null;
    return memoryResumes.find((r) => r.id === memorySelectedId) ?? null;
  },

  selectResume(id: string) {
    if (memoryResumes.some((r) => r.id === id)) {
      memorySelectedId = id;
      persistToStorage();
      notify();
    }
  },

  saveResume(resume: StoredResume) {
    const idx = memoryResumes.findIndex((r) => r.id === resume.id);
    if (idx >= 0) {
      memoryResumes[idx] = resume;
    } else {
      memoryResumes.push(resume);
    }
    memorySelectedId = resume.id;
    persistToStorage();
    notify();
  },

  deleteResume(id: string) {
    memoryResumes = memoryResumes.filter((r) => r.id !== id);
    if (memorySelectedId === id) {
      memorySelectedId = memoryResumes.length > 0 ? memoryResumes[0].id : null;
    }
    persistToStorage();
    notify();
  },

  updateActiveResumeContent(
    newContent: ResumeStructuredContent,
    description = 'Updated resume content',
  ): StoredResume | null {
    const active = this.getActiveResume();
    if (!active) return null;

    // Validate that the name is preserved to guarantee candidate identity
    if (active.content.name && !newContent.name) {
      newContent.name = active.content.name;
    }

    // Re-score the resume with the updated content
    const updatedAnalysis = reScoreResume(
      active.fileName,
      active.fileSize,
      active.analysis.overallScore,
      active.analysis.rubricSections,
      newContent,
      active.rawText,
    );

    const historyEntry: ResumeHistoryEntry = {
      timestamp: new Date().toISOString(),
      description,
      content: { ...active.content },
    };

    const updatedResume: StoredResume = {
      ...active,
      content: newContent,
      analysis: updatedAnalysis,
      lastModifiedAt: new Date().toISOString(),
      history: [...(active.history || []), historyEntry],
    };

    this.saveResume(updatedResume);
    return updatedResume;
  },

  async uploadAndParseResume(file: File, manualText?: string): Promise<StoredResume> {
    const rawText = manualText || (await extractTextFromFile(file));
    const { structuredContent } = parseResumeRawText(rawText, file.name);

    // Initial scoring against the 100-point rubric
    const analysis = reScoreResume(
      file.name,
      file.size,
      null,
      undefined,
      structuredContent,
      rawText,
    );

    const newResume: StoredResume = {
      id: `resume-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rawText,
      content: structuredContent,
      analysis,
      lastModifiedAt: new Date().toISOString(),
      history: [],
    };

    this.saveResume(newResume);
    return newResume;
  },

  pasteAndParseResume(rawText: string, title = 'Pasted Resume'): StoredResume {
    const { structuredContent } = parseResumeRawText(rawText, `${title}.txt`);
    const virtualSize = new Blob([rawText]).size;

    const analysis = reScoreResume(
      `${title}.txt`,
      virtualSize,
      null,
      undefined,
      structuredContent,
      rawText,
    );

    const newResume: StoredResume = {
      id: `resume-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fileName: `${title}.txt`,
      fileSize: virtualSize,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rawText,
      content: structuredContent,
      analysis,
      lastModifiedAt: new Date().toISOString(),
      history: [],
    };

    this.saveResume(newResume);
    return newResume;
  },

  async uploadAndParse(file: File, manualText?: string): Promise<StoredResume> {
    return this.uploadAndParseResume(file, manualText);
  },

  pasteAndParse(rawText: string, title = 'Pasted Resume'): StoredResume {
    return this.pasteAndParseResume(rawText, title);
  },
};

/**
 * React Hook for consuming the active resume and store actions
 */
export function useResumeStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const resumes = resumeStore.getResumes();
  const selectedResumeId = resumeStore.getSelectedId();
  const activeResume = resumeStore.getActiveResume();

  const selectResume = useCallback((id: string) => {
    resumeStore.selectResume(id);
  }, []);

  const updateActiveContent = useCallback(
    (newContent: ResumeStructuredContent, description?: string) => {
      return resumeStore.updateActiveResumeContent(newContent, description);
    },
    [],
  );

  const deleteResume = useCallback((id: string) => {
    resumeStore.deleteResume(id);
  }, []);

  const uploadAndParse = useCallback(async (file: File, manualText?: string) => {
    return await resumeStore.uploadAndParseResume(file, manualText);
  }, []);

  const pasteAndParse = useCallback((text: string, title?: string) => {
    return resumeStore.pasteAndParseResume(text, title);
  }, []);

  return {
    resumes,
    selectedResumeId,
    activeResume,
    selectResume,
    updateActiveContent,
    deleteResume,
    uploadAndParse,
    pasteAndParse,
  };
}
