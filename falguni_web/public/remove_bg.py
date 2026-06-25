from PIL import Image

def process(file_in, file_out):
    try:
        img = Image.open(file_in).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            r, g, b, a = item
            # Calculate luminance or just max channel
            lum = max(r, g, b)
            if lum < 20: # crush near blacks to 0
                newData.append((r, g, b, 0))
            else:
                # If it's a solid black background, we want to make black pixels transparent.
                # To avoid jagged edges, we can map luminance to alpha for dark pixels.
                if lum < 100:
                    alpha = int((lum / 100.0) * 255)
                    newData.append((r, g, b, alpha))
                else:
                    newData.append((r, g, b, 255))
                
        img.putdata(newData)
        img.save(file_out, "PNG")
        print(f"Processed {file_in} -> {file_out}")
    except Exception as e:
        print(f"Error: {e}")

process("falguni-logo-gold.png", "falguni-logo-gold-transparent.png")
