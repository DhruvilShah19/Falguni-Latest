const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('falguni-logo-gold.png')
  .pipe(new PNG({
    filterType: 4
  }))
  .on('parsed', function() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;

        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        
        // The background in falguni-logo-gold.png is dark grey (around 26,26,26).
        // If the pixel is strictly dark grey/black, remove it.
        // The brown handle is much lighter (r > 80), so it will be preserved.
        if (r < 35 && g < 35 && b < 35) {
          this.data[idx+3] = 0; // alpha = 0
        } else if (r < 50 && g < 50 && b < 50) {
          // Soften the edges of the dark grey
          this.data[idx+3] = 100;
        }
      }
    }

    this.pack().pipe(fs.createWriteStream('falguni-logo-transparent.png'))
      .on('finish', () => {
        console.log('Successfully created transparent falguni-logo-transparent.png!');
      });
  });
