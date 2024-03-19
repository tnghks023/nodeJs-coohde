var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')
var path = require('path');


var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname
  var title = queryData.id

  var fileredId = path.parse(queryData.id).base;
  if (pathname == '/') {

    fs.readFile(`data/${fileredId}`, 'utf-8', (err, description) => {
      
      var control =
        `<a href="/create">create</a>
      <a href="/update?id=${title}">update</a>
      <form action="delete_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <input type="submit" value="delete">
      </form>
      `;

      if (title === undefined) {
        title = 'Welcome';
        description = "Hello Node.js"
        control = `<a href="/create">create</a>`
      }

        fs.readdir('data', (err, filelist) => {

          var list = template.LIST(filelist)
  
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            control);
  
          response.writeHead(200);
          response.end(html);
      })
    })

  } else if (pathname === '/create') {

    title = 'WEB - create';
    fs.readdir('data', (err, filelist) => {

      var list = template.LIST(filelist)

      var html = template.HTML(title, list,
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p><textarea name="description" placeholder="description"></textarea></p>
          <p><input type="submit"></p>
        </form>
        `, '');

      response.writeHead(200);
      response.end(html);
    })

  } else if (pathname === '/create_process') {

    var body = '';
    request.on('data', (data) => {
      body += data;

    })
    request.on('end', () => {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;

      fs.writeFile(`data/${title}`, description, 'utf8', (err) => {

        response.writeHead(302, {
          Location: `/?id=${title}`
        });
        response.end('success');
      })

    })

  } else if (pathname === '/update') {
    fs.readFile(`data/${fileredId}`, 'utf-8', (err, description) => {

      var title = queryData.id
      var control =
        `<a href="/create">create</a>
      <a href="/update?id=${title}">update</a>`;

      fs.readdir('data', (err, filelist) => {

        var list = template.LIST(filelist)

        var html = template.HTML(title, list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
            <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p><input type="submit"></p>
          </form>
          `,
          control);

        response.writeHead(200);
        response.end(html);
      })
    })

  } else if (pathname === '/update_process') {

    var body = '';
    request.on('data', (data) => {
      body += data;

    })
    request.on('end', () => {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;

      fs.rename(`data/${id}`, `data/${title}`, (error) => {
        fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
          response.writeHead(302, {
            Location: `/?id=${title}`
          });
          response.end();
        })
      })
    })

  } else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', (data) => {
      body += data;

    })
    request.on('end', () => {
      var post = qs.parse(body);
      var id = post.id;
      var fileredId = path.parse(id).base;

      fs.unlink(`data/${fileredId}`, () => {
        response.writeHead(302, {
          Location: `/`
        });
        response.end();
      })

    })
  } else {
    response.writeHead(404);
    response.end('Not found');
  }

});

app.listen(3000);