const express = require('express');
const multer = require('multer');
const { supabaseAdmin } = require('../lib/supabase.js');
const requireAuth = require('../middleware/auth.js');
const { sendWinnerProofEmail } = require('../services/emailService.js');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'));
  },
});

// GET /api/winners/my-wins
router.get('/my-wins', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('draw_entries')
      .select('*, draws(id, month, year, draw_numbers), winner_verifications(*)')
      .eq('user_id', req.user.id)
      .not('matched', 'is', null)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch winnings' });
  }
});

// POST /api/winners/:entryId/upload-proof
router.post('/:entryId/upload-proof', requireAuth, upload.single('proof'), async (req, res) => {
  try {
    const { entryId } = req.params;

    const { data: entry, error: entryError } = await supabaseAdmin
      .from('draw_entries').select('*').eq('id', entryId).eq('user_id', req.user.id).not('matched', 'is', null).single();

    if (entryError || !entry) return res.status(404).json({ error: 'Draw entry not found or not a winning entry' });
    if (!req.file) return res.status(400).json({ error: 'Proof file is required' });

    const ext = req.file.mimetype.split('/')[1] || 'jpg';
    const fileName = `${req.user.id}/${entryId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('winner-proofs').upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) return res.status(500).json({ error: 'Failed to upload proof file' });

    const { data: { publicUrl } } = supabaseAdmin.storage.from('winner-proofs').getPublicUrl(fileName);

    const { data: verification, error: verError } = await supabaseAdmin
      .from('winner_verifications')
      .upsert({ draw_entry_id: entryId, proof_url: publicUrl, status: 'pending', payout_status: 'pending' }, { onConflict: 'draw_entry_id' })
      .select().single();

    if (verError) return res.status(400).json({ error: verError.message });
    res.json({ message: 'Proof uploaded successfully', verification });
  } catch (err) {
    console.error('Proof upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload proof' });
  }
});

module.exports = router;
