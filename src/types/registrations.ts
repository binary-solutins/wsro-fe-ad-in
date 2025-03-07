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
    payment_status: 'paid' | 'unpaid';
    created_at: string;
    updated_at: string;
    regional_id: number;
    user_name: string;
    competition_name: string;
    regional_name: string | null;
    event_id:any
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
    paymentStatus: 'paid' | 'unpaid';
    competitionName: string;
    createdAt: Date;
    updatedAt: Date;
    event_id: any;
  }