import { ApiRegistration, Registration } from "../types/registrations";


export const transformApiData = (data: ApiRegistration): Registration => ({
  id: data.id,
  teamCode: data.team_code,
  teamName: data.team_name,
  leaderName: data.leader_name,
  leaderEmail: data.leader_email,
  memberNames: JSON.parse(data.member_names),
  participantIds: JSON.parse(data.participant_id),
  status: data.status,
  paymentStatus: data.payment_status,
  competitionName: data.competition_name,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  event_id: data.event_id
});