# ============================================================
# Agent 4 — Report Generator v7.2 (Compact Pro Layout)
# ============================================================

import os, json
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable
from reportlab.graphics.shapes import Drawing, String, Circle
from reportlab.graphics.charts.piecharts import Pie

ACCENT = colors.HexColor("#1F2A44")
MUTED  = colors.HexColor("#5F6B7A")
LIGHT_BG = colors.HexColor("#F6F7FB")
PART_TINTS = {"A": colors.HexColor("#E8F2FF"), "B": colors.HexColor("#E9F9EF"),
              "C": colors.HexColor("#FFF5E6"), "D": colors.HexColor("#F7E9FF")}
def safe_part_tint(p): return PART_TINTS.get(str(p).strip().upper(), colors.HexColor("#EEF2F7"))
def pct(score, total): return 0 if total<=0 else round(100.0*float(score)/float(total),2)

class Hairline(Flowable):
    def __init__(self, width=16*cm, color=colors.Color(0,0,0,alpha=0.15)):
        Flowable.__init__(self); self.width=width; self.height=1
        self.color=color
    def draw(self): self.canv.setFillColor(self.color); self.canv.rect(0,0,self.width,0.5,stroke=0,fill=1)

def make_rainbow_donut(score,total):
    perc=0 if total==0 else max(0.0,min(100.0,(score/total)*100.0))
    remain=100.0-perc
    rainbow=["#ff595e","#ff924c","#ffca3a","#8ac926","#52b69a","#1982c4","#6a4c93","#c77dff","#f72585","#fb5607"]
    slices=[]; left=perc; step=max(1.0,100.0/len(rainbow))
    i=0
    while left>0 and i<len(rainbow):
        val=min(step,left); slices.append(("ach",val,colors.HexColor(rainbow[i]))); left-=val; i+=1
    if remain>0: slices.append(("rem",remain,colors.HexColor("#E0E0E0")))
    d=Drawing(100,100); pie=Pie(); pie.x=5; pie.y=5; pie.width=90; pie.height=90; pie.startAngle=90
    pie.data=[s[1] for s in slices]; pie.labels=[""]*len(slices)
    for i,s in enumerate(slices): pie.slices[i].fillColor=s[2]; pie.slices[i].strokeWidth=0
    d.add(pie); hole=Circle(50,50,23); hole.fillColor=colors.white; d.add(hole)
    d.add(String(50,52,f"{int(round(perc))}%",fontSize=11,fillColor=ACCENT,textAnchor="middle"))
    d.add(String(50,38,f"{int(score)}/{int(total)}",fontSize=8,fillColor=MUTED,textAnchor="middle"))
    return d

def progress_bar(width_cm,ratio):
    ratio=max(0.0,min(1.0,ratio)); full=width_cm*cm; filled=max(1,int(full*ratio))
    tbl=Table([["",""]],colWidths=[filled,full-filled],rowHeights=6)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(0,0),colors.HexColor("#57CC99")),
        ("BACKGROUND",(1,0),(1,0),colors.HexColor("#E5E7EB")),
        ("BOX",(0,0),(-1,-1),0.3,colors.HexColor("#B0B8C4")),
    ]))
    return tbl

def generate_report(agent3_json_path:str):
    with open(agent3_json_path) as f: data=json.load(f)
    sid=data.get("student_id","Unknown"); results=data.get("results",[])
    total_score=float(data.get("total_score",0))
    total_marks=float(sum(r.get("marks",0) for r in results))
    percent_total=pct(total_score,total_marks)
    attempted=sum(1 for r in results if str(r.get("answer","")).strip())
    n_q=len(results)
    os.makedirs("reports",exist_ok=True)
    pdf_path=f"reports/{sid}.pdf"

    doc=SimpleDocTemplate(pdf_path,pagesize=A4,
        rightMargin=2*cm,leftMargin=2*cm,topMargin=1.5*cm,bottomMargin=1.5*cm)
    styles=getSampleStyleSheet()
    H1=ParagraphStyle("H1",fontSize=17,leading=20,textColor=ACCENT,alignment=1)
    SUB=ParagraphStyle("SUB",fontSize=10,leading=13,textColor=MUTED)
    TEXT=ParagraphStyle("TEXT",fontSize=9.6,leading=13)
    FB=ParagraphStyle("FB",fontSize=9.3,leading=13,leftIndent=8)
    KPI=ParagraphStyle("KPI",fontSize=10.5,leading=14,textColor=ACCENT)
    flow=[]
    banner=Table([[Paragraph("<b>SCRIBIFY AI — STUDENT EVALUATION REPORT</b>",H1)]],colWidths=[16*cm])
    banner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#E9EDFF")),
                                ("BOX",(0,0),(-1,-1),0.3,colors.HexColor("#C9D1FF"))]))
    flow+= [banner, Spacer(1,6)]
    donut=make_rainbow_donut(total_score,total_marks)
    header=Table([[Paragraph(f"<b>Student ID:</b> {sid}",SUB), donut,
                   Paragraph(f"<b>Total:</b> {int(total_score)}/{int(total_marks)}<br/>"
                             f"<b>Percentage:</b> {percent_total:.1f}%<br/>"
                             f"<b>Attempted:</b> {attempted}/{n_q}<br/>",KPI)]],
                 colWidths=[7.8*cm,4.0*cm,4.2*cm])
    header.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("ALIGN",(1,0),(1,0),"CENTER")]))
    flow+=[header, Spacer(1,4), progress_bar(16,0 if total_marks==0 else total_score/total_marks), Spacer(1,8)]
    for i,q in enumerate(results,1):
        part=q.get("part",""); qno=q.get("qno",""); marks=q.get("marks",0); score=q.get("score",0)
        ques=(q.get("question","") or "").strip(); ans=(q.get("answer","") or "").strip(); fb=q.get("feedback",{}) or {}
        head=Table([[f"Part {part} | Q{qno}",f"Score: {score}/{marks}"]],colWidths=[12*cm,4*cm])
        head.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),safe_part_tint(part)),
                                  ("TEXTCOLOR",(0,0),(-1,-1),ACCENT),("BOX",(0,0),(-1,-1),0.3,colors.HexColor("#CBD5E1"))]))
        flow.append(head); flow.append(Spacer(1,2))
        flow.append(Paragraph(f"<b>Question:</b> {ques}",TEXT))
        flow.append(Paragraph(f"<b>Student Answer:</b> {ans}",TEXT))
        fb_html=(f"<b>▪ Correct:</b> {fb.get('correct','')}<br/>"
                 f"<b>▪ Wrong / Missing:</b> {fb.get('wrong_or_missing','')}<br/>"
                 f"<b>▪ Improve:</b> {fb.get('improvement','')}<br/>"
                 f"<b>▪ Ref:</b> {fb.get('reference','')}")
        fb_box=Table([[Paragraph(fb_html,FB)]],colWidths=[16*cm])
        fb_box.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#F3F4F6")),
                                    ("BOX",(0,0),(-1,-1),0.4,colors.HexColor("#D1D5DB"))]))
        flow+=[fb_box, Spacer(1,6), Hairline(), Spacer(1,5)]
        if i%7==0: flow.append(PageBreak())
    doc.build(flow)
    print(f"✅ Report generated → {pdf_path}")
    return pdf_path

def run_agent4(agent3_dir="agent3_outputs"):
    os.makedirs("reports",exist_ok=True)
    for p in Path(agent3_dir).glob("*_agent3.json"):
        generate_report(str(p))
    print("🏁 Agent 4 complete — All reports saved to /reports/")
