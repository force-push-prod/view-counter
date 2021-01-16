import * as http from 'http';
import { URL } from 'url';

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'https://www.example.com');
  const tagId = url.pathname.slice(1);
  res.statusCode = 200;
  res.write('Hi');
  res.end();
});

server.listen(1234, 'localhost');
