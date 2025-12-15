export interface BasicDetails {
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  aadhaarNumber?: string;
}

export interface ExamDetails {
  examName: string;
  examType: string;
  agencyName: string;
  examYear: string;
  postServiceName?: string;
  percentage?: string;
  performanceRank?: string;
  previousSelections?: string;
}

export interface Documents {
  passport_photo?: string;
  marksheet_10th?: string;
  marksheet_12th?: string;
  marksheet_graduation?: string;
  aadhaar_card?: string;
}

export interface OfficeDetails {
  registrationNo?: string;
  studentId?: string;
  batchTime?: string;
  batchNumber?: string;
}

export interface AdmissionForm {
  _id: string;
  basicDetails: BasicDetails;
  examDetails: ExamDetails;
  documents: Documents;
  office?: OfficeDetails;
  status: 'Pending' | 'Approved' | 'Rejected';
  submissionDate: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}