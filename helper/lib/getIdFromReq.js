export function getIdFromReq(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const parts = pathname.split("/");
  return parts[parts.length - 1];
}