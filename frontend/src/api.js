import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function editFile(fileId, instruction) {
  const fd = new FormData();
  fd.append("file_id", fileId);
  fd.append("instruction", instruction);
  const res = await api.post("/edit", fd);
  return res.data;
}

export function getDownloadLink(path) {
  // If path is already absolute or relative to root, handle accordingly
  // The backend returns /download?file_id=... which is relative to API root usually
  // But here we want to construct the full URL
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}
