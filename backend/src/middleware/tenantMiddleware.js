// Simple tenant middleware placeholder.
// For MVP we'll accept tenant id in header `x-tenant-id` or set from authenticated user later.

export function requireTenant(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || null;
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing x-tenant-id header' });
  }
  req.tenantId = tenantId;
  next();
}

export default { requireTenant };
