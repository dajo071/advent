export interface Stage {
  id: number;
  name: string;
  theme: string;
  description: string;
}

export interface DayMeta {
  day: number;
  date: string; // RRRR-MM-DD
  liturgicalDay: string;
  stage: number;
  title: string;
  sentence: string;
  minutes: number;
  ref: string;
}

export interface YearIndex {
  year: number;
  title: string;
  motto: string;
  translation: string;
  scriptureSource: string;
  stages: Stage[];
  days: DayMeta[];
}

export interface DayContent {
  day: number;
  date: string;
  liturgicalDay: string;
  stage: number;
  title: string;
  idea: string;
  sentence: string;
  minutes: number;
  scripture: { ref: string; bookName: string; context: string; url: string; verses: { n: number; text: string }[] };
  reflection: string;
  short: string;
  questions: string[];
  prayer: string;
  antiphon: { name: string; text: string } | null;
  intention: string;
  act: string;
  closing: string;
  sources: { kkc: number[]; authors: string[] };
}
