const testFolder = 'data';
const fs = require('fs');

fs.readdir(testFolder, (error, filelist) => {
    filelist.forEach(file => {
    console.log(file);
  });
});