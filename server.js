const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is missing or too short');
}
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) console.warn('DATABASE_URL is not set');
if (JWT_SECRET === 'CHANGE_ME_IN_RAILWAY') console.warn('JWT_SECRET should be set in Railway Variables');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL && !/localhost|127\.0\.0\.1/.test(DATABASE_URL) ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// CORS не требуется: frontend и API работают на одном origin.
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.use(cors({
  origin: 'https://bczmdhv47k-pixel.github.io',
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'too_many_login_attempts' }
});

const DEFAULT_PAYLOAD = {
  schemaVersion: 11,
  account: {}, objects: [], materials: [], calculations: [], prices: [], suppliers: [],
  knowledge: [], estimates: [], documents: [], profile: {}, accessKeys: [], sharedObjects: [],
  financeCards: [], financeEntries: [], financePayments: [], commercialClients: [],
  commercialProposals: [], billingPlan: 'free', currentObjectId: null
};

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS organization_members (
      organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'owner',
      PRIMARY KEY (organization_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS data_snapshots (
      organization_id BIGINT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
      version BIGINT NOT NULL DEFAULT 1,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_members_user ON organization_members(user_id);
  `);
}

function normalizeEmail(v) { return String(v || '').trim().toLowerCase(); }
function safeName(v) { return String(v || '').trim().slice(0, 160); }
function signUser(user, organization) {
  return jwt.sign({ userId: String(user.id), organizationId: String(organization.id) }, JWT_SECRET, { expiresIn: '30d' });
}
function setAuthCookie(res, token) {
  res.cookie('pgsstroy_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}
async function auth(req, res, next) {
  const h = req.headers.authorization || '';
const bearerToken = h.startsWith('Bearer ') ? h.slice(7) : '';
const token = req.cookies.pgsstroy_token || bearerToken;

if (!token) {
  return res.status(401).json({ error: 'auth_required' });
}
  try {
    const claims = jwt.verify(token, JWT_SECRET);

    const q = await pool.query(
      `SELECT u.id, u.name, u.email, m.organization_id, m.role
       FROM users u
       JOIN organization_members m ON m.user_id = u.id
       WHERE u.id = $1 AND m.organization_id = $2
       LIMIT 1`,
      [claims.userId, claims.organizationId]
    );

    if (!q.rowCount) {
      return res.status(403).json({ error: 'membership_required' });
    }

    req.auth = {
      ...claims,
      role: q.rows[0].role
    };

    next();
  } catch (e) {
    if (
      e.name === 'JsonWebTokenError' ||
      e.name === 'TokenExpiredError' ||
      e.name === 'NotBeforeError'
    ) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    console.error('Auth error', e);
    return res.status(500).json({ error: 'auth_failed' });
  }
}
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const q = await pool.query(
      `SELECT u.id, u.name, u.email, m.organization_id, m.role, o.name AS organization
       FROM users u
       JOIN organization_members m ON m.user_id = u.id
       JOIN organizations o ON o.id = m.organization_id
       WHERE u.id = $1 AND m.organization_id = $2
       LIMIT 1`,
      [req.auth.userId, req.auth.organizationId]
    );

    if (!q.rowCount) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    const r = q.rows[0];

    res.json({
      authenticated: true,
      user: {
        id: String(r.id),
        name: r.name,
        email: r.email,
        organizationId: String(r.organization_id),
        organization: r.organization,
        role: r.role
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'auth_check_failed' });
  }
});
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'pgsstroy-pro', database: true });
  } catch (e) {
    res.status(503).json({ ok: false, service: 'pgsstroy-pro', database: false, error: 'database_unavailable' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const name = safeName(req.body?.name);
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  const organizationName = safeName(req.body?.organization) || 'PGSSTROY';
  if (!name || !email || password.length < 6) return res.status(400).json({ error: 'invalid_registration' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const exists = await client.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rowCount) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'email_exists' }); }
    const hash = await bcrypt.hash(password, 12);
    const u = await client.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email', [name,email,hash]);
    const o = await client.query('INSERT INTO organizations(name) VALUES($1) RETURNING id,name', [organizationName]);
    await client.query('INSERT INTO organization_members(organization_id,user_id,role) VALUES($1,$2,$3)', [o.rows[0].id,u.rows[0].id,'owner']);
    await client.query('INSERT INTO data_snapshots(organization_id,version,payload) VALUES($1,1,$2)', [o.rows[0].id, JSON.stringify(DEFAULT_PAYLOAD)]);
    await client.query('COMMIT');
    const user = u.rows[0], organization = o.rows[0];
    const token = signUser(user, organization);
setAuthCookie(res, token);
    res.status(201).json({ token: signUser(user, organization), user: { id: String(user.id), name: user.name, email: user.email, organizationId: String(organization.id), organization: organization.name }, version: 1 });
  } catch (e) { await client.query('ROLLBACK'); console.error(e); res.status(500).json({ error: 'register_failed' }); }
  finally { client.release(); }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  try {
    const q = await pool.query(`SELECT u.id,u.name,u.email,u.password_hash,o.id organization_id,o.name organization
      FROM users u JOIN organization_members m ON m.user_id=u.id JOIN organizations o ON o.id=m.organization_id
      WHERE u.email=$1 ORDER BY m.role='owner' DESC LIMIT 1`, [email]);
    if (!q.rowCount || !(await bcrypt.compare(password, q.rows[0].password_hash))) return res.status(401).json({ error: 'invalid_credentials' });
    const r = q.rows[0];
const token = signUser(r, { id: r.organization_id });
setAuthCookie(res, token);
res.json({ token, user:{id:String(r.id),name:r.name,email:r.email,organizationId:String(r.organization_id),organization:r.organization} });
  } catch (e) { console.error(e); res.status(500).json({ error: 'login_failed' }); }
});

app.get('/api/data', auth, async (req,res) => {
  try {
    const q=await pool.query('SELECT version,payload,updated_at FROM data_snapshots WHERE organization_id=$1',[req.auth.organizationId]);
    if(!q.rowCount) return res.status(404).json({error:'snapshot_not_found'});
    res.json({version:Number(q.rows[0].version),payload:q.rows[0].payload,updatedAt:q.rows[0].updated_at});
  } catch(e){console.error(e);res.status(500).json({error:'data_read_failed'});}
});

app.put('/api/data', auth, async (req,res) => {
  const payload=req.body?.payload;
  const expected=Number(req.body?.version || 0);
  if(!payload || typeof payload!=='object') return res.status(400).json({error:'payload_required'});
  try {
    const q=await pool.query(`UPDATE data_snapshots SET payload=$1,version=version+1,updated_at=now()
      WHERE organization_id=$2 AND version=$3 RETURNING version,updated_at`,[JSON.stringify(payload),req.auth.organizationId,expected]);
    if(!q.rowCount){
      const latest=await pool.query('SELECT version FROM data_snapshots WHERE organization_id=$1',[req.auth.organizationId]);
      return res.status(409).json({error:'version_conflict',version:latest.rows[0]?Number(latest.rows[0].version):null});
    }
    res.json({ok:true,version:Number(q.rows[0].version),updatedAt:q.rows[0].updated_at});
  } catch(e){console.error(e);res.status(500).json({error:'data_write_failed'});}
});

app.get('/api/objects', auth, async (_req,res) => {
  try {
    const q=await pool.query('SELECT version,payload FROM data_snapshots WHERE organization_id=$1',[_req.auth.organizationId]);
    const objects=q.rowCount && Array.isArray(q.rows[0].payload?.objects) ? q.rows[0].payload.objects : [];
    res.json({objects,version:q.rowCount?Number(q.rows[0].version):0});
  } catch(e){res.status(500).json({error:'objects_read_failed'});}
});

app.post('/api/ai', auth, async (req, res) => {
  const message = String(req.body?.message || '').trim();

  if (!message) {
    return res.status(400).json({ error: 'message_required' });
  }

  if (!openai) {
    return res.status(503).json({ error: 'openai_not_configured' });
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-6-luna',
      instructions: `
Ты — AI-помощник PGSSTROY.PRO для управления строительными проектами.

Отвечай на русском языке.
Отвечай кратко, конкретно и по делу.
Учитывай строительную специфику: объекты, сметы, материалы,
объёмы работ, цены, поставщиков, сроки, финансы и организацию работ.

На данном этапе у тебя НЕТ инструментов изменения данных.
Не утверждай, что ты создал, изменил, удалил или сохранил что-либо
в системе.

Если для ответа не хватает данных — прямо скажи, какие данные нужны.
`,
      input: message
    });

    res.json({
      ok: true,
      answer: response.output_text || ''
    });
  } catch (e) {
    console.error('OpenAI error', e);
    res.status(502).json({ error: 'openai_request_failed' });
  }
});

app.get('/api', (_req,res)=>res.json({service:'PGSSTROY.PRO API',version:'1.2.0',health:'/health'}));

const publicDir = __dirname;
app.use(express.static(publicDir, { index: 'index.html' }));
app.get('*', (req,res,next)=>{
  if(req.path.startsWith('/api/') || req.path==='/health') return next();
  res.sendFile(path.join(publicDir,'index.html'));
});

initDb().then(()=>app.listen(PORT,'0.0.0.0',()=>console.log(`PGSSTROY.PRO listening on ${PORT}`)))
  .catch(err=>{console.error('Database initialization failed',err);process.exit(1);});
