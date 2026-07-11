import os
from PIL import Image, ImageDraw, ImageFont

source_image_path = r"C:\Users\hp\.gemini\antigravity\brain\beff90ab-8c56-4abd-b412-d516a389e5c9\pdf_triangle_app_icon_1783770440382.png"
res_dir = r"C:\Users\hp\.gemini\antigravity\scratch\pdf-editor-web\android-app\app\src\main\res"

sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

# Open source image
img = Image.open(source_image_path).convert("RGBA")
width, height = img.size

# Draw "PDF" text inside the triangle
draw = ImageDraw.Draw(img)
text = "PDF"
try:
    # Use Arial Bold from Windows system fonts
    font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 85)
except Exception:
    # Fallback to default if font fails to load
    font = ImageFont.load_default()

# Get text bounding box for centering
bbox = draw.textbbox((0, 0), text, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]

# Position "PDF" centered inside the hollow triangle
text_x = (width - text_w) / 2
# Offset slightly below the middle to align with the visual center of the triangle
text_y = (height - text_h) / 2 + 40

# Draw text with high quality anti-aliasing
draw.text((text_x, text_y), text, fill="white", font=font)

# Create a circular mask for round icons
def make_circular(im):
    size = min(im.size)
    im = im.crop((0, 0, size, size))
    mask = Image.new('L', (size, size), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, size, size), fill=255)
    result = Image.new('RGBA', (size, size))
    result.paste(im, (0, 0), mask=mask)
    return result

img_round = make_circular(img)

for folder, size in sizes.items():
    folder_path = os.path.join(res_dir, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    # Save standard icon (webp format as in the project)
    resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
    resized_img.save(os.path.join(folder_path, "ic_launcher.webp"), "WEBP", quality=95)
    
    # Save round icon
    resized_round = img_round.resize((size, size), Image.Resampling.LANCZOS)
    resized_round.save(os.path.join(folder_path, "ic_launcher_round.webp"), "WEBP", quality=95)

print("Icons resized and PDF text added inside successfully!")
