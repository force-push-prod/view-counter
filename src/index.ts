import * as http from 'http';
import { URL } from 'url';
import * as Canvas from 'canvas';
import * as Database from 'better-sqlite3';

const db = new Database('viewtable.db', { verbose: console.log });
db.exec(
  `CREATE TABLE IF NOT EXISTS viewCount (
      id varchar(255)    NOT NULL,
      count int          NOT NULL, 
      PRIMARY KEY (id)
    )`
);
const getTag = db.prepare(`SELECT count FROM viewCount WHERE id = ?`);
const insertTagCount = db.prepare(`
  INSERT INTO viewCount (id, count)
    VALUES(@tagId, @count)`);
const updateTagCount = db.prepare(
  `UPDATE viewCount
    SET count = @count
    WHERE id = @tagId`
);
process.on('exit', () => db.close());

const canvas = Canvas.createCanvas(100, 50);
const ctx = canvas.getContext('2d');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'https://www.example.com');
  const tagId = url.pathname.slice(1);
  const tagCount = getTag.get(tagId);
  if (tagCount) {
    updateTagCount.run({ tagId: tagId, count: tagCount.count + 1 });
  } else {
    insertTagCount.run({ tagId: tagId, count: 1 });
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '20px Impact';
  ctx.fillText(`${tagCount?.count + 1 ?? 1} views`, 5, 30);

  const bodyBuffer = canvas.toBuffer('image/png');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': Buffer.byteLength(bodyBuffer),
  });
  res.write(bodyBuffer);
  res.end();
});

server.listen(1234, 'localhost');
