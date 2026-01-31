
export interface NameAnalysis {
  unifiedTitle: string; 
  combinedInterpretation: string; 
  firstNameMeaning: string;
  lastNameMeaning: string;
  poeticVerse: string;
  firstNameArabic: string; 
  lastNameArabic: string;
  firstNameOrigin: string; // Geographical/Cultural origin
  lastNameOrigin: string;  // Geographical/Cultural origin
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
