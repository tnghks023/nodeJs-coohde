var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')
var path = require('path');
const sanitizeHtml = require('sanitize-html');


var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname
  var title = queryData.id
  var filerdId = '';


  if (!(title === undefined)) {
    fileredId = path.parse(title).base;
  } 
  
  if (pathname == '/') {

    fs.readFile(`data/${fileredId}`, 'utf-8', (err, description) => {
      
      if (title === undefined) {
        title = 'Welcome';
        description = "Hello Node.js"
        control = `<a href="/create">create</a>`
      }

      var sanitizeTitle = sanitizeHtml(title);
      var sanitizeDescription = sanitizeHtml(description, {
        allowedTags:['h1']
      });
      var control =
        `<a href="/create">create</a>
      <a href="/update?id=${sanitizeTitle}">update</a>
      <form action="delete_process" method="post">
        <input type="hidden" name="id" value="${sanitizeTitle}">
        <input type="submit" value="delete">
      </form>
      `;
        fs.readdir('data', (err, filelist) => {

          var list = template.LIST(filelist)
  
          var html = template.HTML(sanitizeTitle, list,
            `<h2>${sanitizeTitle}</h2>${sanitizeDescription}`,
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
    var fileredId = path.parse(title).base;
    fs.readFile(`data/${fileredId}`, 'utf-8', (err, description) => {

      var title = queryData.id

      var sanitizeTitle = sanitizeHtml(title);
      var sanitizeDescription = sanitizeHtml(description);
      var control =
        `<a href="/create">create</a>
      <a href="/update?id=${sanitizeTitle}">update</a>`;

      fs.readdir('data', (err, filelist) => {

        var list = template.LIST(filelist)

        var html = template.HTML(sanitizeTitle, list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${sanitizeTitle}">
            <p><input type="text" name="title" placeholder="title" value="${sanitizeTitle}"></p>
            <p>
            <textarea name="description" placeholder="description">${sanitizeDescription}</textarea>
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