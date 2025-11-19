import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await axios.post(`${BASE}/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function editFile(fileId, instruction) {
  const fd = new FormData();
  fd.append("file_id", fileId);
  fd.append("instruction", instruction);

  const res = await axios.post(`${BASE}/edit`, fd);
  return res.data;
}

export function getDownloadLink(path) {
  return `${BASE}${path}`;
}
