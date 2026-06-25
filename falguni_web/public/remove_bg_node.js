const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('falguni-text2.png')
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
        
        // The background is a dirty dark grey (around r:20, g:20, b:20). 
        // The text is gold/bronze. 
        // If the pixel is dark enough, we make it transparent.
        if (r < 70 && g < 70 && b < 70) {
          this.data[idx+3] = 0; // alpha = 0
        } else {
          // Add a slight anti-aliasing edge softening if it's borderline
          if (r < 100 && g < 100 && b < 100) {
             this.data[idx+3] = 128; // semi-transparent
          }
        }
      }
    }

    this.pack().pipe(fs.createWriteStream('falguni-text-clean2.png'))
      .on('finish', () => {
        console.log('Successfully created transparent falguni-text-clean2.png!');
      });
  });
