import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const { SUPABASE_URL, SUPABASE_ANON_KEY, PORT = 3001 } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error || !data.user) {
    return res.status(400).json({ error: error?.message });
  }
  res.json({
    user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name },
    token: data.session?.access_token,
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return res.status(400).json({ error: error?.message });
  }
  res.json({
    user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name },
    token: data.session.access_token,
  });
});

app.get('/api/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.json({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
