import os
from PIL import Image
from pathlib import Path

# Configuration
SOURCE_DIR = "frontend-production/images"
TARGET_FORMAT = "webp"
QUALITY = 80
MIN_SIZE_KB = 100  # Only convert images larger than this

def convert_images():
    print(f"Starting conversion in {SOURCE_DIR}...")
    count = 0
    saved_space = 0

    for path in Path(SOURCE_DIR).rglob("*"):
        if path.suffix.lower() in [".png", ".jpg", ".jpeg"] and "video" not in str(path):
            file_size_kb = path.stat().st_size / 1024
            if file_size_kb > MIN_SIZE_KB:
                try:
                    target_path = path.with_suffix("." + TARGET_FORMAT)
                    
                    # Skip if webp already exists and is significant
                    if target_path.exists() and target_path.stat().st_size > 0:
                        continue

                    print(f"Converting {path.name} ({file_size_kb:.1f} KB)...")
                    
                    with Image.open(path) as img:
                        # Handle RGBA for PNG
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGBA")
                        
                        img.save(target_path, TARGET_FORMAT, quality=QUALITY, optimize=True)
                        
                    new_size_kb = target_path.stat().st_size / 1024
                    diff = file_size_kb - new_size_kb
                    saved_space += diff
                    print(f" -> Created {target_path.name} ({new_size_kb:.1f} KB). Saved {diff:.1f} KB")
                    count += 1
                except Exception as e:
                    print(f"Error converting {path}: {e}")

    print(f"\nFinished! Converted {count} images. Total space saved: {saved_space/1024:.2f} MB")

if __name__ == "__main__":
    convert_images()
