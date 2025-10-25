import fitz  # PyMuPDF
import google.generativeai as genai
from PIL import Image
import io, os

# ==========================
# CONFIG
# ==========================

genai.configure(api_key="AIzaSyCXUQ-6FuRqBQQwc43IEq49dvoHv9usnZ8")
model = genai.GenerativeModel("gemini-2.5-flash")

# ==========================
# UTIL FUNCTIONS
# ==========================
def pdf_to_images(pdf_path):
    """Convert each page of a PDF to images"""
    pdf_document = fitz.open(pdf_path)
    image_paths = []
    os.makedirs("pdf_pages", exist_ok=True)

    for page_number in range(len(pdf_document)):
        page = pdf_document.load_page(page_number)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for clarity
        image_path = f"pdf_pages/page_{page_number+1}.png"
        pix.save(image_path)
        image_paths.append(image_path)

    return image_paths


def gemini_extract_text_and_diagrams(image_path):
    """Use Gemini 1.5 Flash to extract text + describe diagrams"""
    with Image.open(image_path) as img:
        response = model.generate_content([
            "Extract all readable text and describe any diagrams/figures briefly.",
            img
        ])
    return response.text


def process_pdf(pdf_path):
    image_paths = pdf_to_images(pdf_path)
    full_output = ""

    for i, img_path in enumerate(image_paths, start=1):
        print(f"\n🔍 Processing Page {i}: {img_path}")
        page_output = gemini_extract_text_and_diagrams(img_path)
        full_output += f"\n\n--- Page {i} ---\n{page_output}"
        print(f"✅ Page {i} done")

    with open("gemini_output.txt", "w", encoding="utf-8") as f:
        f.write(full_output)

    print("\n✨ Extraction complete → saved to gemini_output.txt")


# ==========================
# RUN
# ==========================
if __name__ == "__main__":
    pdf_path = "sample.pdf"  # change to your PDF file
    process_pdf(pdf_path)
