import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';

dotenv.config();

const { SUPABASE_URL, SUPABASE_ANON_KEY, PORT = 3001, SUPABASE_BUCKET = 'files' } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
// Helmet should be the first middleware to set security headers
app.use(helmet());
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'tmp/' });

app.post('/api/register', async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return res.status(400).json({ error: error?.message });
    }
    res.json({
      user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name },
      token: data.session.access_token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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

app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing token' });
    const token = auth.replace('Bearer ', '');

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!req.file || !req.body.format) {
      return res.status(400).json({ error: 'file and format are required' });
    }

    // Validate that the file path is within the 'tmp/' directory to prevent file inclusion attacks
    const uploadDir = path.resolve('tmp');
    const uploadedFilePath = path.resolve(req.file.path);
    const relative = path.relative(uploadDir, uploadedFilePath);
    if (
      relative.startsWith('..') ||
      path.isAbsolute(relative) ||
      !uploadedFilePath.startsWith(uploadDir + path.sep)
    ) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    const fileBuffer = fs.readFileSync(uploadedFilePath);
    // Sanitize the original file name to prevent path traversal or unsafe characters
    const safeOriginalName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const originalPath = `${userData.user.id}/${Date.now()}_${safeOriginalName}`;
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(originalPath, fileBuffer);
    if (uploadError) return res.status(500).json({ error: uploadError.message });

    const { data: originalUrlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(originalPath);

    const convertedName = path.parse(req.file.originalname).name + '.' + req.body.format;
    const convertedPath = `${userData.user.id}/${Date.now()}_${convertedName}`;
    const { error: convError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(convertedPath, fileBuffer);
    if (convError) return res.status(500).json({ error: convError.message });

    const { data: convertedUrlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(convertedPath);

    await supabase.from('conversions').insert({
      user_id: userData.user.id,
      source_url: originalUrlData.publicUrl,
      converted_url: convertedUrlData.publicUrl,
      target_format: req.body.format,
    });

    fs.unlinkSync(req.file.path);

    res.json({
      original: originalUrlData.publicUrl,
      converted: convertedUrlData.publicUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
