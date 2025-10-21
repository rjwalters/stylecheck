import { Router, Request, Response } from 'express';
import db from '../db/database.js';

const router = Router();

interface Profile {
  id?: number;
  name: string;
  description?: string;
  author?: string;
  languages?: string[];
  preferences: Record<string, unknown>;
  custom_rules?: string[];
  reference_guide_path?: string;
  is_builtin?: boolean;
  created_at?: string;
  updated_at?: string;
}

// GET /api/profiles - List all profiles
router.get('/profiles', (req: Request, res: Response) => {
  try {
    const profiles = db
      .prepare('SELECT * FROM profiles ORDER BY is_builtin DESC, name ASC')
      .all();
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// GET /api/profiles/:id - Get single profile
router.get('/profiles/:id', (req: Request, res: Response) => {
  try {
    const profile = db
      .prepare('SELECT * FROM profiles WHERE id = ?')
      .get(req.params.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/profiles - Create new profile
router.post('/profiles', (req: Request, res: Response) => {
  const {
    name,
    description,
    author,
    languages,
    preferences,
    custom_rules,
    reference_guide_path,
  } = req.body as Profile;

  // Validation
  if (!name || !preferences) {
    return res.status(400).json({
      error: 'Name and preferences are required',
    });
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO profiles (
          name, description, author, languages, preferences,
          custom_rules, reference_guide_path, is_builtin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, false)`
      )
      .run(
        name,
        description || null,
        author || null,
        JSON.stringify(languages || []),
        JSON.stringify(preferences),
        JSON.stringify(custom_rules || []),
        reference_guide_path || null
      );

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Profile created successfully',
    });
  } catch (error: unknown) {
    console.error('Error creating profile:', error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return res.status(400).json({
        error: 'Profile name already exists',
      });
    }

    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// PUT /api/profiles/:id - Update profile
router.put('/profiles/:id', (req: Request, res: Response) => {
  const profileId = req.params.id;

  try {
    // Check if profile exists and if it's built-in
    const existingProfile = db
      .prepare('SELECT is_builtin FROM profiles WHERE id = ?')
      .get(profileId) as { is_builtin: number } | undefined;

    if (!existingProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (existingProfile.is_builtin) {
      return res.status(403).json({
        error: 'Cannot modify built-in profiles',
      });
    }

    const {
      name,
      description,
      author,
      languages,
      preferences,
      custom_rules,
      reference_guide_path,
    } = req.body as Profile;

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (author !== undefined) {
      updates.push('author = ?');
      values.push(author);
    }
    if (languages !== undefined) {
      updates.push('languages = ?');
      values.push(JSON.stringify(languages));
    }
    if (preferences !== undefined) {
      updates.push('preferences = ?');
      values.push(JSON.stringify(preferences));
    }
    if (custom_rules !== undefined) {
      updates.push('custom_rules = ?');
      values.push(JSON.stringify(custom_rules));
    }
    if (reference_guide_path !== undefined) {
      updates.push('reference_guide_path = ?');
      values.push(reference_guide_path);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(profileId);

    const query = `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    res.json({ message: 'Profile updated successfully' });
  } catch (error: unknown) {
    console.error('Error updating profile:', error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return res.status(400).json({
        error: 'Profile name already exists',
      });
    }

    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/profiles/:id - Delete profile
router.delete('/profiles/:id', (req: Request, res: Response) => {
  const profileId = req.params.id;

  try {
    // Check if profile exists and if it's built-in
    const profile = db
      .prepare('SELECT is_builtin FROM profiles WHERE id = ?')
      .get(profileId) as { is_builtin: number } | undefined;

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.is_builtin) {
      return res.status(403).json({
        error: 'Cannot delete built-in profiles',
      });
    }

    db.prepare('DELETE FROM profiles WHERE id = ?').run(profileId);

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

export default router;
