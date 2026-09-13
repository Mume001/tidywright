import json

STRIPE_PCT, STRIPE_FIX = 0.029, 0.30
PLANS = {  # name: (price, avg sites per customer)
    "solo":   (29, 1.0),
    "studio": (69, 2.2),
    "agency": (199, 9.0),
}
COST_SITE_STEADY = 0.45   # crawl 0.05 + LLM 0.25 + weekly rank tracking 0.13
COST_SITE_FIRST  = 2.45   # first full-site LLM pass

def arpu_and_cost(mix):
    arpu = sum(PLANS[p][0] * w for p, w in mix.items())
    sites = sum(PLANS[p][1] * w for p, w in mix.items())
    stripe = sum((PLANS[p][0] * STRIPE_PCT + STRIPE_FIX) * w for p, w in mix.items())
    return arpu, sites, stripe

def fixed_cost(n):
    if n < 25:   return 50
    if n < 100:  return 95
    if n < 250:  return 180
    if n < 500:  return 320
    return 520

def run(name, mix, build_months, adds, churn, months=24):
    arpu, sites, stripe = arpu_and_cost(mix)
    n = 0.0
    rows, cum = [], 0.0
    for m in range(1, months + 1):
        if m <= build_months:
            gross = 0.0
        else:
            i = m - build_months - 1
            gross = adds[i] if i < len(adds) else adds[-1]
        churned = n * churn
        n = n - churned + gross
        mrr = n * arpu
        var = n * sites * COST_SITE_STEADY + gross * sites * (COST_SITE_FIRST - COST_SITE_STEADY)
        fee = n * stripe
        fx = fixed_cost(n)
        profit = mrr - var - fee - fx
        cum += profit
        rows.append(dict(month=m, customers=round(n, 1), gross=gross, churned=round(churned, 1),
                         mrr=round(mrr), var=round(var, 2), fee=round(fee, 2), fixed=fx,
                         profit=round(profit), cum=round(cum)))
    return dict(name=name, arpu=round(arpu, 2), sites=round(sites, 2),
                stripe=round(stripe, 2), churn=churn, build=build_months,
                ceiling=round(adds[-1] / churn), rows=rows)

scen = {
 "worst": run("Worst case",
      {"solo": .85, "studio": .13, "agency": .02}, 6,
      [1, 1, 2, 2, 2], 0.08),
 "base": run("Base case",
      {"solo": .70, "studio": .22, "agency": .08}, 4,
      [2, 3, 4, 5, 6, 7], 0.055),
 "best": run("Best case",
      {"solo": .55, "studio": .30, "agency": .15}, 3,
      [3, 5, 7, 9, 11, 13, 15, 16], 0.04),
}

for k, s in scen.items():
    r12, r24 = s["rows"][11], s["rows"][23]
    be = next((r["month"] for r in s["rows"] if r["cum"] > 0), None)
    s["m12"], s["m24"], s["breakeven_month"] = r12, r24, be
    s["hours"] = 87 * 24
    s["rate24"] = round(r24["cum"] / (87 * 24), 2)
    print(f'{k:6} ARPU ${s["arpu"]:6.2f}  ceiling {s["ceiling"]:4}  '
          f'm12 {r12["customers"]:6.1f} cust / ${r12["mrr"]:6} MRR  '
          f'm24 {r24["customers"]:6.1f} cust / ${r24["mrr"]:6} MRR  '
          f'cum ${r24["cum"]:8}  cash-positive month {be}')

json.dump(scen, open("scenarios.json", "w"), indent=1)

# plan level unit economics
print("\nplan            price  sites  stripe   data   net/mo  margin")
for p, (price, sites) in PLANS.items():
    fee = price * STRIPE_PCT + STRIPE_FIX
    data = sites * COST_SITE_STEADY
    net = price - fee - data
    print(f"{p:12} {price:7} {sites:6.1f} {fee:7.2f} {data:6.2f} {net:8.2f}  {net/price*100:5.1f}%")
