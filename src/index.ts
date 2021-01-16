import * as http from 'http';
import { URL } from 'url';
import * as Canvas from 'canvas';

const canvas = Canvas.createCanvas(100, 50);
const ctx = canvas.getContext('2d');
// Write "Awesome!"
ctx.font = '20px Impact';
ctx.fillText('Awesome!', 5, 30);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'https://www.example.com');
  const tagId = url.pathname.slice(1);
  const bodyBuffer = canvas.toBuffer('image/png');
  res.writeHead(200,{
    'Content-Type': 'image/png',
    'Content-Length': Buffer.byteLength(bodyBuffer)
  });
  res.write(bodyBuffer);
  res.end();
});

server.listen(1234, 'localhost');
