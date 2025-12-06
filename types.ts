
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
}

export interface LawEnforcementSummary {
  formatted_report_text: string;
}

export interface WebSource {
  title: string;
  uri: string;
}

export interface VerificationSource {
  name: string;
  status: 'VERIFIED' | 'FAILED' | 'UNKNOWN' | 'WARNING';
  details: string;
  icon?: string; 
}

export interface ProtocolComparison {
  official_practice: string;
  scam_tactic: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AnalysisResult {
  scam_score: number;
  scam_type: string;
  red_flags: string[];
  explanation: string;
  safe_actions: string[];
  one_tap_safe_reply: string;
  boundingBoxes?: BoundingBox[];
  highlight_snippets?: string[];
  law_enforcement_summary?: LawEnforcementSummary;
  web_sources?: WebSource[]; 
  confidence_score?: number;
  learning_metric?: string;
  detected_language?: string;
  target_region?: string;
  feedback_trigger?: boolean;
  verification_sources?: VerificationSource[];
  protocol_comparison?: ProtocolComparison;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export enum InputMode {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  LIVE_CALL = 'LIVE_CALL'
}

export interface DemoScenario {
  id: string;
  title: string;
  type: InputMode;
  content: string; 
  description: string;
}

export type LanguageOption = {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
  flag: string;
};

export interface ThreatEvent {
  id: string;
  type: string;
  country: string;
  timestamp: string;
  x?: number;
  y?: number;
}
