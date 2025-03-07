export interface ApiRegistration {
  id: number;
  user_id: number;
  competition_id: number;
  team_code: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  member_names: string; // JSON string
  participant_id: string; // JSON string
  status: 'pending' | 'approved' | 'rejected';
  payment_status: 'unpaid' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  teamCode: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  memberNames: string[];
  participantIds: string[];
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  is_resolved: number;
  created_at: string;
}