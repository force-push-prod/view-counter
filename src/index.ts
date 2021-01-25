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

Canvas.registerFont(`${__dirname}/../assets/ChessType.ttf`, {
  family: 'ChessType',
});
Canvas.registerFont(`${__dirname}/../assets/brandon-grotesque-light.otf`, {
  family: 'Brandon',
});

let canvas: Canvas.Canvas;
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

function generateChessTypeDigits(digits: number) {
  canvas = Canvas.createCanvas(270, 90);
  const ctx = canvas.getContext('2d');
  ctx.font = '66px "ChessType"';
  ctx.fillText(`00000${digits}`.slice(-6), 0, 70);
}

function generateBrandonDigits(digits: number) {
  canvas = Canvas.createCanvas(260, 80);
  const ctx = canvas.getContext('2d');
  ctx.font = '66px "Brandon"';
  ctx.fillText(`00000${digits}`.slice(-6), 8, 65);
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

  switch (url.searchParams.get('style')) {
    case 'nixie':
      generateNixieDigits(newTagCount);
      break;
    case 'chessType':
      generateChessTypeDigits(newTagCount);
      break;
    case 'brandon':
      generateBrandonDigits(newTagCount);
      break;
    default:
      generateChessTypeDigits(newTagCount);
  }

  const bodyBuffer = canvas.toBuffer('image/png');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': Buffer.byteLength(bodyBuffer),
    'Cache-Control': 'no-store, max-age=0',
  });
  res.write(bodyBuffer);
  res.end();
});

server.listen(parseInt(process.env.PORT) || 1234, 'localhost');
