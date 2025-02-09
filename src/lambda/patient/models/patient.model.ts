export interface PatientData {
  id: string;
  name: string;
  address: string;
  conditions: string[];
  allergies: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
