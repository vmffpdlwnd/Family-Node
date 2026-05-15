import express from 'express';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, u.username FROM schedules s JOIN users u ON s.user_id = u.id ORDER BY s.start_date ASC',
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '일정 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, u.username FROM schedules s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [req.params.id],
    );
    if (!rows.length) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '일정을 가져오는 중 오류가 발생했습니다.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: '제목, 시작일, 종료일을 입력해주세요.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO schedules (user_id, title, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description || '', start_date, end_date],
    );
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '일정 생성 중 오류가 발생했습니다.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  const scheduleId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
    if (!rows.length) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }
    const isOwner = String(rows[0].user_id) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: '일정 수정 권한이 없습니다.' });
    }

    await pool.query(
      'UPDATE schedules SET title = ?, description = ?, start_date = ?, end_date = ? WHERE id = ?',
      [title || rows[0].title, description || rows[0].description, start_date || rows[0].start_date, end_date || rows[0].end_date, scheduleId],
    );
    const [updated] = await pool.query('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
    return res.json(updated[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '일정 수정 중 오류가 발생했습니다.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const scheduleId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
    if (!rows.length) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }
    const isOwner = String(rows[0].user_id) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: '일정 삭제 권한이 없습니다.' });
    }
    await pool.query('DELETE FROM schedules WHERE id = ?', [scheduleId]);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '일정 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;
