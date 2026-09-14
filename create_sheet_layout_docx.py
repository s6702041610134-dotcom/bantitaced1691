import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

doc = docx.Document()

# Set standard margins (0.6 inch / 1.5 cm for compact header layout)
for section in doc.sections:
    section.top_margin = Inches(0.5)
    section.bottom_margin = Inches(0.5)
    section.left_margin = Inches(0.5)
    section.right_margin = Inches(0.5)

FONT_NAME = 'Cordia New'

def set_cell_border(cell, top="single", bottom="single", left="single", right="single", color="000000", sz="12"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="{top}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="{left}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{bottom}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="{right}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_header_table(doc, sheet_num, total_sheets=4):
    table = doc.add_table(rows=2, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Widths: Logo=1.1 in, Title=4.3 in, Type=1.1 in, Page=1.0 in -> Total = 7.5 in
    col_widths = [Inches(1.1), Inches(4.3), Inches(1.1), Inches(1.0)]

    # Row 0, Cell 0: Logo (merged row 0 & 1)
    cell_logo = table.cell(0, 0)
    cell_logo.merge(table.cell(1, 0))
    set_cell_border(cell_logo, sz="16")
    p_logo = cell_logo.paragraphs[0]
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(2)
    p_logo.paragraph_format.space_after = Pt(2)
    logo_path = "./images/krut_logo.png"
    if os.path.exists(logo_path):
        p_logo.add_run().add_picture(logo_path, width=Inches(0.95))

    # Row 0, Cell 1: Topic & Subject
    cell_topic = table.cell(0, 1)
    set_cell_border(cell_topic, sz="16")
    set_cell_margins(cell_topic, top=120, bottom=120, left=150, right=150)
    p_t = cell_topic.paragraphs[0]
    p_t.paragraph_format.space_after = Pt(2)
    r1 = p_t.add_run("เรื่อง ")
    r1.font.name = FONT_NAME
    r1.font.size = Pt(15)
    r1.font.bold = True
    r2 = p_t.add_run("การสร้างเว็บพอร์ตโฟลิโอนำเสนอเกม ด้วย vibeUI และ Gemini Canvas")
    r2.font.name = FONT_NAME
    r2.font.size = Pt(14)

    p_s = cell_topic.add_paragraph()
    p_s.paragraph_format.space_after = Pt(2)
    r3 = p_s.add_run("วิชา ")
    r3.font.name = FONT_NAME
    r3.font.size = Pt(15)
    r3.font.bold = True
    r4 = p_s.add_run("Vibe Coding & Google App Script (การสร้างเกมเชิงโต้ตอบด้วย AI)")
    r4.font.name = FONT_NAME
    r4.font.size = Pt(14)

    # Row 0, Cell 2: ใบเนื้อหา (Header label)
    cell_type = table.cell(0, 2)
    set_cell_border(cell_type, sz="16")
    cell_type.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p_type = cell_type.paragraphs[0]
    p_type.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_type = p_type.add_run("ใบเนื้อหา")
    r_type.font.name = FONT_NAME
    r_type.font.size = Pt(16)
    r_type.font.bold = True

    # Row 0, Cell 3: หน้าที่ X
    cell_page = table.cell(0, 3)
    set_cell_border(cell_page, sz="16")
    p_page = cell_page.paragraphs[0]
    p_page.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_p1 = p_page.add_run("หน้าที่\n")
    r_p1.font.name = FONT_NAME
    r_p1.font.size = Pt(14)
    r_p1.font.bold = True
    r_p2 = p_page.add_run(f"{sheet_num}")
    r_p2.font.name = FONT_NAME
    r_p2.font.size = Pt(16)
    r_p2.font.bold = True

    # Row 1, Cell 1 & 2 & 3: Sheet counter
    cell_blank = table.cell(1, 1)
    cell_sheet = table.cell(1, 2)
    cell_sheet.merge(table.cell(1, 3))
    set_cell_border(cell_blank, top="single", bottom="single", left="single", right="single", sz="16")
    set_cell_border(cell_sheet, top="single", bottom="single", left="single", right="single", sz="16")
    
    p_sheet = cell_sheet.paragraphs[0]
    p_sheet.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sh = p_sheet.add_run(f"แผ่นที่ : {sheet_num} / {total_sheets}")
    r_sh.font.name = FONT_NAME
    r_sh.font.size = Pt(15)
    r_sh.font.bold = True

    # Set explicit widths for columns
    for row in table.rows:
        for idx, width in enumerate(col_widths):
            if idx < len(row.cells):
                row.cells[idx].width = width

    # Add space after header table
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)
    p_sp.paragraph_format.space_after = Pt(4)

def add_images_footer_table(doc, images_data):
    """
    images_data: list of tuples (img_path, caption_text)
    Creates a 1-row table with images side-by-side matching the exact template layout!
    """
    if not images_data:
        return
    
    num_imgs = len(images_data)
    table = doc.add_table(rows=1, cols=num_imgs)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    total_width = 7.2
    col_width = Inches(total_width / num_imgs)
    img_render_width = Inches((total_width / num_imgs) - 0.2)

    for i, (img_path, caption) in enumerate(images_data):
        cell = table.cell(0, i)
        cell.width = col_width
        set_cell_border(cell, top="single", bottom="single", left="single", right="single", sz="8", color="CCCCCC")
        
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(2)
        
        if os.path.exists(img_path):
            p.add_run().add_picture(img_path, width=img_render_width)
            
        p_cap = cell.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(4)
        r_cap = p_cap.add_run(caption)
        r_cap.font.name = FONT_NAME
        r_cap.font.size = Pt(12)
        r_cap.font.bold = True

def add_heading_main(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    r.font.name = FONT_NAME
    r.font.size = Pt(18)
    r.font.bold = True
    return p

def add_heading_numbered(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    r.font.name = FONT_NAME
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.underline = True
    return p

def add_subheading(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.3)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(text)
    r.font.name = FONT_NAME
    r.font.size = Pt(15)
    r.font.bold = True
    return p

def add_body_text(doc, text, bold_prefix="", indent=0.3):
    p = doc.add_paragraph()
    if indent > 0:
        p.paragraph_format.left_indent = Inches(indent)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = FONT_NAME
        r_bold.font.size = Pt(14)
        r_bold.font.bold = True
    r = p.add_run(text)
    r.font.name = FONT_NAME
    r.font.size = Pt(14)
    return p

img_dir = "./images"

# ==========================================
# SHEET 1 / 4
# ==========================================
add_header_table(doc, sheet_num=1, total_sheets=4)

add_heading_main(doc, "คลังต้นแบบ UI (vibeUI) สำหรับสร้างพอร์ตโฟลิโอด้วย AI")

add_heading_numbered(doc, "1. ความหมายและวัตถุประสงค์ของ vibeUI")
add_body_text(doc, "vibeUI คือคลังชุดคำสั่ง (Prompt) สำเร็จรูปสำหรับสร้างส่วนติดต่อผู้ใช้งาน (UI) ทั้งหมด 92 รายการ แบ่งเป็น 15 หมวดหมู่หลัก ช่วยแก้ปัญหาผู้เรียนที่ไม่รู้จะเริ่มออกแบบหน้าตาเว็บไซต์อย่างไร ให้สามารถคัดลอกโครงสร้างหน้าตาที่ต้องการไปสั่งงาน AI (Gemini Canvas) ได้ทันทีโดยไม่ต้องเขียนโค้ดเองตั้งแต่ต้น", indent=0)

add_heading_numbered(doc, "2. โครงสร้างหมวดหมู่ในคลัง vibeUI (15 หมวดหมู่หลัก)")
add_subheading(doc, "2.1 หมวดหมู่สำคัญที่ใช้สำหรับเว็บพอร์ตโฟลิโอนำเสนอเกม")
add_body_text(doc, "การสร้างหน้าแรกแนะนำตัวละคร ชื่อเกม บทสรุปเกม พร้อมปุ่มกดไปเล่น", bold_prefix="• Hero Sections: ")
add_body_text(doc, "การจัดวางกล่องแสดงจุดเด่นเกม ภาพหน้าจอ (Screenshot) และฟีเจอร์เด่น", bold_prefix="• Features / Bento: ")
add_body_text(doc, "แบนเนอร์กระตุ้นการกดปุ่ม 'เล่นเกมเลย' ที่เชื่อมลิงก์ออกไปยัง itch.io", bold_prefix="• CTA Banners: ")
add_body_text(doc, "ส่วนท้ายเว็บไซต์แสดงช่องทางติดต่อผู้พัฒนา และลิขสิทธิ์ผลงาน", bold_prefix="• Contact / Footer: ")

add_heading_numbered(doc, "3. หลักการทำงาน (Input → Process → Output)")
add_body_text(doc, "คัดลอก Prompt จาก vibeUI พร้อมแนบภาพสกรีนช็อตอ้างอิงสไตล์ (ถ้ามี)", bold_prefix="Input: ")
add_body_text(doc, "วางลงใน Gemini Canvas เพื่อให้ AI วิเคราะห์โครงสร้างและจับคู่สี/ฟอนต์จากภาพ", bold_prefix="Process: ")
add_body_text(doc, "ได้หน้าเว็บพอร์ตโฟลิโอโต้ตอบได้ตรงตามสไตล์ที่ต้องการ", bold_prefix="Output: ")

add_images_footer_table(doc, [
    (f"{img_dir}/vibeui_real_overview.jpg", "ภาพที่ 1 คลัง Prompt vibeui.online"),
    (f"{img_dir}/vibeui_real_hero.jpg", "ภาพที่ 2 หมวด Hero Sections"),
    (f"{img_dir}/vibeui_real_bento.jpg", "ภาพที่ 3 หมวด Features / Bento")
])

doc.add_page_break()

# ==========================================
# SHEET 2 / 4
# ==========================================
add_header_table(doc, sheet_num=2, total_sheets=4)

add_heading_main(doc, "ขั้นตอนปฏิบัติการสร้างเว็บพอร์ตโฟลิโอผ่าน Gemini Canvas")

add_heading_numbered(doc, "1. แผนผังกระบวนการทำงาน 5 ขั้นตอน (5-Step Workflow)")
add_body_text(doc, "กระบวนการสร้างเว็บพอร์ตโฟลิโอเริ่มจาก: 1. เข้าสู่ระบบ Gemini → 2. เตรียม Prompt + ภาพ → 3. วางคำสั่งและเชื่อมลิงก์ → 4. ตรวจสอบ/ปรับแต่ง (Refine) → 5. ดาวน์โหลดไฟล์ HTML", indent=0)

add_heading_numbered(doc, "2. ขั้นตอนปฏิบัติอย่างละเอียด")
add_subheading(doc, "2.1 ขั้นตอนที่ 1: เข้าสู่ Gemini และเปิดโหมด Canvas")
add_body_text(doc, "เข้าสู่ gemini.google.com ด้วยบัญชี Google สังเกตพื้นที่ทำงาน Canvas ที่พร้อมรับคำสั่งสร้างโค้ดหน้าเว็บ")

add_subheading(doc, "2.2 ขั้นตอนที่ 2: เตรียม Prompt จาก vibeUI และแนบภาพสกรีนช็อต")
add_body_text(doc, "คัดลอกข้อความ Prompt จากคลัง vibeUI และเตรียมภาพถ่ายหน้าจอเกมจริงในเครื่องเพื่อแนบอ้างอิงสไตล์")

add_subheading(doc, "2.3 ขั้นตอนที่ 3: วางคำสั่ง และระบุลิงก์เชื่อมไปยังเกมบน itch.io")
add_body_text(doc, "วาง Prompt ลงในช่องพิมพ์ แล้วพิมพ์ระบุลิงก์เกมเพิ่มเติม เช่น 'และทำให้ปุ่ม Play Game เปิดลิงก์ https://mygame.itch.io ในแท็บใหม่'")

add_images_footer_table(doc, [
    (f"{img_dir}/workflow_steps_diagram_1788958186415.jpg", "ภาพที่ 1 แผนผัง 5-Step Workflow"),
    (f"{img_dir}/gemini_canvas_light.jpg", "ภาพที่ 2 พื้นที่ทำงาน Gemini Canvas"),
    (f"{img_dir}/game_portfolio_hero_1788958115926.jpg", "ภาพที่ 3 พอร์ตโฟลิโอ Hero Section")
])

doc.add_page_break()

# ==========================================
# SHEET 3 / 4
# ==========================================
add_header_table(doc, sheet_num=3, total_sheets=4)

add_heading_main(doc, "การปรับแต่งผลลัพธ์ การแก้ปัญหา และข้อควรระวัง")

add_heading_numbered(doc, "1. การปรับแต่งผลลัพธ์เฉพาะจุด (Iterative Refinement)")
add_body_text(doc, "หากผลลัพธ์ในหน้าพรีวิว Canvas ยังไม่ตรงตามต้องการ ให้พิมพ์คำสั่งปรับแก้ทีละจุด (Refine) เช่น 'ปรับปุ่มให้เป็นสีส้มนีออน' โดยไม่ต้องเริ่มพิมพ์ใหม่ทั้งหมด", indent=0)

add_heading_numbered(doc, "2. การแก้ไขปัญหาเบื้องต้น (Troubleshooting)")
add_body_text(doc, "ให้พิมพ์ระบุในคำสั่งให้ชัดเจนว่าต้องการสร้างโค้ดหน้าเว็บ HTML", bold_prefix="• Canvas ไม่เปิดขึ้นมา: ")
add_body_text(doc, "ให้พิมพ์คำสั่ง Refine ระบุ URL ลิงก์เกมให้ชัดเจนอีกครั้ง", bold_prefix="• ปุ่มกดแล้วไม่เปิดลิงก์: ")
add_body_text(doc, "ให้แนบภาพตัวอย่างสไตล์ใหม่อีกครั้งเพื่อให้อัลกอริทึมจับคู่สี", bold_prefix="• สีผลลัพธ์ไม่ตรงตามภาพ: ")

add_heading_numbered(doc, "3. ข้อผิดพลาดที่พบบ่อย (Common Mistakes)")
add_body_text(doc, "ห้ามพิมพ์คำสั่งสั้นทั่วไป เช่น 'สร้างเว็บให้หน่อย' ให้ใช้ Prompt จาก vibeUI เป็นฐานเสมอ", bold_prefix="• ข้อผิดพลาดที่ 1: ")
add_body_text(doc, "ห้ามส่งคำสั่ง Refine หลายอย่างพร้อมกันในครั้งเดียว ให้ปรับแก้ทีละจุด", bold_prefix="• ข้อผิดพลาดที่ 2: ")

add_images_footer_table(doc, [
    (f"{img_dir}/bento_features_showcase_1788958156828.jpg", "ภาพที่ 1 หน้า Bento Features Showcase"),
    (f"{img_dir}/vibeui_real_overview.jpg", "ภาพที่ 2 ตัวอย่างการเลือก Prompt"),
    (f"{img_dir}/gemini_canvas_light.jpg", "ภาพที่ 3 การดาวน์โหลดไฟล์ HTML")
])

doc.add_page_break()

# ==========================================
# SHEET 4 / 4
# ==========================================
add_header_table(doc, sheet_num=4, total_sheets=4)

add_heading_main(doc, "แบบฝึกปฏิบัติรวมท้ายเล่ม และแบบประเมินผล")

add_heading_numbered(doc, "1. แบบฝึกปฏิบัติรวม (Final Practical Task)")
add_body_text(doc, "ให้นักเรียนสร้างเว็บพอร์ตโฟลิโอ 1 หน้า เพื่อนำเสนอเกมของตนเอง โดยใช้ vibeUI ร่วมกับ Gemini Canvas และกดปุ่มลิงก์ไปยัง itch.io ได้จริง", indent=0)

add_heading_numbered(doc, "2. Checklist ตรวจสอบความสมบูรณ์ก่อนส่งงาน")
add_body_text(doc, "[  ] เลือกหมวดหมู่ vibeUI และเตรียม Prompt เรียบร้อยแล้ว", indent=0.3)
add_body_text(doc, "[  ] สร้างผลลัพธ์ใน Gemini Canvas และเชื่อมปุ่มไปยังลิงก์เกมจริงสำเร็จ", indent=0.3)
add_body_text(doc, "[  ] ทดสอบเปิดไฟล์ HTML ในเว็บเบราว์เซอร์และทดลองกดปุ่มเรียบร้อย", indent=0.3)

add_heading_numbered(doc, "3. เฉลยแบบทดสอบความรู้ (Answer Key & Glossary)")
add_body_text(doc, "vibeUI มีทั้งหมด 92 Prompts แบ่งเป็น 15 หมวดหมู่หลัก", bold_prefix="• ข้อ 1: ")
add_body_text(doc, "หมวด Hero Sections เหมาะกับการสร้างหน้าแรกนำเสนอเกมมากที่สุด", bold_prefix="• ข้อ 2: ")
add_body_text(doc, "Gemini Canvas คือพื้นที่ทำงานที่แสดงโค้ดและตัวอย่างพรีวิวโต้ตอบได้ทันที", bold_prefix="• ข้อ 3: ")

add_images_footer_table(doc, [
    (f"{img_dir}/workflow_steps_diagram_1788958186415.jpg", "ภาพที่ 1 สรุปขั้นตอน 5-Step Workflow"),
    (f"{img_dir}/game_portfolio_hero_1788958115926.jpg", "ภาพที่ 2 ตัวอย่างชิ้นงานพอร์ตโฟลิโอที่สมบูรณ์")
])

doc.save("คู่มือการเรียนรู้_vibeUI_GeminiCanvas.docx")
print("Successfully generated Word document in official 'ใบเนื้อหา' format!")
