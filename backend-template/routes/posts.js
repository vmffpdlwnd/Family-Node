import express from 'express';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, u.username, u.nickname FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC',
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '게시글 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, u.username, u.nickname FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [req.params.id],
    );
    if (!rows.length) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '게시글을 가져오는 중 오류가 발생했습니다.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, content, category = '일반' } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용을 입력해주세요.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)',
      [req.user.id, title, content, category],
    );
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { title, content, category } = req.body;
  const postId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!rows.length) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: '게시글 수정 권한이 없습니다.' });
    }

    await pool.query(
      'UPDATE posts SET title = ?, content = ?, category = ? WHERE id = ?',
      [title || rows[0].title, content || rows[0].content, category || rows[0].category, postId],
    );
    const [updated] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
    return res.json(updated[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '게시글 수정 중 오류가 발생했습니다.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const postId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!rows.length) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: '게시글 삭제 권한이 없습니다.' });
    }

    await pool.query('DELETE FROM posts WHERE id = ?', [postId]);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;
