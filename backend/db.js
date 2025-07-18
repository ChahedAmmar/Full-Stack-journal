import mysql from 'mysql2'
import dotenv from 'dotenv';
dotenv.config();

const pool= mysql.createPool({
    host:process.env.MYSQL_HOST,
    user:"root",
    password:process.env.MYSQL_PASS,
    database:process.env.MYSQL_DB


}).promise()

export async function addUser(UserName,password) {
    const [res]=await pool.query( 'INSERT INTO users  (username,password) values(?,?)',[UserName,password])
    return res.insertId
    
}


export async function getUser(username) {
  const res = await pool.query('select * from users where username=?', [username]);
  return res[0];
}
const resl=await getUser("chahed")

console.log(resl)

//enteries functions
export async function createEntry(userId, title, content,mood) {
    const [res]=await pool.query("INSERT INTO entries (user_id, title, content, mood) VALUES (?, ?, ?, ?)", [userId, title, content, mood])
    return res.insertId
    
}
export async function getEntriesByUserId(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM entries WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}
export async function getEntryById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM entries WHERE id = ?",
    [id]
  );
  return rows[0];
}
export async function updateEntry(id, title, content) {
  const result=await pool.query(
    "UPDATE entries SET title = ?, content = ? WHERE id = ?",
    [title, content, id]
  );
   if (result.affectedRows === 0) {
    return null; 
  }

  return { id, title, content };
}
export async function deleteEntry(id) {
  const [result] = await pool.query("DELETE FROM entries WHERE id = ?", [id]);
  return result;
}





