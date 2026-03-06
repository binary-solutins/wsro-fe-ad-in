export interface ApiRegistration {
  id: number;
  user_id?: number;
  competition_id?: number;
  event_id?: number;
  region_id?: number;
  team_code: string;
  team_name: string;
  leader_name?: string;
  leader_email?: string;
  member_names: string; // JSON string
  participant_id: string; // JSON string
  status: 'pending' | 'approved' | 'rejected' | 'confirmed';
  payment_status: 'unpaid' | 'paid';
  created_at: string;
  updated_at: string;
  coach_mentor_name?: string;
  coach_mentor_organization?: string;
  coach_mentor_phone?: string;
  coach_mentor_email?: string;
  member_ages?: string;
  member_emails?: string;
  member_phones?: string;
  member_states?: string;
  member_cities?: string;
  member_zipcodes?: string;
  member_institutions?: string;
  member_tshirt_sizes?: string | null;
  no_of_students?: number;
  payment_id?: string;
  competition_name?: string;
  region_name?: string | null;
}

export interface Registration {
  id: number;
  teamCode: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  memberNames: string[];
  participantIds: string[];
  status: 'pending' | 'approved' | 'rejected' | 'confirmed';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: Date;
  updatedAt: Date;
  competitionId?: number;
  eventId?: number;
  regionId?: number;
  coachMentorName?: string;
  coachMentorOrganization?: string;
  coachMentorPhone?: string;
  coachMentorEmail?: string;
  memberAges?: number[];
  memberEmails?: string[];
  memberPhones?: string[];
  memberStates?: string[];
  memberCities?: string[];
  memberZipcodes?: string[];
  memberInstitutions?: string[];
  memberTshirtSizes?: string[];
  noOfStudents?: number;
  paymentId?: string;
  competitionName?: string;
  regionName?: string;
}

export interface Competition {
  id: number;
  name: string;
  level: 'regional' | 'National' | 'International';
  date: string;
  venue: string;
  registration_deadline: string;
  maximum_teams: number;
  fees: string;
  rules: string;
  pdf: string;
  zip: string;
  event_id?: number;
}

export interface Event {
  id: number;
  title: string;
  level: 'regional' | 'national' | 'international' | 'startup';
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  is_resolved: number;
  created_at: string;
}