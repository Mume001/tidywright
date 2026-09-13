# Builds the scenario deck as print-ready HTML, one 1280x720 page per slide.
import json

S = json.load(open("/home/claude/model/scenarios.json"))

INK = "#12131A"
PAPER = "#FFFFFF"
PANEL = "#F3F4F7"
PANEL2 = "#E9EBF1"
LINE = "#DFE2E9"
TX = "#12131A"
MUTED = "#5B6072"
DIM = "#878CA0"
LIME = "#B6E24A"
LIMED = "#5F7E23"
WORST = "#C2632A"
BASE = "#3B4FC4"
BEST = "#2F9E44"

CSS = f"""
@page {{ size: 13.333in 7.5in; margin: 0; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; }}
body {{
  font-family: 'Carlito', 'Calibri', sans-serif;
  color: {TX}; background: {PAPER}; font-size: 16px; line-height: 1.5;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}}
.s {{
  width: 1280px; height: 720px; position: relative; overflow: hidden;
  page-break-after: always; background: {PAPER}; padding: 58px 72px 86px 72px;
  display: flex; flex-direction: column; justify-content: center;
}}
.s:last-child {{ page-break-after: auto; }}
.s.dark {{ background: {INK}; color: #FFFFFF; }}
h1, h2, .dsp {{ font-family: 'Bitstream Charter', Georgia, serif; margin: 0; font-weight: 700; }}
h1 {{ font-size: 44px; line-height: 1.1; letter-spacing: -0.5px; }}
h2 {{ font-size: 32px; line-height: 1.15; letter-spacing: -0.3px; }}
.kick {{ font-size: 12px; letter-spacing: 1.6px; text-transform: uppercase;
        font-weight: 700; color: {LIMED}; margin-bottom: 14px; }}
.dark .kick {{ color: {LIME}; }}
.lead {{ font-size: 17px; color: {MUTED}; line-height: 1.6; }}
.dark .lead {{ color: #A9AEC2; }}
.mono {{ font-family: 'DejaVu Sans Mono', monospace; }}
.num {{ font-size: 15px; }}
.row {{ display: flex; }}
.card {{ background: {PANEL}; border-radius: 12px; padding: 22px 24px; }}
.dark .card {{ background: #1D1F2B; }}
table {{ width: 100%; border-collapse: collapse; font-size: 15px; }}
th {{ text-align: left; font-size: 11.5px; letter-spacing: 1px; text-transform: uppercase;
     color: {DIM}; font-weight: 700; padding: 0 12px 10px 12px; }}
td {{ padding: 11px 12px; border-top: 1px solid {LINE}; }}
.r {{ text-align: right; }}
.pn {{ position: absolute; right: 72px; bottom: 34px; font-size: 12px; color: {DIM}; }}
.dark .pn {{ color: #5B6072; }}
.tag {{ display: inline-block; padding: 3px 10px; border-radius: 999px;
       font-size: 12px; font-weight: 700; }}
.foot {{ position: absolute; left: 72px; bottom: 32px; right: 72px;
        font-size: 13px; color: {DIM}; }}
"""


def money(v):
    return "${:,.0f}".format(v)


def slide(body, n=None, dark=False):
    cls = "s dark" if dark else "s"
    pn = f'<div class="pn">{n:02d}</div>' if n else ""
    return f'<div class="{cls}">{body}{pn}</div>\n'


# ----------------------------------------------------------- charts
def line_chart(key, title, ylab, fmt, width=1120, height=420):
    """Single measure, three scenarios. One y axis. Direct labels plus legend."""
    series = [("worst", WORST, "Najgori"), ("base", BASE, "Osnovni"), ("best", BEST, "Najbolji")]
    data = {k: [r[key] for r in S[k]["rows"]] for k, _, _ in series}
    top = max(max(v) for v in data.values())
    step = 10 ** (len(str(int(top))) - 1)
    ymax = (int(top / step) + 1) * step
    pl, pr, pt, pb = 62, 140, 18, 34
    iw, ih = width - pl - pr, height - pt - pb

    def x(i):
        return pl + i * iw / 23

    def y(v):
        return pt + ih - (v / ymax) * ih

    out = [f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="none">']
    for g in range(5):
        v = ymax * g / 4
        yy = y(v)
        out.append(f'<line x1="{pl}" y1="{yy:.1f}" x2="{pl + iw}" y2="{yy:.1f}" stroke="{LINE}" stroke-width="1"/>')
        out.append(f'<text x="{pl - 12}" y="{yy + 4:.1f}" text-anchor="end" font-size="12" '
                   f'fill="{DIM}" font-family="Carlito, sans-serif">{fmt(v)}</text>')
    for m in (0, 5, 11, 17, 23):
        out.append(f'<text x="{x(m):.1f}" y="{pt + ih + 22}" text-anchor="middle" font-size="12" '
                   f'fill="{DIM}" font-family="Carlito, sans-serif">mj {m + 1}</text>')
    for k, col, label in series:
        pts = " ".join(f"{x(i):.1f},{y(v):.1f}" for i, v in enumerate(data[k]))
        out.append(f'<polyline points="{pts}" stroke="{col}" stroke-width="2.4" '
                   'stroke-linecap="round" stroke-linejoin="round"/>')
        last = data[k][-1]
        out.append(f'<circle cx="{x(23):.1f}" cy="{y(last):.1f}" r="4.5" fill="{col}"/>')
        out.append(f'<text x="{x(23) + 14:.1f}" y="{y(last) - 2:.1f}" font-size="14" font-weight="700" '
                   f'fill="{col}" font-family="Carlito, sans-serif">{fmt(last)}</text>')
        out.append(f'<text x="{x(23) + 14:.1f}" y="{y(last) + 14:.1f}" font-size="12" '
                   f'fill="{MUTED}" font-family="Carlito, sans-serif">{label}</text>')
    out.append("</svg>")
    return (f'<div style="margin-top:6px"><div style="font-size:13px;color:{DIM};'
            f'margin-bottom:2px">{ylab}</div>' + "".join(out) + "</div>")


def legend():
    items = [(WORST, "Najgori scenarij"), (BASE, "Osnovni scenarij"), (BEST, "Najbolji scenarij")]
    return ('<div class="row" style="gap:26px;margin-top:4px">'
            + "".join(f'<div class="row" style="gap:9px;align-items:center">'
                      f'<div style="width:15px;height:3px;border-radius:2px;background:{c}"></div>'
                      f'<span style="font-size:13.5px;color:{MUTED}">{t}</span></div>'
                      for c, t in items)
            + "</div>")


slides = []

# ----------------------------------------------------------- 1 cover
slides.append(slide(f"""
<div style="position:absolute;right:-140px;top:-180px;width:560px;height:560px;
     border-radius:50%;background:#1E2130"></div>
<div style="position:relative;padding-top:150px">
  <div class="kick">Finansijski model, septembar 2026</div>
  <h1 style="font-size:58px;max-width:760px;color:#FFFFFF">Koliko ovaj projekat
  može zaraditi, i koliko ne može</h1>
  <div class="lead" style="margin-top:26px;max-width:620px">Tri scenarija kroz 24 mjeseca,
  računata iz stvarnih cijena alata i podataka. Proizvod: Tidywright.</div>
  <div style="width:64px;height:3px;background:{LIME};margin:36px 0 22px 0"></div>
  <div style="font-size:14px;color:#8A8FA0">20 sati sedmično &nbsp;·&nbsp; bez budžeta za oglase
  &nbsp;·&nbsp; organski rast</div>
</div>
""", dark=True))

# ----------------------------------------------------------- 2 how to read
slides.append(slide(f"""
<div class="kick">Kako čitati ovaj dokument</div>
<h1 style="max-width:900px">Ovo su modeli, nisu prognoze</h1>
<div class="lead" style="margin-top:18px;max-width:940px">Troškovna strana je čvrsta: cijene
API-ja, hostinga i modela su provjerene i javno objavljene. Prihodovna strana je pretpostavka.
Sve tri kolone dijele isti trošak i iste cijene paketa. Razlikuju se samo u dvije stvari,
i te dvije stvari odlučuju sve.</div>
<div class="row" style="gap:20px;margin-top:34px">
  <div class="card" style="flex:1">
    <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:{DIM};
    font-weight:700">Varijabla 1</div>
    <div class="dsp" style="font-size:26px;margin:10px 0 8px 0">Koliko novih kupaca mjesečno</div>
    <div style="color:{MUTED};font-size:15px;line-height:1.6">Od 2 mjesečno u najgorem do 16 u
    najboljem. Sve organski, bez plaćenih oglasa.</div>
  </div>
  <div class="card" style="flex:1">
    <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:{DIM};
    font-weight:700">Varijabla 2</div>
    <div class="dsp" style="font-size:26px;margin:10px 0 8px 0">Koliki je mjesečni odliv</div>
    <div style="color:{MUTED};font-size:15px;line-height:1.6">Od 8 posto mjesečno u najgorem do
    4 posto u najboljem. Ovo je tiši ubica od sporog rasta.</div>
  </div>
  <div class="card" style="flex:1;background:#FDF4EC">
    <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:{WORST};
    font-weight:700">Šta nije u modelu</div>
    <div class="dsp" style="font-size:26px;margin:10px 0 8px 0">Tvoje vrijeme kao trošak</div>
    <div style="color:{MUTED};font-size:15px;line-height:1.6">20 sati sedmično je 87 sati mjesečno.
    Na kraju svakog scenarija pretvaram zaradu u satnicu, da se vidi šta si stvarno zaradio.</div>
  </div>
</div>
""", 2))

# ----------------------------------------------------------- 3 pricing
anchors = [
    ("SEOJuice", "24 EUR", "najjeftiniji u kategoriji"),
    ("SEOAgent", "49 USD po sajtu", "razvojni, kroz repozitorij"),
    ("SearchAtlas OTTO", "99 USD", "najglasniji u kategoriji"),
    ("Ahrefs", "129 USD", "Patches je dodatak na plan"),
    ("Semrush", "139 USD", "ulazni paket"),
    ("Alli AI", "299 USD", "cilja agencije"),
]
rows = "".join(
    f'<tr><td style="font-weight:700">{n}</td><td class="mono">{p}</td>'
    f'<td style="color:{MUTED}">{d}</td></tr>' for n, p, d in anchors
)
tiers = [
    ("Solo", "29", "1 sajt, do 500 stranica", "vlasnik jednog sajta"),
    ("Studio", "69", "3 sajta, do 2.000 stranica", "freelancer, mala firma"),
    ("Agency", "199", "15 sajtova, bijela etiketa", "agencija, preprodaja"),
]
tcards = "".join(
    f'<div class="card" style="flex:1">'
    f'<div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:{DIM};'
    f'font-weight:700">{n}</div>'
    f'<div class="dsp" style="font-size:40px;margin:8px 0 2px 0">${p}</div>'
    f'<div style="font-size:13px;color:{DIM};margin-bottom:12px">mjesečno</div>'
    f'<div style="font-size:15px;line-height:1.55">{w}</div>'
    f'<div style="font-size:13.5px;color:{MUTED};margin-top:8px">{who}</div></div>'
    for n, p, w, who in tiers
)
slides.append(slide(f"""
<div class="kick">Cijene</div>
<h1>Tri paketa, postavljena ispod tržišta</h1>
<div class="row" style="gap:20px;margin-top:26px">{tcards}</div>
<div class="row" style="gap:34px;margin-top:30px;align-items:flex-start">
  <div style="flex:1.15">
    <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:{DIM};
    font-weight:700;margin-bottom:8px">Gdje stoji konkurencija</div>
    <table>{rows}</table>
  </div>
  <div style="flex:0.85;padding-top:26px">
    <div style="font-size:16px;line-height:1.7;color:{MUTED}">Solo paket je namjerno ispod
    svih osim SEOJuicea. To nije rat cijenama nego ulazna tačka: mali sajt koji nikad neće
    platiti 129 dolara Ahrefsu može platiti 29. Agency paket nosi maržu i on je razlog zašto
    ovo uopšte ima smisla, jer jedna agencija plaća kao sedam solo kupaca i traži manje podrške.</div>
  </div>
</div>
""", 3))

# ----------------------------------------------------------- 4 cost per customer
cost_rows = [
    ("Crawl sajta, 4 puta mjesečno", "$0.05", "vlastiti server"),
    ("Model koji piše popravke, ustaljeno", "$0.25", "oko 50 promijenjenih stranica"),
    ("Model, prvi mjesec za cijeli sajt", "$2.25", "jednokratno, 500 stranica"),
    ("Praćenje pozicija, 50 riječi sedmično", "$0.13", "DataForSEO, opcionalno"),
    ("Search Console i PageSpeed", "$0.00", "Googleovi besplatni API-ji"),
]
crows = "".join(
    f'<tr><td>{a}</td><td class="mono r" style="font-weight:700">{b}</td>'
    f'<td style="color:{MUTED}">{c}</td></tr>' for a, b, c in cost_rows
)
plan_rows = [
    ("Solo", "$29", "$1.14", "$0.45", "$27.41", "94,5%"),
    ("Studio", "$69", "$2.30", "$0.99", "$65.71", "95,2%"),
    ("Agency", "$199", "$6.07", "$4.05", "$188.88", "94,9%"),
]
prows = "".join(
    f'<tr><td style="font-weight:700">{a}</td><td class="mono r">{b}</td><td class="mono r">{c}</td>'
    f'<td class="mono r">{d}</td><td class="mono r" style="font-weight:700">{e}</td>'
    f'<td class="r" style="color:{BEST};font-weight:700">{f}</td></tr>'
    for a, b, c, d, e, f in plan_rows
)
slides.append(slide(f"""
<div class="kick">Troškovi</div>
<h1>Jedan kupac košta manje od jedne kafe</h1>
<div class="row" style="gap:30px;margin-top:24px;align-items:flex-start">
  <div style="flex:1">
    <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:{DIM};
    font-weight:700;margin-bottom:8px">Po sajtu, mjesečno</div>
    <table>{crows}</table>
    <div style="margin-top:14px;font-size:15px;color:{MUTED};line-height:1.6">Ustaljeno oko
    <b style="color:{TX}">0,45 dolara po sajtu mjesečno</b>. Prvi mjesec oko 2,45 jer se cijeli
    sajt jednom prepiše.</div>
  </div>
  <div style="flex:1">
    <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:{DIM};
    font-weight:700;margin-bottom:8px">Šta ostane od pretplate</div>
    <table><tr><th>Paket</th><th class="r">Cijena</th><th class="r">Stripe</th>
    <th class="r">Podaci</th><th class="r">Ostaje</th><th class="r">Marža</th></tr>{prows}</table>
    <div class="card" style="margin-top:18px;background:#EEF5EE">
      <div style="font-size:15px;line-height:1.65">Bruto marža oko <b>95 posto</b> na svakom
      paketu. To nije optimizam nego posljedica jedne odluke: proizvod ne kupuje podatke.
      Crawla se kupčev sajt, čita se njegov Search Console, koristi se besplatni Googleov
      PageSpeed. Nema indeksa backlinkova koji se plaća.</div>
    </div>
  </div>
</div>
""", 4))

# ----------------------------------------------------------- 5 scenarios table
def srow(k, label, color):
    s = S[k]
    return (f'<tr><td><span class="tag" style="background:{color}1A;color:{color}">{label}</span></td>'
            f'<td class="r mono">{s["build"]} mj</td>'
            f'<td class="r mono">{s["rows"][-1]["gross"]:.0f}</td>'
            f'<td class="r mono">{s["churn"]*100:.1f}%</td>'
            f'<td class="r mono">{s["m12"]["customers"]:.0f}</td>'
            f'<td class="r mono" style="font-weight:700">{money(s["m12"]["mrr"])}</td>'
            f'<td class="r mono">{s["m24"]["customers"]:.0f}</td>'
            f'<td class="r mono" style="font-weight:700">{money(s["m24"]["mrr"])}</td>'
            f'<td class="r mono">{s["ceiling"]}</td></tr>')

slides.append(slide(f"""
<div class="kick">Pregled</div>
<h1>Tri scenarija, jedan pogled</h1>
<div style="margin-top:28px">
<table style="font-size:16px">
<tr><th>Scenarij</th><th class="r">Gradnja</th><th class="r">Novih / mj</th><th class="r">Odliv</th>
<th class="r">Kupci m12</th><th class="r">MRR m12</th><th class="r">Kupci m24</th>
<th class="r">MRR m24</th><th class="r">Plafon</th></tr>
{srow("worst", "Najgori", WORST)}{srow("base", "Osnovni", BASE)}{srow("best", "Najbolji", BEST)}
</table></div>
<div class="row" style="gap:20px;margin-top:34px">
  <div class="card" style="flex:1">
    <div class="dsp" style="font-size:30px;color:{WORST}">{money(S["worst"]["m24"]["cum"])}</div>
    <div style="font-size:14px;color:{MUTED};margin-top:6px">ukupno zarađeno za 24 mjeseca,
    najgori slučaj. To je <b>{S["worst"]["rate24"]:.2f} dolara po satu</b> tvog rada.</div>
  </div>
  <div class="card" style="flex:1">
    <div class="dsp" style="font-size:30px;color:{BASE}">{money(S["base"]["m24"]["cum"])}</div>
    <div style="font-size:14px;color:{MUTED};margin-top:6px">osnovni slučaj, ili
    <b>{S["base"]["rate24"]:.2f} dolara po satu</b> kroz dvije godine.</div>
  </div>
  <div class="card" style="flex:1">
    <div class="dsp" style="font-size:30px;color:{BEST}">{money(S["best"]["m24"]["cum"])}</div>
    <div style="font-size:14px;color:{MUTED};margin-top:6px">najbolji slučaj, ili
    <b>{S["best"]["rate24"]:.2f} dolara po satu</b>.</div>
  </div>
</div>
<div class="foot">Plafon je broj kupaca na kojem rast stane: novi kupci mjesečno podijeljeni
stopom odliva. Nije dostignut unutar 24 mjeseca ni u jednom scenariju osim najgoreg.</div>
""", 5))

# ----------------------------------------------------------- 6 customers chart
slides.append(slide(f"""
<div class="kick">Rast</div>
<h1>Broj plaćenih kupaca kroz 24 mjeseca</h1>
{legend()}
{line_chart("customers", "", "Kupci", lambda v: f"{v:.0f}")}
<div class="foot">Ravna linija u prvim mjesecima je period gradnje: 3 mjeseca u najboljem,
6 u najgorem slučaju.</div>
""", 6))

# ----------------------------------------------------------- 7 mrr chart
slides.append(slide(f"""
<div class="kick">Prihod</div>
<h1>Mjesečni ponavljajući prihod</h1>
{legend()}
{line_chart("mrr", "", "MRR u dolarima", lambda v: f"${v:,.0f}")}
<div class="foot">Razlika između najgoreg i najboljeg nije dvostruka nego dvadesetostruka.
Uzrok nije cijena nego kombinacija broja novih kupaca i odliva.</div>
""", 7))

# ----------------------------------------------------------- 8, 9, 10 per scenario
def detail(k, label, color, title, narrative, bullets, n):
    s = S[k]
    blist = "".join(
        f'<div style="display:flex;gap:12px;padding:11px 0;border-top:1px solid {LINE}">'
        f'<div style="width:6px;height:6px;border-radius:9px;background:{color};margin-top:8px;'
        f'flex-shrink:0"></div><div style="font-size:15.5px;line-height:1.6">{b}</div></div>'
        for b in bullets
    )
    return slide(f"""
<div class="kick" style="color:{color}">{label}</div>
<h1 style="max-width:900px">{title}</h1>
<div class="row" style="gap:16px;margin-top:26px">
  <div class="card" style="flex:1"><div style="font-size:12.5px;letter-spacing:1px;
  text-transform:uppercase;color:{DIM};font-weight:700">Kupci u 24. mjesecu</div>
  <div class="dsp" style="font-size:36px;margin-top:6px">{s["m24"]["customers"]:.0f}</div></div>
  <div class="card" style="flex:1"><div style="font-size:12.5px;letter-spacing:1px;
  text-transform:uppercase;color:{DIM};font-weight:700">MRR u 24. mjesecu</div>
  <div class="dsp" style="font-size:36px;margin-top:6px;color:{color}">{money(s["m24"]["mrr"])}</div></div>
  <div class="card" style="flex:1"><div style="font-size:12.5px;letter-spacing:1px;
  text-transform:uppercase;color:{DIM};font-weight:700">Ukupno za 2 godine</div>
  <div class="dsp" style="font-size:36px;margin-top:6px">{money(s["m24"]["cum"])}</div></div>
  <div class="card" style="flex:1"><div style="font-size:12.5px;letter-spacing:1px;
  text-transform:uppercase;color:{DIM};font-weight:700">Po satu tvog rada</div>
  <div class="dsp" style="font-size:36px;margin-top:6px">${s["rate24"]:.2f}</div></div>
</div>
<div class="row" style="gap:36px;margin-top:30px;align-items:flex-start">
  <div style="flex:1"><div style="font-size:16.5px;line-height:1.7;color:{MUTED}">{narrative}</div></div>
  <div style="flex:1.1"><div style="font-size:12.5px;letter-spacing:1px;text-transform:uppercase;
  color:{DIM};font-weight:700;margin-bottom:4px">Šta se u ovom scenariju dešava</div>{blist}</div>
</div>
""", n)

slides.append(detail(
    "worst", "Najgori slučaj", WORST,
    "Radi, ali ne zarađuje dovoljno da opravda vrijeme",
    "Proizvod je ispravan i kupci ga koriste. Problem je što ih je premalo i odlaze prebrzo. "
    "Pri 2 nova kupca mjesečno i odlivu od 8 posto, brojka staje na oko 25 kupaca i tu ostaje "
    "zauvijek. Projekat je tehnički uspješan i poslovno promašen. Ovo nije katastrofa nego "
    "najvjerovatniji ishod ako se gradi bez razgovora s kupcima.",
    ["Gradnja traje 6 mjeseci jer se opseg širi usput",
     "Organski kanal donosi jednog do dva kupca mjesečno",
     "Odliv 8 posto: kupci poprave sajt jednom i otkažu",
     "Skoro svi su na solo paketu, agencije ne dolaze",
     "Plafon rasta je 25 kupaca, dostignut oko 20. mjeseca"], 8))

slides.append(detail(
    "base", "Osnovni slučaj", BASE,
    "Solidan sporedni prihod, ne još i plata",
    "Ovo je ishod ako sve ide normalno: proizvod izađe za 4 mjeseca, sadržaj i direktan kontakt "
    "donose oko 7 novih kupaca mjesečno, a odliv padne na 5,5 posto jer popravke koje ostaju "
    "u kupčevom sistemu daju razlog da se pretplata produži. Na kraju druge godine to je oko "
    "4.100 dolara mjesečno, i još uvijek raste jer plafon nije dostignut.",
    ["Prvi plaćeni kupac u 5. mjesecu",
     "7 novih mjesečno iz besplatnih kanala",
     "Odliv 5,5 posto, jer izmjene ostaju kod kupca",
     "Svaki deseti kupac je agencija, a one nose maržu",
     "Novac prelazi u plus već u 6. mjesecu"], 9))

slides.append(detail(
    "best", "Najbolji slučaj", BEST,
    "Jedan kanal proradi i sve se mijenja",
    "Razlika u odnosu na osnovni scenarij nije u proizvodu nego u distribuciji. Nešto jedno "
    "uhvati: WordPress direktorij, agencijski program preprodaje, ili jedan članak koji se "
    "rangira za pravu frazu. Šesnaest novih kupaca mjesečno uz odliv od 4 posto daje 207 kupaca "
    "i skoro 14.000 dolara mjesečno na kraju druge godine. Plafon je tek na 400, pa rast "
    "ni tad ne staje.",
    ["Proizvod izađe za 3 mjeseca, uži opseg",
     "Jedan kanal donosi 15 i više kupaca mjesečno",
     "Odliv pada na 4 posto",
     "Agencije su 15 posto kupaca i dižu prosjek",
     "Od 18. mjeseca je ovo puna plata, ne sporedni prihod"], 10))

# ----------------------------------------------------------- 11 the ceiling
slides.append(slide(f"""
<div class="kick">Najvažnija stranica u dokumentu</div>
<h1 style="max-width:880px">Odliv, a ne rast, određuje gdje ćeš stati</h1>
<div class="lead" style="margin-top:18px;max-width:900px">Broj kupaca ne raste beskonačno.
Staje tačno na broju novih kupaca mjesečno podijeljenom sa stopom odliva. Ta jedna formula
objašnjava cijelu razliku između tri scenarija.</div>
<div class="card" style="margin-top:26px;text-align:center;padding:26px">
  <div class="mono" style="font-size:30px;font-weight:700">plafon = novi kupci mjesečno &nbsp;/&nbsp; stopa odliva</div>
</div>
<div class="row" style="gap:20px;margin-top:26px">
  <div class="card" style="flex:1;border-left:0">
    <div class="mono" style="font-size:22px;color:{WORST};font-weight:700">2 / 0,08 = 25</div>
    <div style="font-size:15px;color:{MUTED};margin-top:10px;line-height:1.6">Dvadeset pet kupaca
    je plafon. Koliko god dugo radio, brojka se tu zaustavlja.</div></div>
  <div class="card" style="flex:1">
    <div class="mono" style="font-size:22px;color:{BASE};font-weight:700">7 / 0,055 = 127</div>
    <div style="font-size:15px;color:{MUTED};margin-top:10px;line-height:1.6">Isti proizvod,
    tri i po puta više novih kupaca i nešto manji odliv, pet puta veći plafon.</div></div>
  <div class="card" style="flex:1">
    <div class="mono" style="font-size:22px;color:{BEST};font-weight:700">16 / 0,04 = 400</div>
    <div style="font-size:15px;color:{MUTED};margin-top:10px;line-height:1.6">Prepolovi odliv i
    plafon se udvostruči, bez ijednog novog kupca. Zadržavanje je jeftinije od sticanja.</div></div>
</div>
<div class="foot">Praktična posljedica: funkcija koja smanjuje odliv vrijedi više od funkcije
koja privlači nove kupce. Zato popravke koje ostaju u kupčevom sistemu nisu marketinška
priča nego finansijska odluka.</div>
""", 11))

# ----------------------------------------------------------- 12 what must be true
musts = [
    ("Neko plati prije nego što je sve gotovo",
     "Ako deset ljudi ne pristane da plati na osnovu demonstracije, cijena je pogrešna ili problem nije dovoljno bolan. To se sazna za dvije sedmice, ne za šest mjeseci."),
    ("Popravka mora ostati kad kupac ode",
     "Cijela razlika u odnosu na konkurenciju je tu. Ako se svede na ubacivanje skripte, ovo je još jedan proizvod u gužvi u kojoj je i Ahrefs."),
    ("Odliv ispod 6 posto mjesečno",
     "Iznad toga se sav rast pojede sam. Mjeri se od prvog dana, jer se otkriva tek u trećem mjesecu."),
    ("Bar jedna agencija među prvih dvadeset kupaca",
     "Agencija plaća kao sedam solo kupaca, ostaje duže i sama donosi nove sajtove. Bez njih prosjek pada na 29 dolara."),
    ("Nijedan kupčev sajt se ne smije pokvariti",
     "Jedan slomljen produkcijski sajt bez mogućnosti vraćanja unazad i priča je gotova. Snimak prije svake izmjene nije opcija."),
]
mlist = "".join(
    f'<div style="display:flex;gap:16px;padding:15px 0;border-top:1px solid {LINE}">'
    f'<div class="mono" style="font-size:15px;color:{DIM};width:26px;flex-shrink:0;'
    f'padding-top:2px">{i+1:02d}</div>'
    f'<div><div style="font-weight:700;font-size:17px">{t}</div>'
    f'<div style="font-size:15px;color:{MUTED};margin-top:4px;line-height:1.6">{d}</div></div></div>'
    for i, (t, d) in enumerate(musts)
)
slides.append(slide(f"""
<div class="kick">Uslovi</div>
<h1>Pet stvari koje moraju biti tačne za osnovni scenarij</h1>
<div style="margin-top:22px">{mlist}</div>
""", 12))

# ----------------------------------------------------------- 13 risks
risks = [
    ("Visok", "Ahrefs i Semrush pretvore ovo u dodatak koji poklanjaju",
     "Ahrefs već ima Patches. Ako to uđe u osnovni paket, samostalni proizvod ostaje bez razloga za postojanje osim cijene."),
    ("Visok", "Odgovornost kad se tuđi sajt pokvari",
     "Ti pišeš po produkcijskom sajtu. Potrebni su snimak prije izmjene, vraćanje jednim klikom i jasan ugovor o odgovornosti."),
    ("Srednji", "WordPress odbije plugin ili ga suspenduje",
     "U avgustu 2026. Rank Math je morao pauzirati funkciju koja je tiho pravila pristupne lozice. Ta zajednica je osjetljiva na pisanje bez dozvole."),
    ("Srednji", "Gradnja se otegne preko četiri mjeseca",
     "Svaki mjesec kašnjenja je mjesec bez prihoda i mjesec u kojem konkurencija ide dalje. Opseg je jedina odbrana."),
    ("Nizak", "Cijene modela ili podataka skoče",
     "Pri marži od 95 posto može poskupjeti i deset puta prije nego što zaboli."),
]
rlist = "".join(
    f'<tr><td style="width:90px"><span class="tag" style="background:{c}1A;color:{c}">{lvl}</span></td>'
    f'<td><div style="font-weight:700;font-size:16px">{t}</div>'
    f'<div style="font-size:14.5px;color:{MUTED};margin-top:3px;line-height:1.55">{d}</div></td></tr>'
    for (lvl, t, d), c in zip(risks, [WORST, WORST, "#B08420", "#B08420", MUTED])
)
slides.append(slide(f"""
<div class="kick">Rizici</div>
<h1>Šta ubija projekat, poredano po vjerovatnoći</h1>
<div style="margin-top:24px"><table>{rlist}</table></div>
""", 13))

# ----------------------------------------------------------- 14 build order
phases = [
    ("Faza 1", "2 do 3 sedmice", "Skener i izvještaj", BASE,
     ["Crawler za kupčev sajt", "Trideset do četrdeset provjera", "Izvještaj kao web stranica i PDF",
      "Bez naloga, bez baze, bez plaćanja"],
     "Cilj: pokazati ga dvadeset ljudi i vidjeti reakciju."),
    ("Faza 2", "3 do 4 sedmice", "Generator popravki", LIMED,
     ["Model piše title, meta, alt, schemu", "Prikaz razlike prije i poslije",
      "Izvoz kao patch fajl", "I dalje bez pisanja po tuđem sajtu"],
     "Cilj: prvih deset ljudi pristane platiti."),
    ("Faza 3", "4 do 6 sedmica", "WordPress plugin i nalozi", BEST,
     ["Upis u bazu sajta", "Odobravanje i vraćanje unazad", "Prijava, pretplata, Stripe",
      "Search Console preko OAuth-a"],
     "Cilj: prvi stvarni novac na računu."),
    ("Faza 4", "poslije prihoda", "Dashboard i izvještaji", DIM,
     ["Više sajtova u jednom nalogu", "Bijela etiketa za agencije",
      "Zakazani mjesečni izvještaji", "Praćenje pozicija ako ga traže"],
     "Cilj: zadržati kupce i podići prosječnu cijenu."),
]
pcards = "".join(
    f'<div class="card" style="flex:1;display:flex;flex-direction:column">'
    f'<div class="row" style="justify-content:space-between;align-items:baseline">'
    f'<div style="font-size:12.5px;letter-spacing:1px;text-transform:uppercase;color:{c};'
    f'font-weight:700">{ph}</div>'
    f'<div style="font-size:12.5px;color:{DIM}">{dur}</div></div>'
    f'<div class="dsp" style="font-size:22px;margin:10px 0 12px 0">{title}</div>'
    + "".join(f'<div style="font-size:14px;color:{MUTED};padding:4px 0;line-height:1.45">{i}</div>'
              for i in items)
    + f'<div style="flex:1"></div>'
    f'<div style="font-size:13.5px;color:{TX};margin-top:14px;padding-top:12px;'
    f'border-top:1px solid {LINE};font-weight:600">{goal}</div></div>'
    for ph, dur, title, c, items, goal in phases
)
slides.append(slide(f"""
<div class="kick">Redoslijed gradnje</div>
<h1>Šta praviti prvo, i šta namjerno ne praviti</h1>
<div class="lead" style="margin-top:14px;max-width:1000px">Dashboard je posljednji, ne prvi.
Svaka faza završava nečim što možeš staviti pred čovjeka, a ne nečim što samo radi.</div>
<div class="row" style="gap:16px;margin-top:24px;height:400px">{pcards}</div>
""", 14))

# ----------------------------------------------------------- 15 not building
nots = [
    ("Indeks backlinkova", "Ahrefs ima 493 milijarde stranica i 35 biliona linkova. Ovo se ne sustiže, kupovina tuđeg API-ja te pravi preprodavcem s gorom verzijom."),
    ("Baza volumena ključnih riječi", "Licencira se od malog broja dobavljača po cijenama koje pretpostavljaju korporativni prihod."),
    ("Procjena prometa tuđih domena", "Traži panel podataka o ponašanju korisnika. Nije dostupno."),
    ("Dnevno praćenje pozicija u velikom obimu", "Najveći ponavljajući trošak kod svih konkurenata. Zato svi naplaćuju po broju praćenih riječi."),
    ("Lokalni grid rangiranja i upravljanje listingom", "Traži ugovore s agregatorima."),
]
nlist = "".join(
    f'<div style="display:flex;gap:14px;padding:13px 0;border-top:1px solid {LINE}">'
    f'<div style="color:{WORST};font-size:19px;line-height:1;padding-top:3px">&times;</div>'
    f'<div><div style="font-weight:700;font-size:16px">{t}</div>'
    f'<div style="font-size:14.5px;color:{MUTED};margin-top:3px;line-height:1.55">{d}</div></div></div>'
    for t, d in nots
)
slides.append(slide(f"""
<div class="kick">Granice</div>
<h1>Pet stvari koje se ne grade, nikad</h1>
<div class="lead" style="margin-top:14px;max-width:960px">Ovo nije skromnost nego računica.
Svaka od njih pretvara varijabilni trošak od pola dolara u desetine dolara po kupcu i briše
maržu od 95 posto na kojoj cijeli model stoji.</div>
<div style="margin-top:20px">{nlist}</div>
""", 15))

# ----------------------------------------------------------- 16 decision
slides.append(slide(f"""
<div style="position:absolute;right:-160px;bottom:-200px;width:520px;height:520px;
     border-radius:50%;background:#1E2130"></div>
<div style="position:relative">
<div class="kick">Odluka</div>
<h1 style="max-width:860px;color:#FFFFFF">Tri pitanja prije prve linije koda</h1>
<div style="margin-top:34px;max-width:900px">
  <div style="display:flex;gap:18px;padding:18px 0;border-top:1px solid #2A2D3C">
    <div class="mono" style="color:{LIME};font-size:16px;padding-top:2px">01</div>
    <div><div style="font-size:19px;font-weight:700;color:#FFFFFF">Kome prvo prodaješ,
    agenciji ili vlasniku sajta?</div>
    <div style="font-size:15.5px;color:#A9AEC2;margin-top:5px;line-height:1.6">Model kaže
    agencijama: sedam puta veći račun, duže ostaju, same donose sajtove. Ali njih je teže
    naći i sporije odlučuju.</div></div></div>
  <div style="display:flex;gap:18px;padding:18px 0;border-top:1px solid #2A2D3C">
    <div class="mono" style="color:{LIME};font-size:16px;padding-top:2px">02</div>
    <div><div style="font-size:19px;font-weight:700;color:#FFFFFF">Koji je prvi kanal,
    konkretno?</div>
    <div style="font-size:15.5px;color:#A9AEC2;margin-top:5px;line-height:1.6">Razlika između
    najgoreg i najboljeg scenarija je dvadesetostruka i leži skoro cijela ovdje. Bez odgovora
    na ovo pitanje osnovni scenarij je pobožna želja.</div></div></div>
  <div style="display:flex;gap:18px;padding:18px 0;border-top:1px solid #2A2D3C;
       border-bottom:1px solid #2A2D3C">
    <div class="mono" style="color:{LIME};font-size:16px;padding-top:2px">03</div>
    <div><div style="font-size:19px;font-weight:700;color:#FFFFFF">Hoćeš li tražiti novac
    prije nego što išta proradi?</div>
    <div style="font-size:15.5px;color:#A9AEC2;margin-top:5px;line-height:1.6">Faza 1 traje
    tri sedmice i dovoljna je da se to pita. Odgovor na to pitanje vrijedi više od svih
    brojki u ovom dokumentu.</div></div></div>
</div>
</div>
""", 16, dark=True))

html = ("<!doctype html><html><head><meta charset='utf-8'><title>Tidywright scenariji</title>"
        f"<style>{CSS}</style></head><body>" + "".join(slides) + "</body></html>")

for bad in ("\u2014", "\u2013"):
    assert bad not in html, f"dash {bad!r} found"

open("/home/claude/model/deck.html", "w").write(html)
print("slides:", len(slides), "bytes:", len(html))
