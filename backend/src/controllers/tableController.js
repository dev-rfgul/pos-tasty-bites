import Table from '../models/Table.js';

export async function listTables(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const tables = await Table.find({ tenant: tenantId });
    res.json(tables);
  } catch (err) { next(err); }
}

export async function createTable(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { name } = req.body;
    const table = await Table.create({ tenant: tenantId, name });
    res.status(201).json(table);
  } catch (err) { next(err); }
}

export async function updateTable(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const table = await Table.findOneAndUpdate({ _id: id, tenant: tenantId }, req.body, { new: true });
    if (!table) return res.status(404).json({ error: 'Not found' });
    res.json(table);
  } catch (err) { next(err); }
}

export default { listTables, createTable, updateTable };
