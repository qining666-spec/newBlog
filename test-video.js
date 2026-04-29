const http = require('http');

const data = JSON.stringify({
  url: 'https://www.bilibili.com/video/BV1xx411c7mD',
  title: '测试视频'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/videos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
