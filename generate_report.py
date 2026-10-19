import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_page_borders(section):
    """Add a page border box matching the original PDF."""
    sectPr = section._sectPr
    pgBorders = parse_xml(r'''
        <w:pgBorders %s w:offsetFrom="page">
            <w:top w:val="single" w:sz="4" w:space="24" w:color="000000"/>
            <w:left w:val="single" w:sz="4" w:space="24" w:color="000000"/>
            <w:bottom w:val="single" w:sz="4" w:space="24" w:color="000000"/>
            <w:right w:val="single" w:sz="4" w:space="24" w:color="000000"/>
        </w:pgBorders>
    ''' % nsdecls('w'))
    sectPr.append(pgBorders)

def set_table_borders_and_margins(table):
    """Set black borders and cell margins for the marks table."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(r'''
        <w:tblBorders %s>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
            <w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
            <w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
    ''' % nsdecls('w'))
    tblPr.append(borders)

def set_cell_margins(cell, top=80, bottom=80, left=100, right=100):
    """Set cell padding in twips (1 pt = 20 twips)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(r'''
        <w:tcMar %s>
            <w:top w:w="%d" w:type="dxa"/>
            <w:bottom w:w="%d" w:type="dxa"/>
            <w:left w:w="%d" w:type="dxa"/>
            <w:right w:w="%d" w:type="dxa"/>
        </w:tcMar>
    ''' % (nsdecls('w'), top, bottom, left, right))
    tcPr.append(tcMar)

def add_code_file(doc, title, filepath):
    """Adds a code file with heading and 8pt font code lines."""
    # Heading
    h_p = doc.add_paragraph()
    h_p.paragraph_format.space_before = Pt(0)
    h_p.paragraph_format.space_after = Pt(8)
    h_run = h_p.add_run(title)
    h_run.font.name = 'Calibri'
    h_run.font.size = Pt(14)
    h_run.bold = True
    h_run.font.color.rgb = RGBColor(0, 0, 0)
    
    # Read code lines
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    # Remove trailing empty lines
    while lines and lines[-1] == '':
        lines.pop()

    for line in lines:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        
        # Word run
        run = p.add_run(line if line else ' ')
        run.font.name = 'Calibri'
        run.font.size = Pt(8)
        run.font.color.rgb = RGBColor(0, 0, 0)

def main():
    doc = docx.Document()
    
    # Configure A4 page and margins (1 inch / 72 pt)
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    
    # Add page borders
    set_page_borders(section)
    
    # ==========================================
    # PAGE 1: TITLE & STUDENT INFO
    # ==========================================
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(8)
    t_run = title_p.add_run("U21AD502 \u2013 APPLICATION DEVELOPMENT \u2013 ASSIGNMENT 1")
    t_run.font.name = 'Calibri'
    t_run.font.size = Pt(12)
    t_run.bold = True
    t_run.font.color.rgb = RGBColor(0, 0, 0)
    
    info_p = doc.add_paragraph()
    info_p.paragraph_format.space_before = Pt(0)
    info_p.paragraph_format.space_after = Pt(10)
    i_run = info_p.add_run("NAME: JAIWANT KARRUN SA          ROLLNO: 24AD048         SUBMISSION DATE: 10.09.2026")
    i_run.font.name = 'Calibri'
    i_run.font.size = Pt(11)
    i_run.font.color.rgb = RGBColor(0, 0, 0)
    
    # ==========================================
    # MARKS TABLE
    # ==========================================
    table = doc.add_table(rows=3, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders_and_margins(table)
    
    # Set column widths (total width = 6.27 inches = ~1.567 in per col)
    col_widths = [Inches(1.57), Inches(1.57), Inches(1.57), Inches(1.56)]
    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = width

    # Row 0: Merged cell "MARKS"
    cell_marks = table.cell(0, 0)
    cell_marks.merge(table.cell(0, 3))
    cell_marks.text = ""
    marks_p = cell_marks.paragraphs[0]
    marks_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    marks_p.paragraph_format.space_before = Pt(2)
    marks_p.paragraph_format.space_after = Pt(2)
    m_run = marks_p.add_run("MARKS")
    m_run.font.name = 'Bookman Old Style'
    m_run.font.size = Pt(10)
    m_run.bold = True
    set_cell_margins(cell_marks, top=60, bottom=60, left=100, right=100)

    # Row 1: Evaluation Criteria
    headers = [
        "1. User Interface \nDesign & Layout - \nHTML Structure (15)",
        "2. CSS \nImplementation & \nJavaScript \nFunctionality and \nValidation (15)",
        "3. Server-side \nprogramming (10)",
        "TOTAL (40)"
    ]
    for idx, text in enumerate(headers):
        cell = table.cell(1, idx)
        cell.text = ""
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.05
        r = p.add_run(text)
        r.font.name = 'Bookman Old Style'
        r.font.size = Pt(9.5)
        set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
        
    # Row 2: Empty row for marks
    table.rows[2].height = Pt(40)
    for idx in range(4):
        cell = table.cell(2, idx)
        cell.text = ""
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        set_cell_margins(cell, top=60, bottom=60, left=80, right=80)

    # ==========================================
    # UI DESIGN HEADING
    # ==========================================
    ui_p = doc.add_paragraph()
    ui_p.paragraph_format.space_before = Pt(10)
    ui_p.paragraph_format.space_after = Pt(6)
    ui_run = ui_p.add_run("UI Design:")
    ui_run.font.name = 'Calibri'
    ui_run.font.size = Pt(12)
    ui_run.bold = True
    ui_run.font.color.rgb = RGBColor(0, 0, 0)
    
    # Image 1 (Financial Dashboard)
    img1_p = doc.add_paragraph()
    img1_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img1_p.paragraph_format.space_before = Pt(2)
    img1_p.paragraph_format.space_after = Pt(8)
    img1_run = img1_p.add_run()
    img1_run.add_picture('extracted_images/page_1_img_1.jpg', width=Inches(5.75))
    
    # Image 2 (Add Transaction modal)
    img2_p = doc.add_paragraph()
    img2_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img2_p.paragraph_format.space_before = Pt(2)
    img2_p.paragraph_format.space_after = Pt(0)
    img2_run = img2_p.add_run()
    img2_run.add_picture('extracted_images/page_1_img_2.jpg', width=Inches(5.75))
    
    # ==========================================
    # PAGE 2: IMAGES 3 & 4
    # ==========================================
    doc.add_page_break()
    
    # Image 3 (Set Monthly Budget modal)
    img3_p = doc.add_paragraph()
    img3_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img3_p.paragraph_format.space_before = Pt(14)
    img3_p.paragraph_format.space_after = Pt(20)
    img3_run = img3_p.add_run()
    img3_run.add_picture('extracted_images/page_2_img_1.jpg', width=Inches(5.85))
    
    # Image 4 (Visual Charts modal)
    img4_p = doc.add_paragraph()
    img4_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img4_p.paragraph_format.space_before = Pt(0)
    img4_p.paragraph_format.space_after = Pt(0)
    img4_run = img4_p.add_run()
    img4_run.add_picture('extracted_images/page_2_img_2.jpg', width=Inches(5.85))
    
    # ==========================================
    # CODE FILES SECTION
    # ==========================================
    # File 1: App.jsx
    doc.add_page_break()
    add_code_file(doc, "App.jsx:", "client/src/App.jsx")
    
    # File 2: main.jsx
    doc.add_page_break()
    add_code_file(doc, "main.jsx:", "client/src/main.jsx")
    
    # File 3: server.js
    doc.add_page_break()
    add_code_file(doc, "server.js:", "server/server.js")
    
    # File 4: Transaction.js
    doc.add_page_break()
    add_code_file(doc, "Transaction.js:", "server/models/Transaction.js")
    
    # Save document
    out_path = "App Development Review Report-1.docx"
    doc.save(out_path)
    print(f"Successfully generated {out_path}!")

    # Also save to user Downloads folder
    user_downloads = os.path.expanduser(r"~\Downloads\App Development Review Report-1.docx")
    try:
        doc.save(user_downloads)
        print(f"Successfully saved copy to {user_downloads}!")
    except Exception as e:
        print(f"Notice: Could not write copy to Downloads: {e}")

if __name__ == '__main__':
    main()
