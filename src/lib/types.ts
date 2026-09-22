// TypeScript interfaces for StyleFinder Quiz

export interface Section1Response {
  groupA: boolean[];
  groupB: boolean[];
  groupC: boolean[];
  groupD: boolean[];
  groupE: boolean[];
  groupF: boolean[];
  groupG: boolean[];
  groupH: boolean[];
}

export interface Section2Response {
  answers: string[]; // Array of 17 'a'-'h' values
}

export interface QuizSubmission {
  userName: string;
  userEmail: string;
  section1: Section1Response;
  section2: Section2Response;
  timestamp: Date;
  /**
   * Consent to share this SFID with boutiques she shops with. Undefined means
   * "never asked" — treat as NOT consented; never coerce it to true.
   */
  shareWithRetailers?: boolean;
  /** Identifier of the consent copy shown at capture. */
  consentVersion?: string;
  /** BHOS shops.id of the boutique that drove this take (?store=). Attribution only. */
  referralStoreId?: string;
  /** Campaign/source tag (?src=). */
  referralSource?: string;
}

export interface StyleScore {
  id: string;
  name: string;
  score: number;
}

export interface StyleResult {
  primary: StyleScore;
  secondary: StyleScore;
  supporting: StyleScore;
  allScores: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  text: string;
  group?: string; // For Section 1 questions
}

export interface MultipleChoiceQuestion {
  id: string;
  text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
    g: string;
    h: string;
  };
}

export interface StyleDescription {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  colors: string[];
  keywords: string[];
}

export type StyleID = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export type StyleCategory = 'yang' | 'yin';

export interface EmailTemplate {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text: string;
}