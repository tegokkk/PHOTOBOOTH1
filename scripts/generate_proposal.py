# -*- coding: utf-8 -*-
"""Generate the TI EXPO 2026 proposal in DOCX and PDF formats.

The content is based on the local PHOTOBOOTH codebase and the requested TI
EXPO format: A4, Times New Roman 12 pt, margins left 4 cm and the other
margins 3 cm, cover, chapters I-V, references, and originality appendix.
"""

from pathlib import Path
from xml.sax.saxutils import escape

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    Image as RLImage,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "proposal_ti_expo_2026"
OUT.mkdir(exist_ok=True)

BLUE = "173F7A"
ORANGE = "F47A16"
LIGHT_BLUE = "EAF1FA"
LIGHT_ORANGE = "FFF1E5"
GRAY = "666666"
BLACK = "111111"


def C(hex_color):
    """ReportLab color helper that accepts six-digit hex values."""
    return colors.HexColor("#" + hex_color.lstrip("#"))

TITLE = "RIRI PHOTOBOOTH"
SUBTITLE = "Web Photobooth Kiosk untuk Pengalaman Foto Interaktif\ndan Berbagi Digital pada TI EXPO 2026"
REPO_URL = "https://github.com/tegokkk/PHOTOBOOTH1"
REPO_COMMIT = "c2d2a0a (30 Agustus 2026)"

FIGURES = [
    ("Gambar 1. Layar awal/landing screen", ROOT / "stitch_photobooth_ui_redesign" / "landing_screen_cyber_booth" / "screen.png"),
    ("Gambar 2. Layar pemilihan frame", ROOT / "stitch_photobooth_ui_redesign" / "frame_selection_cyber_booth" / "screen.png"),
    ("Gambar 3. Layar kamera dan pengambilan foto", ROOT / "stitch_photobooth_ui_redesign" / "camera_feed_cyber_booth" / "screen.png"),
    ("Gambar 4. Layar pratinjau dan export", ROOT / "stitch_photobooth_ui_redesign" / "photo_preview_export_cyber_booth" / "screen.png"),
]

REFERENCES = [
    "Del-Real, C., De Busser, E., & van den Berg, B. (2025). A systematic literature review of security and privacy by design principles, norms, and strategies for digital technologies. International Review of Law, Computers & Technology, 39(3), 374-405. https://doi.org/10.1080/13600869.2025.2457227",
    "Palmer, J. W. (2002). Web site usability, design, and performance metrics. Information Systems Research, 13(2), 151-167. https://doi.org/10.1287/isre.13.2.151.88",
    "Rahman, M. S., & Ahmed, S. M. Z. (2013). Exploring the factors influencing the usability of academic websites: A case study in a university setting. Performance Measurement and Metrics, 14(1), 26-45. https://doi.org/10.1177/0266382113482557",
    "Schaar, P. (2010). Privacy by design. Identity in the Information Society, 3, 267-274. https://doi.org/10.1007/s12394-010-0055-x",
]


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_border(cell, **kwargs):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in("w:tcBorders")
    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        if edge in kwargs:
            edge_data = kwargs.get(edge)
            tag = "w:{}".format(edge)
            element = tc_borders.find(qn(tag))
            if element is None:
                element = OxmlElement(tag)
                tc_borders.append(element)
            for key in ["val", "sz", "space", "color"]:
                if key in edge_data:
                    element.set(qn("w:{}".format(key)), str(edge_data[key]))


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_cell_text(cell, text, bold=False, color=BLACK, size=10):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run(text)
    run.bold = bold
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run()
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = " PAGE "
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char1)
    run._r.append(instr_text)
    run._r.append(fld_char2)
    run.font.name = "Times New Roman"
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor.from_string(BLUE)


def add_hyperlink(paragraph, text, url):
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), r_id)
    new_run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "0563C1")
    r_pr.append(color)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    r_pr.append(underline)
    new_run.append(r_pr)
    text_element = OxmlElement("w:t")
    text_element.text = text
    new_run.append(text_element)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)
    return hyperlink


def configure_docx(doc):
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(3)
    section.bottom_margin = Cm(3)
    section.left_margin = Cm(4)
    section.right_margin = Cm(3)
    section.header_distance = Cm(1.2)
    section.footer_distance = Cm(1.2)

    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    normal.font.size = Pt(12)
    normal.font.color.rgb = RGBColor.from_string(BLACK)
    normal.paragraph_format.line_spacing = 1.5
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    for name, size, color in [("Heading 1", 12, BLUE), ("Heading 2", 12, BLACK), ("Heading 3", 12, BLACK)]:
        style = doc.styles[name]
        style.font.name = "Times New Roman"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(color)
        style.paragraph_format.space_before = Pt(8)
        style.paragraph_format.space_after = Pt(4)
        style.paragraph_format.keep_with_next = True

    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hp.paragraph_format.space_after = Pt(0)
    r = hp.add_run("TI EXPO 2026  |  PROPOSAL INOVASI")
    r.font.name = "Times New Roman"
    r.font.size = Pt(8)
    r.font.bold = True
    r.font.color.rgb = RGBColor.from_string(BLUE)
    ppr = hp._p.get_or_add_pPr()
    p_bdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "12")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), ORANGE)
    p_bdr.append(bottom)
    ppr.append(p_bdr)

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.paragraph_format.space_before = Pt(0)
    fp.paragraph_format.space_after = Pt(0)
    add_page_number(fp)

    # Ask Word/compatible editors to refresh the TOC and PAGE fields on open.
    update_fields = OxmlElement("w:updateFields")
    update_fields.set(qn("w:val"), "true")
    doc.settings.element.append(update_fields)


def add_docx_title(doc, text, level=1):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.add_run(text)
    return p


def add_docx_body(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    if bold_prefix and text.startswith(bold_prefix):
        p.add_run(bold_prefix).bold = True
        p.add_run(text[len(bold_prefix):])
    else:
        p.add_run(text)
    return p


def add_docx_bullets(doc, items, level=0):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.left_indent = Cm(0.75 + level * 0.5)
        p.paragraph_format.first_line_indent = Cm(-0.4)
        p.add_run(item)


def add_docx_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        p.add_run(item)


def add_docx_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for i, h in enumerate(headers):
        set_cell_text(hdr.cells[i], h, bold=True, color="FFFFFF", size=10)
        set_cell_shading(hdr.cells[i], BLUE)
    for row in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            set_cell_text(cells[i], str(value), size=9)
            set_cell_shading(cells[i], "F8FAFD" if len(table.rows) % 2 == 0 else "FFFFFF")
    if widths:
        for row in table.rows:
            for i, width in enumerate(widths):
                row.cells[i].width = Cm(width)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_docx_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    r.italic = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor.from_string(GRAY)


def add_toc_field(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run()
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), 'TOC \\o "1-3" \\h \\z \\u')
    run._r.addnext(fld)
    note = doc.add_paragraph("Catatan: apabila nomor halaman belum muncul, klik kanan pada daftar isi lalu pilih Update Field.")
    note.runs[0].italic = True
    note.runs[0].font.size = Pt(9)
    note.runs[0].font.color.rgb = RGBColor.from_string(GRAY)


def build_docx():
    doc = Document()
    configure_docx(doc)

    # Cover
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run("TI EXPO 2026")
    run.bold = True
    run.font.size = Pt(18)
    run.font.color.rgb = RGBColor.from_string(BLUE)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("PROPOSAL LOMBA INOVASI TI EXPO")
    r.bold = True
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor.from_string(ORANGE)
    doc.add_paragraph().paragraph_format.space_after = Pt(28)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(TITLE)
    r.bold = True
    r.font.size = Pt(24)
    r.font.color.rgb = RGBColor.from_string(BLUE)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(SUBTITLE)
    r.bold = True
    r.font.size = Pt(13)
    doc.add_paragraph().paragraph_format.space_after = Pt(34)
    logo = doc.add_table(rows=1, cols=1)
    logo.alignment = WD_TABLE_ALIGNMENT.CENTER
    logo.autofit = False
    logo.columns[0].width = Cm(7)
    cell = logo.cell(0, 0)
    set_cell_text(cell, "[LOGO JURUSAN TEKNOLOGI INFORMASI]", bold=True, color=BLUE, size=11)
    set_cell_shading(cell, LIGHT_BLUE)
    set_cell_border(cell, top={"val": "single", "sz": 16, "color": BLUE}, bottom={"val": "single", "sz": 16, "color": ORANGE}, left={"val": "single", "sz": 16, "color": BLUE}, right={"val": "single", "sz": 16, "color": ORANGE})
    doc.add_paragraph().paragraph_format.space_after = Pt(24)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run("Disusun oleh:").bold = True
    for line in ["[NAMA TIM]", "Ketua: [NAMA KETUA] - NPM [NPM KETUA]", "Anggota: [NAMA ANGGOTA 1] - NPM [NPM]", "Anggota: [NAMA ANGGOTA 2] - NPM [NPM]", "Anggota: [NAMA ANGGOTA 3] - NPM [NPM]"]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run(line)
    doc.add_paragraph().paragraph_format.space_after = Pt(18)
    for line in ["PROGRAM STUDI [ISI SESUAI PRODI]", "JURUSAN TEKNOLOGI INFORMASI", "POLITEKNIK NEGERI LAMPUNG", "2026"]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(line)
        r.bold = True if "2026" in line else False
    doc.add_page_break()

    # Kata pengantar and lists
    add_docx_title(doc, "KATA PENGANTAR", 1)
    for para in [
        "Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa karena proposal inovasi berjudul RIRI PHOTOBOOTH: Web Photobooth Kiosk untuk Pengalaman Foto Interaktif dan Berbagi Digital pada TI EXPO 2026 ini dapat disusun. Proposal ini diajukan sebagai penjelasan mengenai gagasan, landasan teknologi, spesifikasi, mekanisme kerja, serta kesiapan produk yang akan didemonstrasikan pada pameran TI EXPO 2026.",
        "RIRI PHOTOBOOTH dikembangkan sebagai aplikasi photobooth berbasis web yang dirancang untuk penggunaan kiosk pada kegiatan pameran, acara kampus, dan event publik. Pengunjung dapat memulai sesi, memilih frame, mengambil satu atau beberapa foto, meninjau hasil, melakukan penyuntingan dasar, lalu memilih keluaran berupa cetak, download, atau tautan QR. Rancangan ini menggabungkan pengalaman interaktif, pengelolaan output digital, dan perhatian terhadap privasi foto pengunjung.",
        "Kami menyadari bahwa produk ini masih memerlukan verifikasi lapangan menggunakan perangkat kamera dan printer yang akan dipakai pada acara. Oleh karena itu, proposal ini juga memuat batasan, hasil pengujian otomatis, risiko, dan rencana penyempurnaan agar demonstrasi berlangsung terukur dan dapat dipertanggungjawabkan.",
        "Kami mengucapkan terima kasih kepada pihak-pihak yang telah mendukung proses perancangan dan pengembangan. Semoga proposal ini dapat memberikan gambaran yang jelas mengenai nilai inovasi RIRI PHOTOBOOTH dan manfaatnya bagi pengunjung maupun penyelenggara TI EXPO 2026.",
    ]:
        add_docx_body(doc, para)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.add_run("[Kota], [Tanggal] 2026\n\nTim [NAMA TIM]").bold = True
    doc.add_page_break()

    add_docx_title(doc, "DAFTAR ISI", 1)
    add_toc_field(doc)
    doc.add_page_break()

    add_docx_title(doc, "DAFTAR GAMBAR", 1)
    for caption, _ in FIGURES:
        add_docx_body(doc, caption)
    doc.add_page_break()

    add_docx_title(doc, "DAFTAR TABEL", 1)
    for caption in ["Tabel 1. Kebutuhan pengguna dan masalah yang diselesaikan", "Tabel 2. Spesifikasi teknis sistem", "Tabel 3. Alur input-proses-output", "Tabel 4. Hasil pengujian dan validasi", "Tabel 5. Rencana demonstrasi TI EXPO 2026"]:
        add_docx_body(doc, caption)
    doc.add_page_break()

    # Bab I
    add_docx_title(doc, "BAB I PENDAHULUAN", 1)
    add_docx_title(doc, "1.1 Latar Belakang dan Keresahan Masalah", 2)
    add_docx_body(doc, "Pameran teknologi tidak hanya membutuhkan produk yang dapat dijelaskan secara teoritis, tetapi juga pengalaman langsung yang mudah dipahami pengunjung. Pada kegiatan seperti TI EXPO, pengunjung biasanya berpindah dari satu stan ke stan lain dalam waktu terbatas. Media interaksi yang terlalu panjang, membutuhkan akun, atau bergantung pada proses manual berpotensi menimbulkan antrean dan mengurangi kesempatan pengunjung untuk mencoba inovasi.")
    add_docx_body(doc, "Photobooth menjadi media demonstrasi yang menarik karena hasil interaksinya dapat langsung dirasakan dan dibawa pulang. Namun, photobooth konvensional dapat menghadapi kendala berupa pengaturan frame yang terbatas, proses penggabungan foto yang tidak konsisten, pilihan output yang kurang fleksibel, serta kebutuhan operator untuk menangani cetak ulang dan masalah printer. Pengunjung juga perlu mendapatkan kejelasan mengenai bagaimana foto disimpan dan dibagikan.")
    add_docx_body(doc, "RIRI PHOTOBOOTH menawarkan solusi berupa web photobooth dengan alur kiosk: pengunjung memilih frame, menggunakan kamera browser, mengambil foto dengan countdown, melihat hasil komposit, melakukan penyesuaian sederhana, lalu memilih cetak, QR/download, atau foto ulang. Aplikasi tidak mewajibkan login pada alur pengunjung sehingga cocok untuk demonstrasi singkat. Pada sisi operator, tersedia pengelolaan frame dan print job agar kegiatan dapat dipantau.")
    add_docx_table(doc, ["Kebutuhan/Masalah", "Solusi pada RIRI PHOTOBOOTH"], [
        ["Pengunjung ingin mencoba dengan cepat tanpa membuat akun", "Alur guest/kiosk tanpa login pelanggan; sesi dibuka oleh operator."],
        ["Frame foto harus dapat menampung jumlah slot berbeda", "Frame dan FrameSlot disimpan sebagai data; mendukung satu sampai beberapa slot."],
        ["Hasil foto harus sesuai dengan preview", "Compositing dilakukan di canvas browser menggunakan koordinat slot dan asset master."],
        ["Pengunjung membutuhkan pilihan keluaran", "Tersedia preview cetak, download PNG/JPG, serta QR/share link opsional."],
        ["Foto pelanggan tidak boleh terbuka tanpa otorisasi", "Foto online disajikan melalui media endpoint dengan token guest/share dan masa berlaku link."],
    ], widths=[6.2, 8.0])
    add_docx_title(doc, "1.2 Rumusan Masalah", 2)
    add_docx_numbered(doc, [
        "Bagaimana merancang web photobooth berbasis kiosk yang dapat digunakan pengunjung dengan langkah yang singkat dan jelas?",
        "Bagaimana mengelola frame dengan satu atau beberapa slot foto agar hasil komposit konsisten dengan pratinjau?",
        "Bagaimana menyediakan output cetak dan digital yang tetap dapat dipantau ketika terjadi retry atau gangguan printer?",
        "Bagaimana menerapkan pengamanan dasar terhadap foto guest dan tautan berbagi?",
    ])
    add_docx_title(doc, "1.3 Tujuan dan Manfaat Produk", 2)
    add_docx_body(doc, "Tujuan produk:")
    add_docx_bullets(doc, [
        "Menghasilkan working prototype web photobooth yang siap didemonstrasikan pada TI EXPO 2026.",
        "Menyediakan alur foto yang ringkas mulai dari pemilihan frame sampai output.",
        "Menghasilkan komposit foto beresolusi tinggi dengan filter brightness, contrast, dan saturation.",
        "Menyediakan pilihan cetak, download, serta QR/share link sesuai kebutuhan pengunjung.",
        "Menyediakan data print job dan kontrol operator untuk mendukung kegiatan pameran.",
    ])
    add_docx_body(doc, "Manfaat produk:")
    add_docx_bullets(doc, [
        "Bagi pengunjung: memperoleh pengalaman interaktif dan kenang-kenangan digital/fisik.",
        "Bagi penyelenggara: memiliki aktivitas stan yang mudah dipahami, menarik, dan dapat mengundang interaksi.",
        "Bagi tim pengembang: menjadi media penerapan frontend, backend, pengelolaan media, keamanan, dan integrasi perangkat.",
        "Bagi institusi: menunjukkan pemanfaatan teknologi web untuk kebutuhan pameran dan layanan berbasis pengalaman.",
    ])
    add_docx_title(doc, "1.4 Batasan Masalah", 2)
    add_docx_bullets(doc, [
        "Produk dibatasi pada aplikasi web dan layanan API yang tersedia dalam repositori; perangkat fisik kamera, layar, dan printer mengikuti ketersediaan saat pameran.",
        "Kamera browser membutuhkan HTTPS atau localhost serta izin kamera dari perangkat.",
        "Cetak otomatis memerlukan print bridge lokal; tanpa bridge, aplikasi memakai dialog cetak browser.",
        "Pembayaran, jika ada dalam pelaksanaan, dilakukan oleh operator dan tidak disimpan oleh aplikasi.",
        "Admin pada kode saat ini perlu pengamanan backend dan pembatasan jaringan sebelum digunakan pada jaringan publik.",
        "Validasi lapangan 50-100 sesi simulasi, kestabilan printer, serta uji pemulihan jaringan masih menjadi tahap persiapan pameran.",
    ])
    doc.add_page_break()

    # Bab II
    add_docx_title(doc, "BAB II TINJAUAN PUSTAKA", 1)
    add_docx_title(doc, "2.1 Kajian Teori dan Landasan Teknologi", 2)
    add_docx_body(doc, "a. Kiosk dan user experience. Kiosk adalah antarmuka layanan yang dirancang untuk digunakan langsung oleh publik pada perangkat tertentu. Karena pengguna tidak selalu memiliki pengetahuan teknis, alur harus memiliki navigasi yang jelas, umpan balik yang cepat, dan langkah yang dapat dipulihkan. Kajian tentang usability website menunjukkan bahwa navigasi, interaktivitas, responsivitas, dan kepuasan pengguna saling berkaitan dalam keberhasilan sebuah website (Palmer, 2002).")
    add_docx_body(doc, "b. Aplikasi web responsif dan kamera browser. Frontend dibangun menggunakan Next.js dan React. Kamera diakses melalui MediaDevices API dengan getUserMedia, membutuhkan konteks aman berupa HTTPS atau localhost. Hook kamera menangani izin kamera, pergantian kamera, countdown/pengambilan gambar, mirror preview, serta pesan kesalahan ketika perangkat tidak tersedia.")
    add_docx_body(doc, "c. Canvas compositing. Canvas digunakan untuk menggabungkan foto dengan frame. Koordinat slot disimpan secara normalisasi agar dapat diterapkan pada berbagai ukuran asset. Foto digambar ke slot, kemudian asset frame digambar di atasnya. Asset preview dipakai untuk katalog, sedangkan master asset dipakai untuk export resolusi tinggi.")
    add_docx_body(doc, "d. REST API dan basis data relasional. Backend menggunakan Express dengan endpoint untuk frame, foto, media, share, admin, dan print. Prisma digunakan sebagai ORM pada PostgreSQL. Entitas utama terdiri atas Frame, FrameSlot, Photo, ShareLink, dan PrintJob.")
    add_docx_body(doc, "e. Privasi dan keamanan data. Foto guest tidak diperlakukan sebagai file publik langsung. Akses dikendalikan melalui guest access token atau share token, sedangkan share link memiliki masa berlaku. Pendekatan ini sejalan dengan prinsip Privacy by Design, yaitu mempertimbangkan privasi sejak perancangan sistem, bukan hanya sebagai tambahan setelah sistem selesai (Schaar, 2010; Del-Real et al., 2025).")
    add_docx_title(doc, "2.2 Kebaruan dan Nilai Inovasi", 2)
    add_docx_body(doc, "Kebaruan RIRI PHOTOBOOTH terletak pada penggabungan pengalaman photobooth fisik dengan fleksibilitas aplikasi web dalam satu alur kiosk. Produk tidak berhenti pada pengambilan gambar, tetapi menghubungkan pemilihan frame berbasis metadata, compositing di browser, export resolusi tinggi, pilihan cetak dan digital, serta kontrol akses foto.")
    add_docx_table(doc, ["Aspek", "Praktik umum", "Nilai inovasi RIRI PHOTOBOOTH"], [
        ["Interaksi", "Pengunjung mengikuti proses manual atau aplikasi yang memerlukan akun.", "Alur guest/kiosk yang singkat dan diinisiasi operator."],
        ["Kreativitas", "Frame tetap atau pilihan desain terbatas.", "Frame bersumber dari katalog dengan kategori, preview, master asset, dan jumlah slot."],
        ["Pengolahan", "Hasil bergantung pada template atau operator.", "Canvas compositing menggunakan slot terukur, rotasi, dan z-index."],
        ["Output", "Biasanya hanya cetak atau download.", "Cetak, download PNG/JPG, dan QR/share link opsional."],
        ["Privasi", "File hasil dapat tersimpan pada folder publik.", "Media endpoint, token akses, share expiry, dan retention policy."],
        ["Operasional", "Gangguan printer ditangani manual.", "Print job berstatus queued/printing/completed/failed dan dapat retry."],
    ], widths=[2.8, 5.2, 6.2])
    add_docx_body(doc, "Nilai inovasi tersebut relevan untuk pameran karena dapat dipahami melalui demonstrasi langsung: pengunjung melihat bagaimana input kamera berubah menjadi komposit visual, kemudian memilih keluaran sesuai kebutuhan. Produk juga dapat dikembangkan lebih lanjut untuk branding acara, statistik penggunaan, multiple booth, dan integrasi printer yang lebih kuat.")
    doc.add_page_break()

    # Bab III
    add_docx_title(doc, "BAB III SPESIFIKASI TEKNIS DAN GAMBARAN INOVASI", 1)
    add_docx_title(doc, "3.1 Deskripsi Produk dan Solusi Inovasi", 2)
    add_docx_body(doc, "RIRI PHOTOBOOTH adalah web photobooth berbasis browser yang dioperasikan dalam mode kiosk. Pengunjung berinteraksi melalui layar sentuh atau mouse, sedangkan operator menyiapkan kamera, frame, jaringan, dan printer. Sistem memisahkan frontend kiosk, backend API, database, dan storage media sehingga pemrosesan foto dan pengelolaan operasional dapat dikembangkan secara terpisah.")
    add_docx_body(doc, "Skenario penggunaan pada TI EXPO 2026:")
    add_docx_numbered(doc, [
        "Operator menyiapkan perangkat dan membuka aplikasi pada mode kiosk.",
        "Pengunjung memilih MULAI SESI FOTO; operator membuka sesi dengan PIN lokal yang tersedia pada antarmuka.",
        "Pengunjung memilih kategori/frame dan melihat pratinjau frame.",
        "Pengunjung menempatkan diri di depan kamera; sistem menjalankan countdown dan mengambil foto sesuai jumlah slot.",
        "Pengunjung meninjau hasil, melakukan foto ulang atau edit sederhana, lalu memilih cetak, QR/download, atau selesai.",
        "Operator memantau status print job dan melakukan retry/reprint apabila dibutuhkan.",
    ])
    add_docx_title(doc, "3.2 Spesifikasi Teknis", 2)
    add_docx_table(doc, ["Komponen", "Spesifikasi/Implementasi"], [
        ["Frontend", "Next.js 16.3.0, React 19.2.8, TypeScript, Zustand, Tailwind CSS."],
        ["Backend", "Node.js, Express 5.2.1, REST API, rate limit, request ID, CORS."],
        ["Database", "PostgreSQL dengan Prisma ORM; model Frame, FrameSlot, Photo, ShareLink, PrintJob."],
        ["Storage", "S3-compatible object storage melalui AWS SDK; mendukung Cloudflare R2/Backblaze B2, dengan fallback lokal untuk pengujian."],
        ["Kamera", "MediaDevices/getUserMedia, resolusi ideal 1920x1080, mirror preview, switch camera, error recovery."],
        ["Compositing", "HTML Canvas; slot normalisasi x/y/width/height, rotasi, z-index, asset master, PNG/JPG."],
        ["Output digital", "Download lokal, QR/share link dengan token dan expiry default 7 hari."],
        ["Cetak", "Browser print fallback; optional local print bridge, print queue, copy count 1-3, retry status."],
        ["Privasi", "Foto tidak public by default; akses melalui token; ukuran upload dibatasi 5 MB dan validasi magic bytes."],
        ["Deployment", "Frontend dapat dideploy ke platform Next.js/Vercel; backend memakai environment variable dan PostgreSQL production."],
    ], widths=[4.0, 10.0])
    add_docx_title(doc, "3.3 Cara Kerja dan Mekanisme Sistem", 2)
    add_docx_table(doc, ["Tahap", "Input", "Proses", "Output"], [
        ["1. Mulai sesi", "Tekan tombol + PIN operator", "Reset state dan membuka sesi guest", "Sesi foto baru"],
        ["2. Pilih frame", "Katalog frame/kategori", "API mengirim frame dan slot; UI memfilter kategori", "Frame terpilih"],
        ["3. Ambil foto", "Stream kamera", "Countdown, capture JPEG, mirror untuk kamera depan", "Foto per slot"],
        ["4. Susun hasil", "Foto + frame + filter", "Canvas menggambar foto pada slot lalu frame di atasnya", "Komposit pratinjau/export"],
        ["5. Simpan opsional", "Data URL komposit", "Validasi MIME/magic bytes, batas ukuran, token guest, idempotency", "Photo record + media URL"],
        ["6. Bagikan", "Photo ID + token", "Buat share token, expiry, QR, dan endpoint media", "QR/share link"],
        ["7. Cetak", "Komposit + jumlah copy", "Buat print job; kirim ke bridge atau dialog print browser", "Status queued/printing/completed/failed"],
        ["8. Selesai", "Tombol selesai/sesi baru", "Reset state dan hentikan stream kamera", "Kembali ke standby"],
    ], widths=[2.5, 3.6, 5.2, 2.7])
    add_docx_title(doc, "3.4 Target Pengguna dan Sasaran Implementasi", 2)
    add_docx_table(doc, ["Target", "Kebutuhan", "Bentuk implementasi"], [
        ["Pengunjung TI EXPO", "Interaksi singkat, hasil menarik, tidak membutuhkan akun", "Mode guest, UI kiosk, frame visual, output cetak/QR."],
        ["Operator stan", "Mengatur sesi, memantau cetak, mengatasi error", "PIN lokal, dashboard admin, print queue, retry/reprint."],
        ["Penyelenggara", "Aktivitas stan menarik dan mudah dipresentasikan", "Demo 2-3 menit per sesi dan branding frame sesuai acara."],
        ["Tim pengembang", "Media uji penerapan TI", "Frontend, API, database, storage, keamanan, dan deployment."],
    ], widths=[3.3, 5.1, 5.6])
    add_docx_body(doc, "Untuk pameran, sasaran implementasi utama adalah satu booth dengan satu perangkat kiosk dan satu operator. Jika perangkat tambahan tersedia, arsitektur dapat diperluas menjadi beberapa kiosk yang berbagi API, database, dan storage. Print bridge ditempatkan pada jaringan lokal agar pengiriman ke printer tidak bergantung pada kemampuan browser mengakses USB secara langsung.")
    doc.add_page_break()

    # Bab IV
    add_docx_title(doc, "BAB IV HASIL UJI COBA DAN KESIAPAN PRODUK", 1)
    add_docx_title(doc, "4.1 Hasil Pengujian Produk/Sistem", 2)
    add_docx_body(doc, "Pengujian awal dilakukan pada source code lokal yang menjadi dasar proposal. Hasil berikut menunjukkan kesiapan software, bukan pengganti uji kamera, jaringan, atau printer fisik di lokasi pameran.")
    add_docx_table(doc, ["Jenis pengujian", "Hasil", "Catatan"], [
        ["Frontend production build", "LULUS", "Next.js berhasil membuat optimized production build; route utama, admin, share, dan token terdeteksi."],
        ["Frontend lint", "LULUS dengan 20 warning", "Tidak ada error lint; warning dominan terkait penggunaan img dan custom font."],
        ["Backend unit test", "17/18 test passed", "3 test suite lulus; 1 test privacy gagal dan 1 suite auth tidak dapat dimuat karena modul middleware tidak ditemukan."],
        ["Validasi upload", "Tercakup pada test", "Menguji MIME, magic bytes, ukuran maksimal 5 MB, dimensi, dan idempotency."],
        ["Validasi share/privacy", "Sebagian tercakup", "Ada test akses token, share expiry, dan media URL; satu skenario guest token masih perlu diperbaiki."],
        ["Uji perangkat/printer", "BELUM DIVERIFIKASI LAPANGAN", "Perlu uji pada perangkat target, HTTPS, kamera, printer, offline, retry, dan 50-100 sesi simulasi."],
    ], widths=[4.2, 3.0, 6.8])
    add_docx_body(doc, "Bukti visual rancangan antarmuka/prototipe yang tersedia pada repository ditampilkan berikut. Tangkapan layar digunakan untuk mendukung gambaran alur dan perlu dibaca sebagai bukti desain/working prototype, bukan klaim bahwa seluruh perangkat eksternal sudah diuji di lokasi TI EXPO.")
    for caption, path in FIGURES:
        if path.exists():
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.add_run().add_picture(str(path), width=Cm(12.5))
            add_docx_caption(doc, caption)
    add_docx_title(doc, "4.2 Status Kesiapan Produk (Working Prototype)", 2)
    add_docx_body(doc, "Berdasarkan fitur yang tersedia, build production yang berhasil, lint tanpa error, serta pengujian backend yang masih menyisakan perbaikan, RIRI PHOTOBOOTH berada pada tingkat kesiapan sekitar 85% untuk demonstrasi terkontrol. Fitur utama alur pengunjung sudah tersedia, tetapi kesiapan penggunaan berbayar atau tanpa pengawasan belum dapat dinyatakan final sebelum pengujian perangkat dan perbaikan backend berikut diselesaikan.")
    add_docx_table(doc, ["Area", "Status", "Tindak lanjut sebelum pameran"], [
        ["Alur kiosk dan UI", "Siap demonstrasi", "Kunci browser pada mode kiosk dan pastikan reset sesi."],
        ["Kamera", "Siap secara software", "Verifikasi izin kamera, HTTPS, pencahayaan, resolusi, dan pergantian kamera."],
        ["Frame/compositing", "Siap secara software", "Uji semua frame 1, 2, 3, 4, dan 6 slot; cocokkan preview dengan hasil cetak."],
        ["Cetak", "Fallback tersedia", "Pasang dan uji print bridge + printer; uji offline, kertas habis, retry, dan reprint."],
        ["QR/download", "Tersedia", "Uji akses dari ponsel pengunjung dan expiry link."],
        ["Privasi", "Baseline tersedia", "Perbaiki test guest token; pastikan storage bucket dan CORS production benar."],
        ["Admin", "Perlu hardening", "Jangan membuka endpoint admin ke jaringan publik tanpa autentikasi backend yang memadai."],
        ["Dokumentasi/deployment", "Perlu sinkronisasi", "Samakan dokumentasi storage dengan konfigurasi S3-compatible R2/B2 yang digunakan kode saat ini."],
    ], widths=[3.7, 3.0, 7.3])
    add_docx_title(doc, "4.3 Rencana Demonstrasi TI EXPO 2026", 2)
    add_docx_table(doc, ["Komponen", "Rencana"], [
        ["Durasi sesi", "Sekitar 2-3 menit per kelompok pengunjung, bergantung jumlah slot frame."],
        ["Perangkat", "Laptop/iPad/PC sebagai kiosk, webcam atau kamera internal, monitor opsional, dan printer foto opsional."],
        ["Peran operator", "Membuka sesi, membantu pose, memantau printer, dan mengarahkan QR/download."],
        ["Alur demo", "Pilih frame -> ambil foto -> review/filter -> cetak atau QR -> reset sesi."],
        ["Rencana cadangan", "Jika jaringan atau printer bermasalah, demo tetap menggunakan export/download lokal dan dialog print browser."],
        ["Indikator keberhasilan", "Sesi dapat selesai tanpa foto tertukar, hasil komposit sesuai preview, dan pengunjung memahami output."],
    ], widths=[4.0, 10.0])
    doc.add_page_break()

    # Bab V
    add_docx_title(doc, "BAB V PENUTUP", 1)
    add_docx_title(doc, "5.1 Kesimpulan", 2)
    add_docx_body(doc, "RIRI PHOTOBOOTH merupakan inovasi web photobooth berbasis kiosk yang mengubah proses pengambilan foto menjadi pengalaman interaktif dan terarah. Produk menyediakan pemilihan frame, dukungan multi-slot, kamera browser, countdown, compositing canvas, filter dasar, export, QR/download, dan alur cetak dengan print queue. Pemisahan frontend, backend API, database, dan storage membuat sistem cukup fleksibel untuk dikembangkan pada kegiatan pameran maupun event lainnya.")
    add_docx_body(doc, "Hasil pemeriksaan menunjukkan frontend berhasil dibuild dan dilint tanpa error, sedangkan backend telah memiliki pengujian untuk upload, privacy, share, dan frame dengan satu skenario privacy yang masih perlu diperbaiki serta satu suite auth yang belum dapat dijalankan. Dengan demikian, produk layak diposisikan sebagai working prototype untuk demonstrasi terkontrol. Penyelesaian uji kamera/printer, perbaikan pengujian backend, sinkronisasi konfigurasi storage, dan hardening admin menjadi prioritas sebelum digunakan pada operasional tanpa pengawasan.")
    add_docx_body(doc, "Melalui TI EXPO 2026, RIRI PHOTOBOOTH diharapkan dapat menunjukkan bahwa teknologi web tidak hanya digunakan untuk menyajikan informasi, tetapi juga dapat menciptakan pengalaman langsung yang menyenangkan, mudah digunakan, dan memperhatikan pengelolaan data digital pengunjung.")
    doc.add_page_break()

    add_docx_title(doc, "DAFTAR PUSTAKA", 1)
    for i, ref in enumerate(REFERENCES, 1):
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(0.75)
        p.paragraph_format.first_line_indent = Cm(-0.75)
        p.add_run(f"{i}. {ref}")
    p = doc.add_paragraph()
    p.add_run("Sumber implementasi produk: ").bold = True
    add_hyperlink(p, REPO_URL, REPO_URL)
    p.add_run(f" (versi kode yang ditelaah: {REPO_COMMIT}).")
    doc.add_page_break()

    add_docx_title(doc, "LAMPIRAN", 1)
    add_docx_title(doc, "Lampiran 1. Surat Pernyataan Orisinalitas", 2)
    add_docx_body(doc, "Kami yang bertanda tangan di bawah ini menyatakan bahwa proposal dan produk inovasi RIRI PHOTOBOOTH merupakan hasil karya tim yang kami susun dan kembangkan dengan itikad baik. Setiap sumber teori, dokumentasi, atau referensi dari pihak lain telah dicantumkan pada daftar pustaka. Kami bersedia menerima konsekuensi sesuai ketentuan TI EXPO 2026 apabila pernyataan ini terbukti tidak benar.")
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    add_docx_table(doc, ["No.", "Nama", "NPM", "Tanda tangan"], [
        ["1", "[Nama Ketua Tim]", "[NPM]", "________________"],
        ["2", "[Nama Anggota 1]", "[NPM]", "________________"],
        ["3", "[Nama Anggota 2]", "[NPM]", "________________"],
        ["4", "[Nama Anggota 3]", "[NPM]", "________________"],
    ], widths=[1.0, 6.0, 3.0, 4.0])
    doc.add_paragraph().paragraph_format.space_after = Pt(24)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.add_run("[Kota], [Tanggal] 2026\nKetua Tim,\n\n\n[NAMA KETUA TIM]\nNPM [NPM KETUA]").bold = True
    doc.add_page_break()

    # Additional implementation notes are useful for the team but remain in the proposal appendix.
    add_docx_title(doc, "Lampiran 2. Checklist Persiapan Pameran", 2)
    add_docx_bullets(doc, [
        "[ ] Mengisi nama tim, nama anggota, NPM, program studi, kota, tanggal, dan logo jurusan.",
        "[ ] Menetapkan perangkat kamera, perangkat kiosk, printer, ukuran kertas, dan layout booth.",
        "[ ] Menjalankan aplikasi melalui HTTPS/localhost dan menguji izin kamera pada perangkat target.",
        "[ ] Menguji setiap frame dengan jumlah slot yang benar dan mencocokkan preview dengan export/cetak.",
        "[ ] Memasang print bridge jika memerlukan cetak otomatis; menyiapkan dialog print browser sebagai fallback.",
        "[ ] Menjalankan simulasi minimal 50 sesi dan mencatat waktu sesi, error, serta keberhasilan output.",
        "[ ] Memperbaiki test guest token dan memastikan suite auth dapat dijalankan.",
        "[ ] Mengunci akses admin dan memastikan secret tidak masuk ke frontend atau repository.",
        "[ ] Menyiapkan backup frame, konfigurasi environment, kabel, kertas, dan prosedur reset sesi.",
    ])
    doc.core_properties.title = f"{TITLE} - Proposal TI EXPO 2026"
    doc.core_properties.subject = "Proposal inovasi teknologi informasi"
    doc.core_properties.author = "[NAMA TIM]"
    doc.core_properties.comments = "Dibuat dari source code lokal PHOTOBOOTH; isi identitas tim masih berupa placeholder."
    path = OUT / "TIEXPO2026_PRODI_NAMA_TIM_RIRI_PHOTOBOOTH.docx"
    doc.save(path)
    return path


class ProposalDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, pagesize=A4, **kwargs)
        frame = Frame(4 * cm, 3 * cm, A4[0] - 7 * cm, A4[1] - 6 * cm, id="normal")
        self.addPageTemplates([PageTemplate(id="proposal", frames=[frame], onPage=draw_page_decorations)])

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name in ("PDFHeading1", "PDFHeading2"):
            level = 0 if flowable.style.name == "PDFHeading1" else 1
            text = flowable.getPlainText()
            key = "h{}-{}".format(level, abs(hash(text)))
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=level, closed=False)
            self.notify("TOCEntry", (level, text, self.page))


def draw_page_decorations(canvas, doc):
    canvas.saveState()
    width, height = A4
    # Decorative lines inspired by the supplied TI EXPO guidebook.
    canvas.setStrokeColor(C(BLUE))
    canvas.setLineWidth(4)
    canvas.line(0.55 * cm, 0.6 * cm, width / 2 - 0.05 * cm, 0.6 * cm)
    canvas.line(width / 2 + 0.05 * cm, height - 0.6 * cm, width - 0.55 * cm, height - 0.6 * cm)
    canvas.line(0.55 * cm, height - 0.6 * cm, width / 2 - 0.05 * cm, height - 0.6 * cm)
    canvas.line(width / 2 + 0.05 * cm, 0.6 * cm, width - 0.55 * cm, 0.6 * cm)
    canvas.setStrokeColor(C(ORANGE))
    canvas.line(width / 2 + 0.05 * cm, 0.6 * cm, width - 0.55 * cm, 0.6 * cm)
    canvas.line(width / 2 + 0.05 * cm, height - 0.6 * cm, width - 0.55 * cm, height - 0.6 * cm)
    canvas.setFillColor(C(BLUE))
    canvas.rect(0.55 * cm, 0.85 * cm, 0.16 * cm, 0.16 * cm, fill=1, stroke=0)
    canvas.rect(0.85 * cm, 1.15 * cm, 0.10 * cm, 0.10 * cm, fill=1, stroke=0)
    canvas.setFillColor(C(ORANGE))
    canvas.rect(width - 0.95 * cm, 1.0 * cm, 0.16 * cm, 0.16 * cm, fill=1, stroke=0)
    canvas.rect(width - 0.70 * cm, 1.35 * cm, 0.10 * cm, 0.10 * cm, fill=1, stroke=0)
    canvas.setFont("TimesNewRoman", 9)
    canvas.setFillColor(C(BLUE))
    canvas.drawCentredString(width / 2, 1.25 * cm, str(doc.page))
    canvas.restoreState()


def register_pdf_fonts():
    font_dir = Path("C:/Windows/Fonts")
    regular = font_dir / "times.ttf"
    bold = font_dir / "timesbd.ttf"
    italic = font_dir / "timesi.ttf"
    bold_italic = font_dir / "timesbi.ttf"
    if all(p.exists() for p in (regular, bold, italic, bold_italic)):
        pdfmetrics.registerFont(TTFont("TimesNewRoman", str(regular)))
        pdfmetrics.registerFont(TTFont("TimesNewRoman-Bold", str(bold)))
        pdfmetrics.registerFont(TTFont("TimesNewRoman-Italic", str(italic)))
        pdfmetrics.registerFont(TTFont("TimesNewRoman-BoldItalic", str(bold_italic)))
        pdfmetrics.registerFontFamily("TimesNewRoman", normal="TimesNewRoman", bold="TimesNewRoman-Bold", italic="TimesNewRoman-Italic", boldItalic="TimesNewRoman-BoldItalic")
    else:
        pdfmetrics.registerFontFamily("Times-Roman", normal="Times-Roman", bold="Times-Bold", italic="Times-Italic", boldItalic="Times-BoldItalic")
        return False
    return True


def pdf_styles():
    font = "TimesNewRoman" if "TimesNewRoman" in pdfmetrics.getRegisteredFontNames() else "Times-Roman"
    bold = "TimesNewRoman-Bold" if "TimesNewRoman-Bold" in pdfmetrics.getRegisteredFontNames() else "Times-Bold"
    italic = "TimesNewRoman-Italic" if "TimesNewRoman-Italic" in pdfmetrics.getRegisteredFontNames() else "Times-Italic"
    return {
        "body": ParagraphStyle("PDFBody", fontName=font, fontSize=11, leading=16, alignment=TA_JUSTIFY, textColor=C(BLACK), spaceAfter=6),
        "body_left": ParagraphStyle("PDFBodyLeft", parent=ParagraphStyle("tmp", fontName=font, fontSize=11, leading=16), alignment=TA_LEFT, textColor=C(BLACK), spaceAfter=6),
        "h1": ParagraphStyle("PDFHeading1", fontName=bold, fontSize=12, leading=16, alignment=TA_LEFT, textColor=C(BLUE), spaceBefore=8, spaceAfter=6, keepWithNext=True),
        "h2": ParagraphStyle("PDFHeading2", fontName=bold, fontSize=12, leading=16, alignment=TA_LEFT, textColor=C(BLACK), spaceBefore=8, spaceAfter=5, keepWithNext=True),
        "cover_top": ParagraphStyle("CoverTop", fontName=bold, fontSize=16, leading=20, alignment=TA_CENTER, textColor=C(BLUE), spaceAfter=5),
        "cover_orange": ParagraphStyle("CoverOrange", fontName=bold, fontSize=13, leading=17, alignment=TA_CENTER, textColor=C(ORANGE), spaceAfter=24),
        "cover_title": ParagraphStyle("CoverTitle", fontName=bold, fontSize=24, leading=28, alignment=TA_CENTER, textColor=C(BLUE), spaceAfter=8),
        "cover_sub": ParagraphStyle("CoverSub", fontName=bold, fontSize=12, leading=17, alignment=TA_CENTER, textColor=C(BLACK), spaceAfter=24),
        "center": ParagraphStyle("Center", fontName=font, fontSize=11, leading=16, alignment=TA_CENTER, textColor=C(BLACK), spaceAfter=4),
        "caption": ParagraphStyle("Caption", fontName=italic, fontSize=9, leading=12, alignment=TA_CENTER, textColor=C(GRAY), spaceAfter=8),
        "small": ParagraphStyle("Small", fontName=font, fontSize=9, leading=12, alignment=TA_LEFT, textColor=C(BLACK), spaceAfter=3),
        "toc": ParagraphStyle("TOC", fontName=font, fontSize=11, leading=16, leftIndent=0, textColor=C(BLACK)),
    }


def P(text, style, rich=False):
    return Paragraph(text if rich else escape(text).replace("\n", "<br/>") , style)


def bullet_flowables(items, styles):
    out = []
    for item in items:
        out.append(Paragraph("- " + escape(item), styles["body"]))
    return out


def numbered_flowables(items, styles):
    out = []
    for i, item in enumerate(items, 1):
        out.append(Paragraph(f"{i}. {escape(item)}", styles["body"]))
    return out


def pdf_table(headers, rows, styles, col_widths):
    header_style = ParagraphStyle(
        "PDFTableHeader",
        parent=styles["small"],
        fontName="TimesNewRoman-Bold" if "TimesNewRoman-Bold" in pdfmetrics.getRegisteredFontNames() else "Times-Bold",
        textColor=colors.white,
    )
    data = [[P(h, header_style, rich=False) for h in headers]]
    for row in rows:
        data.append([P(str(value), styles["small"], rich=False) for value in row])
    t = Table(data, colWidths=[w * cm for w in col_widths], repeatRows=1, hAlign="LEFT")
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), C(BLUE)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.35, C("A7B5C6")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for r in range(1, len(data)):
        cmds.append(("BACKGROUND", (0, r), (-1, r), C("F8FAFD" if r % 2 else "FFFFFF")))
    t.setStyle(TableStyle(cmds))
    return t


def figure_flowable(path, caption, styles):
    if not path.exists():
        return [P(f"{caption} (file gambar tidak ditemukan)", styles["caption"])]
    image = RLImage(str(path))
    max_w, max_h = 12.5 * cm, 7.3 * cm
    ratio = min(max_w / image.imageWidth, max_h / image.imageHeight, 1.0)
    image.drawWidth = image.imageWidth * ratio
    image.drawHeight = image.imageHeight * ratio
    return [image, P(caption, styles["caption"])]


def build_pdf():
    register_pdf_fonts()
    styles = pdf_styles()
    path = OUT / "TIEXPO2026_PRODI_NAMA_TIM_RIRI_PHOTOBOOTH.pdf"
    doc = ProposalDocTemplate(str(path), title=f"{TITLE} - Proposal TI EXPO 2026", author="[NAMA TIM]", leftMargin=4 * cm, rightMargin=3 * cm, topMargin=3 * cm, bottomMargin=3 * cm)
    story = []

    # Cover
    story += [Spacer(1, 1.0 * cm), P("TI EXPO 2026", styles["cover_top"]), P("PROPOSAL LOMBA INOVASI TI EXPO", styles["cover_orange"]), Spacer(1, 0.5 * cm), P(TITLE, styles["cover_title"]), P(SUBTITLE.replace("\n", "<br/>"), styles["cover_sub"], rich=True)]
    logo = Table([[P("[LOGO JURUSAN TEKNOLOGI INFORMASI]", ParagraphStyle("logo", parent=styles["center"], fontName="TimesNewRoman-Bold" if "TimesNewRoman-Bold" in pdfmetrics.getRegisteredFontNames() else "Times-Bold", textColor=C(BLUE)))]], colWidths=[7 * cm], rowHeights=[1.3 * cm], hAlign="CENTER")
    logo.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), C(LIGHT_BLUE)), ("BOX", (0, 0), (-1, -1), 1.3, C(BLUE)), ("LINEBELOW", (0, 0), (-1, -1), 2, C(ORANGE)), ("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))
    story += [logo, Spacer(1, 1.0 * cm), P("Disusun oleh:", styles["center"])]
    for line in ["[NAMA TIM]", "Ketua: [NAMA KETUA] - NPM [NPM KETUA]", "Anggota: [NAMA ANGGOTA 1] - NPM [NPM]", "Anggota: [NAMA ANGGOTA 2] - NPM [NPM]", "Anggota: [NAMA ANGGOTA 3] - NPM [NPM]"]:
        story.append(P(line, styles["center"]))
    story += [Spacer(1, 0.7 * cm), P("PROGRAM STUDI [ISI SESUAI PRODI]", styles["center"]), P("JURUSAN TEKNOLOGI INFORMASI", styles["center"]), P("POLITEKNIK NEGERI LAMPUNG", styles["center"]), P("2026", styles["center"]), PageBreak()]

    def h1(text):
        story.append(P(text, styles["h1"]))

    def h2(text):
        story.append(P(text, styles["h2"]))

    def body(text):
        story.append(P(text, styles["body"]))

    def bullets(items):
        story.extend(bullet_flowables(items, styles))

    def numbered(items):
        story.extend(numbered_flowables(items, styles))

    h1("KATA PENGANTAR")
    for para in [
        "Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa karena proposal inovasi berjudul RIRI PHOTOBOOTH: Web Photobooth Kiosk untuk Pengalaman Foto Interaktif dan Berbagi Digital pada TI EXPO 2026 ini dapat disusun. Proposal ini diajukan sebagai penjelasan mengenai gagasan, landasan teknologi, spesifikasi, mekanisme kerja, serta kesiapan produk yang akan didemonstrasikan pada pameran TI EXPO 2026.",
        "RIRI PHOTOBOOTH dikembangkan sebagai aplikasi photobooth berbasis web yang dirancang untuk penggunaan kiosk pada kegiatan pameran, acara kampus, dan event publik. Pengunjung dapat memulai sesi, memilih frame, mengambil satu atau beberapa foto, meninjau hasil, melakukan penyuntingan dasar, lalu memilih keluaran berupa cetak, download, atau tautan QR. Rancangan ini menggabungkan pengalaman interaktif, pengelolaan output digital, dan perhatian terhadap privasi foto pengunjung.",
        "Kami menyadari bahwa produk ini masih memerlukan verifikasi lapangan menggunakan perangkat kamera dan printer yang akan dipakai pada acara. Oleh karena itu, proposal ini juga memuat batasan, hasil pengujian otomatis, risiko, dan rencana penyempurnaan agar demonstrasi berlangsung terukur dan dapat dipertanggungjawabkan.",
        "Kami mengucapkan terima kasih kepada pihak-pihak yang telah mendukung proses perancangan dan pengembangan. Semoga proposal ini dapat memberikan gambaran yang jelas mengenai nilai inovasi RIRI PHOTOBOOTH dan manfaatnya bagi pengunjung maupun penyelenggara TI EXPO 2026.",
    ]:
        body(para)
    story += [Spacer(1, 0.5 * cm), P("[Kota], [Tanggal] 2026<br/><br/>Tim [NAMA TIM]", styles["body_left"], rich=True), PageBreak()]

    h1("DAFTAR ISI")
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle("TOC0", fontName=styles["toc"].fontName, fontSize=11, leading=16, leftIndent=0, firstLineIndent=0), ParagraphStyle("TOC1", fontName=styles["toc"].fontName, fontSize=10, leading=14, leftIndent=18, firstLineIndent=0)]
    story.append(toc)
    story += [P("Daftar isi pada PDF dibuat otomatis. Pada DOCX, gunakan Update Field jika nomor halaman belum tampil.", styles["caption"]), PageBreak()]
    h1("DAFTAR GAMBAR")
    for caption, _ in FIGURES:
        body(caption)
    story.append(PageBreak())
    h1("DAFTAR TABEL")
    for caption in ["Tabel 1. Kebutuhan pengguna dan masalah yang diselesaikan", "Tabel 2. Spesifikasi teknis sistem", "Tabel 3. Alur input-proses-output", "Tabel 4. Hasil pengujian dan validasi", "Tabel 5. Rencana demonstrasi TI EXPO 2026"]:
        body(caption)
    story.append(PageBreak())

    h1("BAB I PENDAHULUAN")
    h2("1.1 Latar Belakang dan Keresahan Masalah")
    body("Pameran teknologi tidak hanya membutuhkan produk yang dapat dijelaskan secara teoritis, tetapi juga pengalaman langsung yang mudah dipahami pengunjung. Pada kegiatan seperti TI EXPO, pengunjung biasanya berpindah dari satu stan ke stan lain dalam waktu terbatas. Media interaksi yang terlalu panjang, membutuhkan akun, atau bergantung pada proses manual berpotensi menimbulkan antrean dan mengurangi kesempatan pengunjung untuk mencoba inovasi.")
    body("Photobooth menjadi media demonstrasi yang menarik karena hasil interaksinya dapat langsung dirasakan dan dibawa pulang. Namun, photobooth konvensional dapat menghadapi kendala berupa pengaturan frame yang terbatas, proses penggabungan foto yang tidak konsisten, pilihan output yang kurang fleksibel, serta kebutuhan operator untuk menangani cetak ulang dan masalah printer. Pengunjung juga perlu mendapatkan kejelasan mengenai bagaimana foto disimpan dan dibagikan.")
    body("RIRI PHOTOBOOTH menawarkan solusi berupa web photobooth dengan alur kiosk: pengunjung memilih frame, menggunakan kamera browser, mengambil foto dengan countdown, melihat hasil komposit, melakukan penyesuaian sederhana, lalu memilih cetak, QR/download, atau foto ulang. Aplikasi tidak mewajibkan login pada alur pengunjung sehingga cocok untuk demonstrasi singkat. Pada sisi operator, tersedia pengelolaan frame dan print job agar kegiatan dapat dipantau.")
    story.append(pdf_table(["Kebutuhan/Masalah", "Solusi pada RIRI PHOTOBOOTH"], [["Pengunjung ingin mencoba dengan cepat tanpa membuat akun", "Alur guest/kiosk tanpa login pelanggan; sesi dibuka oleh operator."], ["Frame foto harus dapat menampung jumlah slot berbeda", "Frame dan FrameSlot disimpan sebagai data; mendukung satu sampai beberapa slot."], ["Hasil foto harus sesuai dengan preview", "Compositing dilakukan di canvas browser menggunakan koordinat slot dan asset master."], ["Pengunjung membutuhkan pilihan keluaran", "Tersedia preview cetak, download PNG/JPG, serta QR/share link opsional."], ["Foto pelanggan tidak boleh terbuka tanpa otorisasi", "Foto online disajikan melalui media endpoint dengan token guest/share dan masa berlaku link."]], styles, [6.2, 8.0]))
    h2("1.2 Rumusan Masalah")
    numbered(["Bagaimana merancang web photobooth berbasis kiosk yang dapat digunakan pengunjung dengan langkah yang singkat dan jelas?", "Bagaimana mengelola frame dengan satu atau beberapa slot foto agar hasil komposit konsisten dengan pratinjau?", "Bagaimana menyediakan output cetak dan digital yang tetap dapat dipantau ketika terjadi retry atau gangguan printer?", "Bagaimana menerapkan pengamanan dasar terhadap foto guest dan tautan berbagi?"])
    h2("1.3 Tujuan dan Manfaat Produk")
    body("Tujuan produk:")
    bullets(["Menghasilkan working prototype web photobooth yang siap didemonstrasikan pada TI EXPO 2026.", "Menyediakan alur foto yang ringkas mulai dari pemilihan frame sampai output.", "Menghasilkan komposit foto beresolusi tinggi dengan filter brightness, contrast, dan saturation.", "Menyediakan pilihan cetak, download, serta QR/share link sesuai kebutuhan pengunjung.", "Menyediakan data print job dan kontrol operator untuk mendukung kegiatan pameran."])
    body("Manfaat produk:")
    bullets(["Bagi pengunjung: memperoleh pengalaman interaktif dan kenang-kenangan digital/fisik.", "Bagi penyelenggara: memiliki aktivitas stan yang mudah dipahami, menarik, dan dapat mengundang interaksi.", "Bagi tim pengembang: menjadi media penerapan frontend, backend, pengelolaan media, keamanan, dan integrasi perangkat.", "Bagi institusi: menunjukkan pemanfaatan teknologi web untuk kebutuhan pameran dan layanan berbasis pengalaman."])
    h2("1.4 Batasan Masalah")
    bullets(["Produk dibatasi pada aplikasi web dan layanan API yang tersedia dalam repositori; perangkat fisik kamera, layar, dan printer mengikuti ketersediaan saat pameran.", "Kamera browser membutuhkan HTTPS atau localhost serta izin kamera dari perangkat.", "Cetak otomatis memerlukan print bridge lokal; tanpa bridge, aplikasi memakai dialog cetak browser.", "Pembayaran, jika ada dalam pelaksanaan, dilakukan oleh operator dan tidak disimpan oleh aplikasi.", "Admin pada kode saat ini perlu pengamanan backend dan pembatasan jaringan sebelum digunakan pada jaringan publik.", "Validasi lapangan 50-100 sesi simulasi, kestabilan printer, serta uji pemulihan jaringan masih menjadi tahap persiapan pameran."])
    story.append(PageBreak())

    h1("BAB II TINJAUAN PUSTAKA")
    h2("2.1 Kajian Teori dan Landasan Teknologi")
    body("a. Kiosk dan user experience. Kiosk adalah antarmuka layanan yang dirancang untuk digunakan langsung oleh publik pada perangkat tertentu. Karena pengguna tidak selalu memiliki pengetahuan teknis, alur harus memiliki navigasi yang jelas, umpan balik yang cepat, dan langkah yang dapat dipulihkan. Kajian tentang usability website menunjukkan bahwa navigasi, interaktivitas, responsivitas, dan kepuasan pengguna saling berkaitan dalam keberhasilan sebuah website (Palmer, 2002).")
    body("b. Aplikasi web responsif dan kamera browser. Frontend dibangun menggunakan Next.js dan React. Kamera diakses melalui MediaDevices API dengan getUserMedia, membutuhkan konteks aman berupa HTTPS atau localhost. Hook kamera menangani izin kamera, pergantian kamera, countdown/pengambilan gambar, mirror preview, serta pesan kesalahan ketika perangkat tidak tersedia.")
    body("c. Canvas compositing. Canvas digunakan untuk menggabungkan foto dengan frame. Koordinat slot disimpan secara normalisasi agar dapat diterapkan pada berbagai ukuran asset. Foto digambar ke slot, kemudian asset frame digambar di atasnya. Asset preview dipakai untuk katalog, sedangkan master asset dipakai untuk export resolusi tinggi.")
    body("d. REST API dan basis data relasional. Backend menggunakan Express dengan endpoint untuk frame, foto, media, share, admin, dan print. Prisma digunakan sebagai ORM pada PostgreSQL. Entitas utama terdiri atas Frame, FrameSlot, Photo, ShareLink, dan PrintJob.")
    body("e. Privasi dan keamanan data. Foto guest tidak diperlakukan sebagai file publik langsung. Akses dikendalikan melalui guest access token atau share token, sedangkan share link memiliki masa berlaku. Pendekatan ini sejalan dengan prinsip Privacy by Design, yaitu mempertimbangkan privasi sejak perancangan sistem, bukan hanya sebagai tambahan setelah sistem selesai (Schaar, 2010; Del-Real et al., 2025).")
    h2("2.2 Kebaruan dan Nilai Inovasi")
    body("Kebaruan RIRI PHOTOBOOTH terletak pada penggabungan pengalaman photobooth fisik dengan fleksibilitas aplikasi web dalam satu alur kiosk. Produk tidak berhenti pada pengambilan gambar, tetapi menghubungkan pemilihan frame berbasis metadata, compositing di browser, export resolusi tinggi, pilihan cetak dan digital, serta kontrol akses foto.")
    story.append(pdf_table(["Aspek", "Praktik umum", "Nilai inovasi RIRI PHOTOBOOTH"], [["Interaksi", "Pengunjung mengikuti proses manual atau aplikasi yang memerlukan akun.", "Alur guest/kiosk yang singkat dan diinisiasi operator."], ["Kreativitas", "Frame tetap atau pilihan desain terbatas.", "Frame bersumber dari katalog dengan kategori, preview, master asset, dan jumlah slot."], ["Pengolahan", "Hasil bergantung pada template atau operator.", "Canvas compositing menggunakan slot terukur, rotasi, dan z-index."], ["Output", "Biasanya hanya cetak atau download.", "Cetak, download PNG/JPG, dan QR/share link opsional."], ["Privasi", "File hasil dapat tersimpan pada folder publik.", "Media endpoint, token akses, share expiry, dan retention policy."], ["Operasional", "Gangguan printer ditangani manual.", "Print job berstatus queued/printing/completed/failed dan dapat retry."]], styles, [2.8, 5.2, 6.2]))
    body("Nilai inovasi tersebut relevan untuk pameran karena dapat dipahami melalui demonstrasi langsung: pengunjung melihat bagaimana input kamera berubah menjadi komposit visual, kemudian memilih keluaran sesuai kebutuhan. Produk juga dapat dikembangkan lebih lanjut untuk branding acara, statistik penggunaan, multiple booth, dan integrasi printer yang lebih kuat.")
    story.append(PageBreak())

    h1("BAB III SPESIFIKASI TEKNIS DAN GAMBARAN INOVASI")
    h2("3.1 Deskripsi Produk dan Solusi Inovasi")
    body("RIRI PHOTOBOOTH adalah web photobooth berbasis browser yang dioperasikan dalam mode kiosk. Pengunjung berinteraksi melalui layar sentuh atau mouse, sedangkan operator menyiapkan kamera, frame, jaringan, dan printer. Sistem memisahkan frontend kiosk, backend API, database, dan storage media sehingga pemrosesan foto dan pengelolaan operasional dapat dikembangkan secara terpisah.")
    body("Skenario penggunaan pada TI EXPO 2026:")
    numbered(["Operator menyiapkan perangkat dan membuka aplikasi pada mode kiosk.", "Pengunjung memilih MULAI SESI FOTO; operator membuka sesi dengan PIN lokal yang tersedia pada antarmuka.", "Pengunjung memilih kategori/frame dan melihat pratinjau frame.", "Pengunjung menempatkan diri di depan kamera; sistem menjalankan countdown dan mengambil foto sesuai jumlah slot.", "Pengunjung meninjau hasil, melakukan foto ulang atau edit sederhana, lalu memilih cetak, QR/download, atau selesai.", "Operator memantau status print job dan melakukan retry/reprint apabila dibutuhkan."])
    h2("3.2 Spesifikasi Teknis")
    story.append(pdf_table(["Komponen", "Spesifikasi/Implementasi"], [["Frontend", "Next.js 16.3.0, React 19.2.8, TypeScript, Zustand, Tailwind CSS."], ["Backend", "Node.js, Express 5.2.1, REST API, rate limit, request ID, CORS."], ["Database", "PostgreSQL dengan Prisma ORM; model Frame, FrameSlot, Photo, ShareLink, PrintJob."], ["Storage", "S3-compatible object storage melalui AWS SDK; mendukung Cloudflare R2/Backblaze B2, dengan fallback lokal untuk pengujian."], ["Kamera", "MediaDevices/getUserMedia, resolusi ideal 1920x1080, mirror preview, switch camera, error recovery."], ["Compositing", "HTML Canvas; slot normalisasi x/y/width/height, rotasi, z-index, asset master, PNG/JPG."], ["Output digital", "Download lokal, QR/share link dengan token dan expiry default 7 hari."], ["Cetak", "Browser print fallback; optional local print bridge, print queue, copy count 1-3, retry status."], ["Privasi", "Foto tidak public by default; akses melalui token; ukuran upload dibatasi 5 MB dan validasi magic bytes."], ["Deployment", "Frontend dapat dideploy ke platform Next.js/Vercel; backend memakai environment variable dan PostgreSQL production."]], styles, [4.0, 10.0]))
    h2("3.3 Cara Kerja dan Mekanisme Sistem")
    story.append(pdf_table(["Tahap", "Input", "Proses", "Output"], [["1. Mulai sesi", "Tekan tombol + PIN operator", "Reset state dan membuka sesi guest", "Sesi foto baru"], ["2. Pilih frame", "Katalog frame/kategori", "API mengirim frame dan slot; UI memfilter kategori", "Frame terpilih"], ["3. Ambil foto", "Stream kamera", "Countdown, capture JPEG, mirror untuk kamera depan", "Foto per slot"], ["4. Susun hasil", "Foto + frame + filter", "Canvas menggambar foto pada slot lalu frame di atasnya", "Komposit pratinjau/export"], ["5. Simpan opsional", "Data URL komposit", "Validasi MIME/magic bytes, batas ukuran, token guest, idempotency", "Photo record + media URL"], ["6. Bagikan", "Photo ID + token", "Buat share token, expiry, QR, dan endpoint media", "QR/share link"], ["7. Cetak", "Komposit + jumlah copy", "Buat print job; kirim ke bridge atau dialog print browser", "Status queued/printing/completed/failed"], ["8. Selesai", "Tombol selesai/sesi baru", "Reset state dan hentikan stream kamera", "Kembali ke standby"]], styles, [2.5, 3.6, 5.2, 2.7]))
    h2("3.4 Target Pengguna dan Sasaran Implementasi")
    story.append(pdf_table(["Target", "Kebutuhan", "Bentuk implementasi"], [["Pengunjung TI EXPO", "Interaksi singkat, hasil menarik, tidak membutuhkan akun", "Mode guest, UI kiosk, frame visual, output cetak/QR."], ["Operator stan", "Mengatur sesi, memantau cetak, mengatasi error", "PIN lokal, dashboard admin, print queue, retry/reprint."], ["Penyelenggara", "Aktivitas stan menarik dan mudah dipresentasikan", "Demo 2-3 menit per sesi dan branding frame sesuai acara."], ["Tim pengembang", "Media uji penerapan TI", "Frontend, API, database, storage, keamanan, dan deployment."]], styles, [3.3, 5.1, 5.6]))
    body("Untuk pameran, sasaran implementasi utama adalah satu booth dengan satu perangkat kiosk dan satu operator. Jika perangkat tambahan tersedia, arsitektur dapat diperluas menjadi beberapa kiosk yang berbagi API, database, dan storage. Print bridge ditempatkan pada jaringan lokal agar pengiriman ke printer tidak bergantung pada kemampuan browser mengakses USB secara langsung.")
    story.append(PageBreak())

    h1("BAB IV HASIL UJI COBA DAN KESIAPAN PRODUK")
    h2("4.1 Hasil Pengujian Produk/Sistem")
    body("Pengujian awal dilakukan pada source code lokal yang menjadi dasar proposal. Hasil berikut menunjukkan kesiapan software, bukan pengganti uji kamera, jaringan, atau printer fisik di lokasi pameran.")
    story.append(pdf_table(["Jenis pengujian", "Hasil", "Catatan"], [["Frontend production build", "LULUS", "Next.js berhasil membuat optimized production build; route utama, admin, share, dan token terdeteksi."], ["Frontend lint", "LULUS dengan 20 warning", "Tidak ada error lint; warning dominan terkait penggunaan img dan custom font."], ["Backend unit test", "17/18 test passed", "3 test suite lulus; 1 test privacy gagal dan 1 suite auth tidak dapat dimuat karena modul middleware tidak ditemukan."], ["Validasi upload", "Tercakup pada test", "Menguji MIME, magic bytes, ukuran maksimal 5 MB, dimensi, dan idempotency."], ["Validasi share/privacy", "Sebagian tercakup", "Ada test akses token, share expiry, dan media URL; satu skenario guest token masih perlu diperbaiki."], ["Uji perangkat/printer", "BELUM DIVERIFIKASI LAPANGAN", "Perlu uji pada perangkat target, HTTPS, kamera, printer, offline, retry, dan 50-100 sesi simulasi."]], styles, [4.2, 3.0, 6.8]))
    body("Bukti visual rancangan antarmuka/prototipe yang tersedia pada repository ditampilkan berikut. Tangkapan layar digunakan untuk mendukung gambaran alur dan perlu dibaca sebagai bukti desain/working prototype, bukan klaim bahwa seluruh perangkat eksternal sudah diuji di lokasi TI EXPO.")
    for caption, image_path in FIGURES:
        story.extend(figure_flowable(image_path, caption, styles))
        story.append(Spacer(1, 0.1 * cm))
    h2("4.2 Status Kesiapan Produk (Working Prototype)")
    body("Berdasarkan fitur yang tersedia, build production yang berhasil, lint tanpa error, serta pengujian backend yang masih menyisakan perbaikan, RIRI PHOTOBOOTH berada pada tingkat kesiapan sekitar 85% untuk demonstrasi terkontrol. Fitur utama alur pengunjung sudah tersedia, tetapi kesiapan penggunaan berbayar atau tanpa pengawasan belum dapat dinyatakan final sebelum pengujian perangkat dan perbaikan backend berikut diselesaikan.")
    story.append(pdf_table(["Area", "Status", "Tindak lanjut sebelum pameran"], [["Alur kiosk dan UI", "Siap demonstrasi", "Kunci browser pada mode kiosk dan pastikan reset sesi."], ["Kamera", "Siap secara software", "Verifikasi izin kamera, HTTPS, pencahayaan, resolusi, dan pergantian kamera."], ["Frame/compositing", "Siap secara software", "Uji semua frame 1, 2, 3, 4, dan 6 slot; cocokkan preview dengan hasil cetak."], ["Cetak", "Fallback tersedia", "Pasang dan uji print bridge + printer; uji offline, kertas habis, retry, dan reprint."], ["QR/download", "Tersedia", "Uji akses dari ponsel pengunjung dan expiry link."], ["Privasi", "Baseline tersedia", "Perbaiki test guest token; pastikan storage bucket dan CORS production benar."], ["Admin", "Perlu hardening", "Jangan membuka endpoint admin ke jaringan publik tanpa autentikasi backend yang memadai."], ["Dokumentasi/deployment", "Perlu sinkronisasi", "Samakan dokumentasi storage dengan konfigurasi S3-compatible R2/B2 yang digunakan kode saat ini."]], styles, [3.7, 3.0, 7.3]))
    h2("4.3 Rencana Demonstrasi TI EXPO 2026")
    story.append(pdf_table(["Komponen", "Rencana"], [["Durasi sesi", "Sekitar 2-3 menit per kelompok pengunjung, bergantung jumlah slot frame."], ["Perangkat", "Laptop/iPad/PC sebagai kiosk, webcam atau kamera internal, monitor opsional, dan printer foto opsional."], ["Peran operator", "Membuka sesi, membantu pose, memantau printer, dan mengarahkan QR/download."], ["Alur demo", "Pilih frame -> ambil foto -> review/filter -> cetak atau QR -> reset sesi."], ["Rencana cadangan", "Jika jaringan atau printer bermasalah, demo tetap menggunakan export/download lokal dan dialog print browser."], ["Indikator keberhasilan", "Sesi dapat selesai tanpa foto tertukar, hasil komposit sesuai preview, dan pengunjung memahami output."]], styles, [4.0, 10.0]))
    story.append(PageBreak())

    h1("BAB V PENUTUP")
    h2("5.1 Kesimpulan")
    body("RIRI PHOTOBOOTH merupakan inovasi web photobooth berbasis kiosk yang mengubah proses pengambilan foto menjadi pengalaman interaktif dan terarah. Produk menyediakan pemilihan frame, dukungan multi-slot, kamera browser, countdown, compositing canvas, filter dasar, export, QR/download, dan alur cetak dengan print queue. Pemisahan frontend, backend API, database, dan storage membuat sistem cukup fleksibel untuk dikembangkan pada kegiatan pameran maupun event lainnya.")
    body("Hasil pemeriksaan menunjukkan frontend berhasil dibuild dan dilint tanpa error, sedangkan backend telah memiliki pengujian untuk upload, privacy, share, dan frame dengan satu skenario privacy yang masih perlu diperbaiki serta satu suite auth yang belum dapat dijalankan. Dengan demikian, produk layak diposisikan sebagai working prototype untuk demonstrasi terkontrol. Penyelesaian uji kamera/printer, perbaikan pengujian backend, sinkronisasi konfigurasi storage, dan hardening admin menjadi prioritas sebelum digunakan pada operasional tanpa pengawasan.")
    body("Melalui TI EXPO 2026, RIRI PHOTOBOOTH diharapkan dapat menunjukkan bahwa teknologi web tidak hanya digunakan untuk menyajikan informasi, tetapi juga dapat menciptakan pengalaman langsung yang menyenangkan, mudah digunakan, dan memperhatikan pengelolaan data digital pengunjung.")
    story.append(PageBreak())

    h1("DAFTAR PUSTAKA")
    for i, ref in enumerate(REFERENCES, 1):
        story.append(P(f"{i}. {ref}", styles["body"]))
    story.append(P(f"Sumber implementasi produk: <link href='{REPO_URL}' color='#0563C1'>{REPO_URL}</link> (versi kode yang ditelaah: {REPO_COMMIT}).", styles["body"], rich=True))
    story.append(PageBreak())

    h1("LAMPIRAN")
    h2("Lampiran 1. Surat Pernyataan Orisinalitas")
    body("Kami yang bertanda tangan di bawah ini menyatakan bahwa proposal dan produk inovasi RIRI PHOTOBOOTH merupakan hasil karya tim yang kami susun dan kembangkan dengan itikad baik. Setiap sumber teori, dokumentasi, atau referensi dari pihak lain telah dicantumkan pada daftar pustaka. Kami bersedia menerima konsekuensi sesuai ketentuan TI EXPO 2026 apabila pernyataan ini terbukti tidak benar.")
    story.append(Spacer(1, 0.25 * cm))
    story.append(pdf_table(["No.", "Nama", "NPM", "Tanda tangan"], [["1", "[Nama Ketua Tim]", "[NPM]", "________________"], ["2", "[Nama Anggota 1]", "[NPM]", "________________"], ["3", "[Nama Anggota 2]", "[NPM]", "________________"], ["4", "[Nama Anggota 3]", "[NPM]", "________________"]], styles, [1.0, 6.0, 3.0, 4.0]))
    story.append(Spacer(1, 0.5 * cm))
    story.append(P("[Kota], [Tanggal] 2026<br/>Ketua Tim,<br/><br/><br/>[NAMA KETUA TIM]<br/>NPM [NPM KETUA]", styles["body_left"], rich=True))
    story.append(PageBreak())
    h2("Lampiran 2. Checklist Persiapan Pameran")
    bullets(["Mengisi nama tim, nama anggota, NPM, program studi, kota, tanggal, dan logo jurusan.", "Menetapkan perangkat kamera, perangkat kiosk, printer, ukuran kertas, dan layout booth.", "Menjalankan aplikasi melalui HTTPS/localhost dan menguji izin kamera pada perangkat target.", "Menguji setiap frame dengan jumlah slot yang benar dan mencocokkan preview dengan export/cetak.", "Memasang print bridge jika memerlukan cetak otomatis; menyiapkan dialog print browser sebagai fallback.", "Menjalankan simulasi minimal 50 sesi dan mencatat waktu sesi, error, serta keberhasilan output.", "Memperbaiki test guest token dan memastikan suite auth dapat dijalankan.", "Mengunci akses admin dan memastikan secret tidak masuk ke frontend atau repository.", "Menyiapkan backup frame, konfigurasi environment, kabel, kertas, dan prosedur reset sesi."])

    doc.multiBuild(story)
    return path


if __name__ == "__main__":
    docx_path = build_docx()
    pdf_path = build_pdf()
    print(f"DOCX: {docx_path}")
    print(f"PDF:  {pdf_path}")
