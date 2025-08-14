import {University} from "@/dto/university.ts";

export interface Program {
  id?: string;
  title: string;
  category: string;
  duration: number;
  fees: number;
  description?: string;
  eligibility?: string[];
  curriculum?: string[];
  accreditation: string[];
  featured?: boolean;
  mode?: string;
  created_by?: string;
  university_id?: string;
  university_details?: University;
}

export interface ProgramFormData {
  title: string;
  category: string;
  duration: number;
  fees: number;
  description: string;
  eligibility: string[];
  curriculum: string[];
  accreditation: string[];
  featured: boolean;
  mode: string;
  university_id?: string;
  university_details?: University;
}
