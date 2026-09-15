import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_presentation_document(filename):
    doc = docx.Document()

    # Define Page Margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color Palette Definitions (App Brand Palette)
    COLOR_PURPLE = RGBColor(102, 2, 60)     # #66023C Tyrian Purple
    COLOR_BROWN = RGBColor(57, 29, 1)       # #391D01 Chocolate Brown
    COLOR_CITRON = RGBColor(150, 160, 70)   # #CAD183 Citron (darker for text legibility)
    COLOR_DARK_TEXT = RGBColor(40, 40, 40)
    HEX_PURPLE = "66023C"
    HEX_LIGHT_BG = "F9F8EF"
    HEX_CITRON_BG = "EFF2D6"
    HEX_BORDER = "D1CDB8"

    # Helper function for setting cell shading
    def set_cell_background(cell, hex_color):
        shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        cell._tc.get_or_add_tcPr().append(shading_elm)

    # Helper function for cell margins
    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m_name, m_val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m_name}')
            node.set(qn('w:w'), str(m_val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    # Helper function for section headings
    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Helvetica'
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = COLOR_PURPLE
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Helvetica'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = COLOR_BROWN
        return p

    # --- TITLE BLOCK ---
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(10)
    title_p.paragraph_format.space_after = Pt(2)
    title_run = title_p.add_run("10-MINUTE PRESENTATION SCRIPT & DEMO GUIDE")
    title_run.font.name = 'Helvetica'
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = COLOR_PURPLE

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(16)
    sub_run = sub_p.add_run("Focus Feature: Interactive Map System & Thermal Receipt Generation (Bangkok Explorer / Voyager)")
    sub_run.font.name = 'Helvetica'
    sub_run.font.size = Pt(12)
    sub_run.font.italic = True
    sub_run.font.color.rgb = COLOR_BROWN

    # Info Box Table
    info_table = doc.add_table(rows=1, cols=1)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = info_table.cell(0, 0)
    set_cell_background(cell, HEX_LIGHT_BG)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    info_p = cell.paragraphs[0]
    info_p.paragraph_format.space_after = Pt(0)
    r = info_p.add_run("⏱ Total Duration: ")
    r.bold = True
    r.font.color.rgb = COLOR_PURPLE
    info_p.add_run("10 Minutes  |  🌐 ")
    r2 = info_p.add_run("Languages: ")
    r2.bold = True
    r2.font.color.rgb = COLOR_PURPLE
    info_p.add_run("Thai (ไทย) & English (EN)  |  🎯 ")
    r3 = info_p.add_run("Primary Focus: ")
    r3.bold = True
    r3.font.color.rgb = COLOR_PURPLE
    info_p.add_run("Interactive Map System (70%) + Ecosystem Overview (30%)")

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================================
    # SECTION 1: THAI PRESENTATION SCRIPT
    # ==========================================
    add_heading_1("🇹🇭 Part 1: บทสคริปต์การนำเสนอภาษาไทย (Thai Script — 10 นาที)")

    thai_sections = [
        {
            "time": "00:00 - 01:30 (1.5 นาที)",
            "title": "ช่วงที่ 1: บทนำ และโจทย์ความต้องการของผู้ใช้งาน (Introduction & Concept)",
            "action": "📱 แสดงหน้าหลัก (Index / Explorer Screen) & โลโก้แอป",
            "speech": (
                "สวัสดีครับทุกท่าน วันนี้ผมขอแนะนำแอปพลิเคชัน 'Bangkok Explorer' หรือ 'Voyager' "
                "สมาร์ทแอปพลิเคชันเพื่อการท่องเที่ยวและการเดินทางในเมืองหลวงอย่างกรุงเทพมหานคร "
                "ที่ถูกออกแบบมาเพื่อตอบโจทย์นักเดินทางยุคใหม่ ที่ไม่ได้ต้องการแค่การนำทางแบบเดิมๆ "
                "แต่ต้องการประสบการณ์เชิงพื้นที่ (Spatial Experience) ที่งดงาม ใช้งานง่าย "
                "และบันทึกความทรงจำการเดินทางได้อย่างมีสไตล์ครับ\n\n"
                "ปัญหาของแอปนำทางทั่วไปคือเน้นเฉพาะตัวเลขจุดหมายปลายทาง แต่ขาดความรู้สึกสนุกสนานและการเก็บบันทึกประทับใจ "
                "แอปของเราจึงรวมเอา 3 หัวใจหลักเข้าด้วยกัน คือ 1) ระบบแผนที่นำทางอัจฉริยะ 2) ระบบค้นพบสถานที่ตามหมวดหมู่ "
                "และ 3) อัลบั้มสมุดเดินทางในรูปแบบพาสปอร์ตส่วนตัวครับ"
            )
        },
        {
            "time": "01:30 - 06:30 (5.0 นาที)",
            "title": "ช่วงที่ 2: ฟีเจอร์หลัก — ระบบแผนที่นำทางอัจฉริยะและการออกใบเสร็จ (Core Feature: Map System & Thermal Receipt)",
            "action": "🗺️ สลับมาที่หน้า Map Screen — สาธิตปักหมุด ค้นหา คันศรเข็มทิศ พยากรณ์อากาศ และกด Finish Journey",
            "speech": (
                "ตอนนี้เรามาดูฟีเจอร์ไฮไลท์หลักของเรา นั่นคือ 'ระบบแผนที่ (Map System)' ครับ (สลับหน้าจอมาที่ Map)\n\n"
                "1. การค้นหาและปักหมุดอัจฉริยะ (Smart Search & Marker Pinning):\n"
                "ผู้ใช้สามารถค้นหาสถานที่ยอดนิยมในกรุงเทพฯ เช่น 'วัดพระแก้ว', 'เยาวราช', หรือ 'อารีย์' ได้ทันที "
                "ผ่าน Search Bar ด้านบน เมื่อแตะเลือก หมุดจะแสดงพร้อมลำดับตัวเลข 01, 02, 03 อย่างชัดเจน "
                "พร้อมทั้งแสดงการลากเส้นทางถนนจริง (Road Navigation Polyline) และคำนวณระยะทางรวม (Total Road Distance) แบบเรียลไทม์ครับ\n\n"
                "2. เข็มทิศนำทางและพยากรณ์อากาศสด (Digital Compass & Live Weather Forecast):\n"
                "ที่มุมซ้ายบน เรามีปุ่มเข็มทิศดิจิทัล ที่เมื่อกดเปิด จะแสดงหน้าต่างองศาทิศทาง (Bearing & Coordinates) แบบเรียลไทม์ "
                "ช่วยให้นักท่องเที่ยวปรับทิศทางในเมืองได้อย่างแม่นยำ นอกจากนี้ยังมีปุ่มพยากรณ์อากาศสด (Live Weather Modal) "
                "ที่ช่วยเช็กสภาพอากาศและอุณหภูมิก่อนออกเดินทางได้ทันทีครับ\n\n"
                "3. ไฮไลท์สำคัญ: การออกใบเสร็จการเดินทาง (Thermal Printer Travel Receipt):\n"
                "เมื่อผู้ใช้วางแผนทริปเสร็จแล้ว เพียงกดปุ่ม 'Finish Journey' ระบบจะทำ 3 ขั้นตอนอัตโนมัติ คือ:\n"
                "   • คำนวณขอบเขตพิกัดทั้งหมด (Fit to Coordinates) ให้ครอบคลุมทุกจุดหมุดและเส้นทาง\n"
                "   • ถ่ายภาพสแนปช็อตแผนที่แนวนอน 16:9 (Native Map Snapshot) แบบคมชัดสูง\n"
                "   • ปริ้นต์ใบเสร็จจำลอง (Thermal Receipt Animation) ไหลออกมาจากเครื่อง พร้อมรายละเอียด วันที่, เวลา, "
                "รายการสถานที่, ระยะทางรวม และรูปภาพแผนที่ทริปนั้นอย่างสวยงาม!\n\n"
                "ผู้ใช้สามารถกด 'Print & Save' เพื่อบันทึกรูปใบเสร็จลงคลังภาพ หรือแชร์ไปยังโซเชียลมีเดียได้ทันทีครับ!"
            )
        },
        {
            "time": "06:30 - 08:30 (2.0 นาที)",
            "title": "ช่วงที่ 3: ระบบนิเวศการใช้งาน — Explore, Travel Album & Designer Passport",
            "action": "🧭 สลับไปหน้า Explore -> Album -> Profile Passport",
            "speech": (
                "นอกจากระบบแผนที่แล้ว แอปยังเชื่อมโยงกับระบบนิเวศอื่นๆ อีก 3 ส่วนครับ:\n\n"
                "1. หน้า Explore (ค้นพบสถานที่):\n"
                "มีระบบกรองหมวดหมู่ เช่น วัด & วัฒนธรรม, คาเฟ่, ตลาดสตรีทฟู้ด และมิวเซียม พร้อมฟังก์ชัน 'Add to Trip' "
                "เพื่อเพิ่มสถานที่เข้าทริปเดินทางได้ทันที\n\n"
                "2. หน้า Album (สมุดบันทึก & ตราประทับ):\n"
                "เปรียบเสมือนไดอารี่เดินทาง ที่รวบรวมตราประทับ (Collectible Stamps) และสมุดบันทึกภาพถ่ายประจำวัน "
                "ตามปฏิทินการเดินทางของคุณ\n\n"
                "3. หน้า Profile Passport (บัตรประจำตัวนักเดินทาง):\n"
                "เก็บบัตร Designer Passport ดีไซน์สุดพรีเมียม ที่แสดงตัวตน สถานที่โปรด พร้อมตราประทับหมึกทางการ "
                "ที่สามารถกดแชร์เป็นการ์ดรูปภาพได้ครับ"
            )
        },
        {
            "time": "08:30 - 09:30 (1.0 นาที)",
            "title": "ช่วงที่ 4: ดีไซน์และอัตลักษณ์ทางสถาปัตยกรรม (Visual Design & Tech Stack)",
            "action": "🎨 แสดงรายละเอียด Palette สี และความสอดคล้องของ UI",
            "speech": (
                "ในด้านการดีไซน์ แอปพลิเคชันใช้ระบบสีแบรนด์ดิ้ง 4 สีหลัก ได้แก่:\n"
                "• Citron (#CAD183) — พื้นผิวการ์ดและสีสันธรรมชาติ\n"
                "• Tyrian Purple (#66023C) — ปุ่มแอ็กชันหลักและจุดเน้นสายตา\n"
                "• Pistachio (#BADD7F) — สถานะความสำเร็จและองค์ประกอบรอง\n"
                "• Chocolate Brown (#391D01) — ตัวอักษรความคมชัดสูง อ่านง่ายสบายตา\n\n"
                "ผนวกกับสไตล์ Frosted Glassmorphism และฟอนต์ Cormorant Garamond / Inter ทำให้แอปมีมิติ เรียบหรู และทันสมัยครับ"
            )
        },
        {
            "time": "09:30 - 10:00 (0.5 นาที)",
            "title": "ช่วงที่ 5: สรุปจบและการเปิดรับคำถาม (Conclusion & Q&A)",
            "action": "🙋‍♂️ สลับกลับมาหน้า Map พร้อมเปิดรับคำถามจากคณะกรรมการ",
            "speech": (
                "สรุปแล้ว 'Bangkok Explorer' ไม่เพียงแต่ช่วยให้นักท่องเที่ยวเดินทางได้แม่นยำบนแผนที่ "
                "แต่ยังเปลี่ยนทุกกิโลเมตรและทุกสถานที่ ให้กลายเป็นความทรงจำรูปใบเสร็จและตราประทับที่จับต้องได้ครับ "
                "ขอขอบคุณทุกท่านครับ และยินดีรับฟังคำแนะนำหรือคำถามครับ!"
            )
        }
    ]

    for section in thai_sections:
        # Table per section for structure
        tbl = doc.add_table(rows=2, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Header Row
        c0 = tbl.cell(0, 0)
        set_cell_background(c0, HEX_PURPLE)
        set_cell_margins(c0, top=100, bottom=100, left=140, right=140)
        p0 = c0.paragraphs[0]
        r_time = p0.add_run(f"⏱ {section['time']}  —  {section['title']}")
        r_time.font.name = 'Helvetica'
        r_time.font.size = Pt(11)
        r_time.font.bold = True
        r_time.font.color.rgb = RGBColor(255, 255, 255)

        # Body Row
        c1 = tbl.cell(1, 0)
        set_cell_background(c1, HEX_CITRON_BG)
        set_cell_margins(c1, top=120, bottom=120, left=140, right=140)
        p1 = c1.paragraphs[0]
        
        p_act = p1.add_run(f"🎬 การกระทำบนจอ (Action / Screen Demo):\n{section['action']}\n\n")
        p_act.font.bold = True
        p_act.font.size = Pt(10.5)
        p_act.font.color.rgb = COLOR_PURPLE

        p_speech = p1.add_run(f"🗣 สคริปต์คำพูด (Presentation Speech):\n{section['speech']}")
        p_speech.font.size = Pt(10.5)
        p_speech.font.color.rgb = COLOR_DARK_TEXT

        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ==========================================
    # SECTION 2: ENGLISH PRESENTATION SCRIPT
    # ==========================================
    doc.add_page_break()
    add_heading_1("🇬🇧 Part 2: English Presentation Script (10-Minute Speech)")

    english_sections = [
        {
            "time": "00:00 - 01:30 (1.5 Mins)",
            "title": "Phase 1: Introduction & Problem Statement",
            "action": "📱 Display Main Landing Screen & App Branding",
            "speech": (
                "Good morning / afternoon everyone. Welcome to the presentation of 'Bangkok Explorer' (or Voyager) — "
                "a next-generation mobile application crafted for urban exploration and navigation across Bangkok.\n\n"
                "Traditional navigation applications focus solely on utility — getting from Point A to Point B. "
                "However, modern urban explorers desire a rich spatial experience: aesthetic design, seamless route discovery, "
                "and tangible trip memories. Our application seamlessly unifies three core components: "
                "1) An interactive map and routing engine, 2) Curated place discovery by categories, and "
                "3) A personal digital travel passport and stamp journal."
            )
        },
        {
            "time": "01:30 - 06:30 (5.0 Mins)",
            "title": "Phase 2: Core Feature Spotlight — Interactive Map & Thermal Receipt Generator",
            "action": "🗺️ Switch to Map Screen — Demo Pinning, Search, Compass Modal, Weather & Finish Journey",
            "speech": (
                "Now, let us dive directly into our flagship feature: The Interactive Map System.\n\n"
                "1. Smart Pinning & Live Search:\n"
                "Users can search for iconic Bangkok landmarks such as 'Wat Phra Kaew', 'Yaowarat', or 'Ari'. "
                "Selected places are dynamically pinned on the map with sequential badges (01, 02, 03), while calculating "
                "the real road polyline navigation path and live distance metrics.\n\n"
                "2. Live Compass & Weather Integration:\n"
                "Tapping the top-left compass button triggers an interactive digital compass displaying live cardinal orientation "
                "and coordinates. Additionally, a real-time weather modal provides instant local forecasts for smart trip planning.\n\n"
                "3. Highlight Showcase: Thermal Travel Receipt Generation:\n"
                "Once users finalize their itinerary, tapping 'Finish Journey' triggers an automated multi-step sequence:\n"
                "   • Automatic bounding box adjustment (fitToCoordinates) capturing all waypoints and polylines.\n"
                "   • High-definition 16:9 landscape map snapshot generation.\n"
                "   • A realistic thermal printer paper feeding animation outputting a retro travel receipt complete with "
                "timestamp, receipt number, itinerary list, total distance, and embedded map screenshot!\n\n"
                "Users can tap 'Print & Save' to export the receipt straight to their photo library or share it instantly on social media."
            )
        },
        {
            "time": "06:30 - 08:30 (2.0 Mins)",
            "title": "Phase 3: The Ecosystem — Explore, Journal & Personal Passport",
            "action": "🧭 Navigate across Explore Screen -> Album Screen -> Profile Passport",
            "speech": (
                "Beyond the map system, our application features a complete ecosystem:\n\n"
                "1. Explore Screen:\n"
                "Categorized exploration (Temples, Cafes, Markets, Museums) with smart search filters and instant 'Add to Trip' modal.\n\n"
                "2. Album & Travel Journal:\n"
                "A digital keepsake calendar where users collect location stamps and archive daily photo memories.\n\n"
                "3. Designer Passport:\n"
                "A personalized traveler passport card complete with official ink stamps, customized travel quotes, and shareable image export."
            )
        },
        {
            "time": "08:30 - 09:30 (1.0 Min)",
            "title": "Phase 4: Design System & Architectural Aesthetics",
            "action": "🎨 Showcase Curated Brand Palette & Typography Alignment",
            "speech": (
                "Architecturally, the user interface adheres to a curated 4-color brand design system:\n"
                "• Citron (#CAD183) — Warm background surfaces\n"
                "• Tyrian Purple (#66023C) — Primary call-to-action buttons & active highlights\n"
                "• Pistachio (#BADD7F) — Accent status badges\n"
                "• Chocolate Brown (#391D01) — High-contrast typography for maximum readability\n\n"
                "Combined with glassmorphism overlays and Cormorant Garamond / Inter typography, the app delivers a polished editorial feel."
            )
        },
        {
            "time": "09:30 - 10:00 (0.5 Min)",
            "title": "Phase 5: Conclusion & Q&A Pitch",
            "action": "🙋‍♂️ Return to Map Screen & Open Floor for Questions",
            "speech": (
                "In conclusion, 'Bangkok Explorer' transforms everyday navigation into a delightful, memorable experience. "
                "Every kilometer traveled is turned into a tangible receipt souvenir and stamp collection.\n\n"
                "Thank you for your time and attention. I am now open to any questions or feedback!"
            )
        }
    ]

    for section in english_sections:
        tbl = doc.add_table(rows=2, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        c0 = tbl.cell(0, 0)
        set_cell_background(c0, HEX_PURPLE)
        set_cell_margins(c0, top=100, bottom=100, left=140, right=140)
        p0 = c0.paragraphs[0]
        r_time = p0.add_run(f"⏱ {section['time']}  —  {section['title']}")
        r_time.font.name = 'Helvetica'
        r_time.font.size = Pt(11)
        r_time.font.bold = True
        r_time.font.color.rgb = RGBColor(255, 255, 255)

        c1 = tbl.cell(1, 0)
        set_cell_background(c1, HEX_LIGHT_BG)
        set_cell_margins(c1, top=120, bottom=120, left=140, right=140)
        p1 = c1.paragraphs[0]
        
        p_act = p1.add_run(f"🎬 Screen Action / Live Demo:\n{section['action']}\n\n")
        p_act.font.bold = True
        p_act.font.size = Pt(10.5)
        p_act.font.color.rgb = COLOR_PURPLE

        p_speech = p1.add_run(f"🗣 Speech Script:\n{section['speech']}")
        p_speech.font.size = Pt(10.5)
        p_speech.font.color.rgb = COLOR_DARK_TEXT

        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ==========================================
    # SECTION 3: Q&A PREPARATION GUIDE
    # ==========================================
    doc.add_page_break()
    add_heading_1("❓ Part 3: Q&A Quick Reference Guide (แนวทางตอบคำถามกรรมการ)")

    qa_items = [
        {
            "q": "Q1: ทำไมถึงเลือกใช้ Thermal Receipt บนแผนที่? (Why thermal receipt format?)",
            "a_th": "ตอบ: ใบเสร็จทรงสี่เหลี่ยมยาว (Thermal Receipt) ให้ความรู้สึกคลาสสิก สมจริง จับต้องได้ และมีรูปทรงที่พอดีกับการบันทึกรายการสถานที่ พร้อมรูปภาพแผนที่แนวนอน 16:9 สวยงาม เหมาะสำหรับการแชร์บน Instagram / TikTok Story ครับ",
            "a_en": "Answer: The thermal receipt aesthetic offers a nostalgic, tangible souvenir format that perfectly pairs sequential place lists with a 16:9 landscape map preview — optimized for social media sharing."
        },
        {
            "q": "Q2: แก้ไขปัญหาภาพสแนปช็อตแผนที่ระยะไกลหลุดขอบอย่างไร? (How was long-distance map cropping fixed?)",
            "a_th": "ตอบ: ใช้การรวมพิกัดหมุดและเส้นทางทั้งหมดเข้า fitToCoordinates เพิ่ม edgePadding ด้านบน-ล่างเพื่อรองรับอัตราส่วนแนวนอน และเปลี่ยนมาใช้ Native takeSnapshot (600x340) ซึ่งถ่ายได้ตรงตามอัตราส่วนของช่องใบเสร็จเป๊ะครับ",
            "a_en": "Answer: We combined all place and polyline waypoints into fitToCoordinates with custom vertical edge padding, transitioning to a native 600x340 landscape map snapshot that matches the receipt container aspect ratio."
        },
        {
            "q": "Q3: สถาปัตยกรรม UI / Color Palette มีแนวคิดอย่างไร? (What is the UX/UI color philosophy?)",
            "a_th": "ตอบ: ใช้ Palette 4 สีตามดีไซน์ซิสเต็ม (Citron, Tyrian Purple, Pistachio, Chocolate Brown) ร่วมกับ Frosted Glassmorphic Cards ช่วยให้หน้าจอมีลำดับสายตาชัดเจน อ่านง่าย และหรูหราทรงคุณค่าครับ",
            "a_en": "Answer: Built upon a strict 4-color design system paired with frosted glassmorphism, ensuring high visual contrast, structured readability, and a premium editorial aesthetic."
        }
    ]

    for item in qa_items:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(8)
        p_q.paragraph_format.space_after = Pt(2)
        r_q = p_q.add_run(item['q'])
        r_q.font.name = 'Helvetica'
        r_q.font.size = Pt(11)
        r_q.font.bold = True
        r_q.font.color.rgb = COLOR_PURPLE

        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_after = Pt(6)
        r_th = p_a.add_run(f"🇹🇭 {item['a_th']}\n")
        r_th.font.size = Pt(10)
        r_th.font.color.rgb = COLOR_DARK_TEXT
        
        r_en = p_a.add_run(f"🇬🇧 {item['a_en']}")
        r_en.font.size = Pt(10)
        r_en.font.italic = True
        r_en.font.color.rgb = COLOR_BROWN

    # Save Document
    doc.save(filename)
    print(f"Document successfully created at: {filename}")

if __name__ == '__main__':
    create_presentation_document('/Users/virgoisqb/bantitaced1691/10_Minute_Presentation_Script_Map_Focus.docx')
