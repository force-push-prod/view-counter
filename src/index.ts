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
    VALUES(@tagId, 1)`);
const updateTagCount = db.prepare(
  `UPDATE viewCount
    SET count = count + 1
    WHERE id = @tagId`
);
process.on('exit', () => db.close());

let canvas: Canvas.Canvas;
// const canvas = Canvas.createCanvas(100, 50);
// const ctx = canvas.getContext('2d');
let nixieImages = [];
for (let i = 0; i < 10; i++) {
  Canvas.loadImage(`${__dirname}/../assets/nixie-${i}.png`).then(image => {
    nixieImages.push(image);
  });
}

function generateNixieDigits(digits: number) {
  let digitArr = Array.from(`00000${digits}`.slice(-6));
  canvas = Canvas.createCanvas(522, 180);
  const ctx = canvas.getContext('2d');
  digitArr.forEach((digit, i) => {
    ctx.drawImage(nixieImages[digit], 87 * i, 0);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'https://www.example.com');
  const tagId = url.pathname.slice(1);
  const tagVal = getTag.get(tagId);
  if (tagVal) {
    updateTagCount.run({ tagId: tagId });
  } else {
    insertTagCount.run({ tagId: tagId });
  }
  const newTagCount = (tagVal?.count ?? 0) + 1;

  generateNixieDigits(newTagCount);
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ctx.font = '20px Impact';
  // ctx.fillText(`${newTagCount} views`, 5, 30);

  const bodyBuffer = canvas.toBuffer('image/png');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': Buffer.byteLength(bodyBuffer),
  });
  res.write(bodyBuffer);
  res.end();
});

server.listen(1234, 'localhost');
