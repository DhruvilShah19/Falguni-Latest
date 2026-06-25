const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('falguni-text-clean2.png')
  .pipe(new PNG({
    filterType: 4
  }))
  .on('parsed', function() {
    let minX = this.width, minY = this.height, maxX = 0, maxY = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;
        if (this.data[idx+3] > 0) { // non-transparent
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    console.log(`Bounding Box: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);
    let w = maxX - minX + 1;
    let h = maxY - minY + 1;
    console.log(`Crop dimensions: width=${w}, height=${h}`);
  });
