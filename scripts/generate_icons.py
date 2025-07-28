from PIL import Image, ImageDraw, ImageFont
import os
import sys


def get_system_font():
    """Get a reliable system font path"""
    if sys.platform == "win32":
        font_paths = [
            r"C:\Windows\Fonts\segoeui.ttf",
            r"C:\Windows\Fonts\arial.ttf",
            r"C:\Windows\Fonts\calibri.ttf",
        ]
        for path in font_paths:
            if os.path.exists(path):
                return path
    return None


def create_luxury_icon(size):
    # Create base image with dark background
    img = Image.new("RGBA", (size, size), (26, 26, 26, 255))
    draw = ImageDraw.Draw(img)

    # Add luxury gold border
    margin = size // 10
    border_width = max(1, size // 20)
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        outline=(255, 215, 0, 255),  # Gold color
        width=border_width,
    )

    # Add inner circle with gradient effect
    inner_margin = margin + border_width + 1
    draw.ellipse(
        [inner_margin, inner_margin, size - inner_margin, size - inner_margin],
        fill=(40, 40, 40, 255),
        outline=(200, 170, 0, 255),
    )

    # Add "BJ" text
    text = "BJ"
    font_size = size // 3

    # Get system font
    font_path = get_system_font()
    try:
        if font_path:
            font = ImageFont.truetype(font_path, font_size)
        else:
            font = ImageFont.load_default()
    except Exception as e:
        print(f"Font loading error: {e}")
        font = ImageFont.load_default()

    # Calculate text position for center alignment
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (size - text_width) / 2
    y = (size - text_height) / 2

    # Draw text with gold color
    draw.text((x, y), text, font=font, fill=(255, 215, 0, 255))

    return img


def main():
    # Ensure icons directory exists
    os.makedirs("icons", exist_ok=True)

    # Generate icons in required sizes
    sizes = [16, 48, 128]
    for size in sizes:
        icon = create_luxury_icon(size)
        output_path = f"icons/icon{size}.png"
        icon.save(output_path)
        print(f"Created {output_path}")


if __name__ == "__main__":
    main()
