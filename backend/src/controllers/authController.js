import bcrypt from 'bcryptjs';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';

// Signup: create tenant + owner user
export async function signup(req, res, next) {
  try {
    const { shopName, email, password, name } = req.body;
    if (!shopName || !email || !password) {
      return res.status(400).json({ error: 'shopName, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already used' });

    const tenant = await Tenant.create({ name: shopName });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ tenant: tenant._id, email, passwordHash, role: 'owner', name });

    // For MVP we return tenant id and user id. Replace with JWT later.
    return res.status(201).json({ tenantId: tenant._id, userId: user._id });
  } catch (err) {
    next(err);
  }
}

// Login: simple password check (placeholder for JWT)
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email }).populate('tenant');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // TODO: return JWT. For now return tenantId and user info
    return res.json({ userId: user._id, tenantId: user.tenant._id, role: user.role, email: user.email });
  } catch (err) {
    next(err);
  }
}

export default { signup, login };
