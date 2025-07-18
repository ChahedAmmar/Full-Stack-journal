import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

import {
  addUser,
  getUser,
  createEntry,
  getEntriesByUserId,
  getEntryById,
  updateEntry,
  deleteEntry,
} from './db.js';
const app=express()
app.use(cors());
app.use(express.json())
 // signup
 app.post('/api/users/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await getUser(username);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });

    }
     const hashedPassword = await bcrypt.hash(password, 10);

const userId = await addUser(username, hashedPassword);
  res.status(201).json({ userId });
}catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
//login 
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUser(username);
    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user[0].password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    res.json({ message: 'Login successful', userId: user[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
//get all the entries of a user
app.get('/api/entries/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const entries = await getEntriesByUserId(userId);
  res.json(entries);
});
//get a single entry
app.get('/api/entries/:id', async (req, res) => {
    const id=req.params.id
  const entry = await getEntryById(id);
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  res.json(entry);
});
//create an entry
app.post('/api/entries', async (req, res) => {
  const { userId, title, content, mood } = req.body;

  if (!userId || !title || !content || !mood) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const entryId = await createEntry(userId, title, content, mood);
    res.status(201).json({ entryId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
});
//update entry
app.put('/api/entries/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const pastEntry = await getEntryById(req.params.id);
    if (!pastEntry) return res.status(404).json({ message: 'Entry not found' });
    const updatedTitle = title ?? pastEntry.title;
    const updatedContent = content ?? pastEntry.content;
    const updated = await updateEntry(req.params.id, updatedTitle, updatedContent);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
app.delete('/api/entries/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await deleteEntry(id);
    res.status(200).json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});


app.listen(8000,()=>{
    console.log("ok")
})
