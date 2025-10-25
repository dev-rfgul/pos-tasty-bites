import MenuItem from '../models/MenuItem.js';

export async function listMenu(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const items = await MenuItem.find({ tenant: tenantId });
    res.json(items);
  } catch (err) { next(err); }
}

export async function createMenuItem(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { name, price, cost, sku, active } = req.body;
    const item = await MenuItem.create({ tenant: tenantId, name, price, cost, sku, active });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

export async function updateMenuItem(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const item = await MenuItem.findOneAndUpdate({ _id: id, tenant: tenantId }, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
}

export async function deleteMenuItem(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    await MenuItem.findOneAndDelete({ _id: id, tenant: tenantId });
    res.status(204).end();
  } catch (err) { next(err); }
}

export default { listMenu, createMenuItem, updateMenuItem, deleteMenuItem };
