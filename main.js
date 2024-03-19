var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body) {

  return `
  <!doctype html>
  <html>
  <head>
    <title>WEBq - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    <a href="/create">create</a>
    ${body}
  </body>
  </html>
  `
}

function templateList(filelist) {
  var list = '<ul>';
  filelist.forEach(file => {
    list += `<li><a href="/?id=${file}">${file}</a></li>`;
  })
  list += '</ul>';
  return list;
}

var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname
  var title = queryData.id

  if (pathname == '/') {

    fs.readFile(`data/${queryData.id}`, 'utf-8', (err, description) => {

      if (title === undefined) {
        title = 'Welcome';
        description = "Hello Node.js"
      }

      fs.readdir('data', (err, filelist) => {

        var list = templateList(filelist)

        var template = templateHTML(title, list,
          `<h2>${title}</h2>${description}`);

        response.writeHead(200);
        response.end(template);
      })
    })

  } else if (pathname === '/create') {

    title = 'WEB - create';
    fs.readdir('data', (err, filelist) => {

      var list = templateList(filelist)

      var template = templateHTML(title, list,
        `
        <form action="http://localhost:3000/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p><textarea name="description" placeholder="description"></textarea></p>
          <p><input type="submit"></p>
        </form>
        `);

      response.writeHead(200);
      response.end(template);
    })

  } else if(pathname === '/create_process') {

    var body = '';

    request.on('data', (data) => {
      body += data;

    })

    request.on('end', () => {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      
      console.log(post.title)
    })

    response.writeHead(200);
    response.end('success');
  }else {
    response.writeHead(404);
    response.end('Not found');
  }

});

app.listen(3000);