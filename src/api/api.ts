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

export const fetchRegistrations = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/admin/registrations`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  const data = await response.json();
  return data;
};

export const fetchEvents = async () => {
  const response = await fetch("https://wsro-backend.onrender.com/api/events", {
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
