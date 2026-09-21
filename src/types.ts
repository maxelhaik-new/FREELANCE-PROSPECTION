export type ProspectStatus = 'searched' | 'to_contact' | 'contacted' | 'interested' | 'declined';

export interface Prospect {
  id: string;
  name: string;
  activity: string;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  notes?: string;
  identified: boolean; // Marqué comme retenu / shortlisté par le freelance
  status: ProspectStatus;
  relevanceScore?: number; // Note de 1 à 10
  keyAngle?: string;
  lat?: number;
  lng?: number;
  generatedEmail?: {
    subject: string;
    body: string;
    generatedAt: string;
  };
  emailSentAt?: string;
}

export interface FreelanceProfile {
  title: string;
  services: string;
  targetSector: string;
  targetCity: string;
  portfolioUrl?: string;
  valueProposition: string;
  signature?: string;
}

export interface SearchQuery {
  sector: string;
  city: string;
  specialty?: string;
}
