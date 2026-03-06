export const fetchCompetitions = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/competitions`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch competitions");
  const data = await response.json();
  return data;
};

export const fetchRegistrations = async (competitionId?: number) => {
  const url = competitionId
    ? `${import.meta.env.VITE_API_URL}/admin/registrations?competition_id=${competitionId}`
    : `${import.meta.env.VITE_API_URL}/admin/registrations`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
  );
  const data = await response.json();
  return data;
};

export const fetchEventsByLevel = async (level: string) => {
  const response = await fetch(`https://wsroapi.softarotechnolabs.com/api/events/level/${level.toLowerCase()}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
};

export const fetchCompetitionsByEvent = async (eventId: number) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/competitions/all?event_id=${eventId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch competitions");
  return response.json();
};

export const fetchEvents = async () => {
  const response = await fetch("https://wsroapi.softarotechnolabs.com/api/events", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  return data;
};

export const fetchInquiries = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/inquiries`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  return data;
};
