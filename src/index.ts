import * as http from 'http';

const server = http.createServer((req, res) => {
  const { url, headers } = req;
  res.statusCode = 200;
  res.write('Hi');
  res.end();
});

server.listen(1234, 'localhost');
