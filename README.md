# CloudITR Pro — Cloud-Native Indian Income Tax Return (ITR) Compliance & Computation Engine

> **Deterministic, Zero-Error Tax Computation, AIS/26AS Discrepancy Reconciliation, Section 115BAC Dual-Regime Optimization, and Official Income Tax Department (ITD) Schema Return Generator for Chartered Accountants & Enterprises.**

Benchmark target: **KDK Spectrum Cloud (ExpressITR) / ClearTax TaxCloud**.

---

## 🏛 Executive Overview

CloudITR Pro is a cloud-native compliance workstation purpose-built for Chartered Accountants, corporate tax practitioners, and enterprises managing Indian Income Tax Returns for **Assessment Year 2025–26 (Fiscal Year 2024–25)**.

Financial inaccuracy carries severe statutory liabilities (Sections 270A, 271AAC, and 276C penalties). CloudITR Pro decouples orchestration from an immutable, deterministic tax calculation engine that executes with zero floating-point drift and validates payloads against active Income Tax Department schemas prior to submission.

---

## ⚡ Core Engine Architecture

1. **Statutory Rounding & Arithmetic Invariants**:
   - **Section 288A**: Total taxable income rounded to the nearest multiple of ₹10 (half-up).
   - **Section 288B**: Net tax payable or refundable rounded to the nearest multiple of ₹10 (half-up).
   - Zero IEEE-754 binary floating-point drift using deterministic half-up fixed arithmetic.

2. **Section 115BAC Dual-Regime Optimizer**:
   - Automatic comparative optimization between the Default New Tax Regime (Section 115BAC) and the Old Tax Regime.
   - Evaluates revised AY 2025-26 New Regime slabs (0-3L @ 0%, 3-7L @ 5%, 7-10L @ 10%, 10-12L @ 15%, 12-15L @ 20%, >15L @ 30%).
   - Section 87A rebate and marginal relief algorithm ensuring `Delta Tax <= Delta Taxable Income` above ₹7,00,000.
   - Surcharge tiers (10%, 15%, 25%) capped at 25% under New Regime (u/s 115BAC) and 37% under Old Regime.
   - Standard Deduction: ₹75,000 for salaried employees under New Regime (Finance Act 2024), ₹50,000 under Old Regime.

3. **Statutory Interest Engine (Sections 234A, 234B, 234C, 234F)**:
   - **Section 234A**: 1% per month for delay in filing return past July 31st / October 31st.
   - **Section 234B**: 1% per month if advance tax paid is below 90% of assessed tax.
   - **Section 234C**: Quarterly shortfall interest schedule (15% by 15-Jun, 45% by 15-Sep, 75% by 15-Dec, 100% by 15-Mar).
   - **Section 234F**: Mandatory late filing fee (₹5,000 for income > ₹5L, ₹1,000 for income <= ₹5L).

4. **Capital Gains & Grandfathering Engine**:
   - Short Term Capital Gains u/s 111A taxed at 20% (Finance (No. 2) Act 2024).
   - Long Term Capital Gains u/s 112A taxed at 12.5% with ₹1,25,000 statutory exemption threshold.
   - Section 55(2)(ac) grandfathering formula: `Cost of Acquisition = max(Actual Cost, min(FMV as on 31-Jan-2018, Full Value Consideration))`.

5. **Inter-Head & Intra-Head Loss Set-Off Matrix**:
   - Section 70: Intra-head set-off (speculative loss restricted to speculative gain, STCL set off against STCG/LTCG, LTCL set off only against LTCG).
   - Section 71: Inter-head set-off (House Property loss set-off capped strictly at ₹2,00,000 u/s 71(3A); business loss prohibited from setting off against salary u/s 71(2A)).

6. **Statutory Form Classifier**:
   - Deterministic rule engine inferring appropriate ITR form (ITR-1 Sahaj, ITR-2, ITR-3, ITR-4 Sugam, or ITR-U) based on income sources, presumptive provisions (44AD, 44ADA, 44AE), directorships, unlisted equity, and turnover.

7. **Proactive AIS / 26AS Discrepancy Reconciler**:
   - Programmatic diff reconciliation between declared schedules and pre-filled Annual Information Statement (AIS) & Form 26AS records.
   - Flags under-reported interest/dividend, uncredited TDS, and high-value transactions.

8. **Pre-Flight Schema Gatekeeper & ITD JSON Return Generator**:
   - Schema validation gatekeeper blocking export upon structural or mathematical errors (invalid PAN checksum, balance sheet imbalance, missing bank IFSC).
   - Validated profiles compile into the official ITD schema JSON ready for direct upload to `eportal.incometax.gov.in`.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (Strict Mode, Zero `any`)
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Test Runner**: Node.js Native Test Runner (`tsx --test`)
- **Determinism**: 100% pure functional arithmetic engine

---

## 🧪 Automated Test Suite

```bash
# Run test suite
npm test
```

Test coverage includes 22 deterministic tests verifying:
- Sec 288A/B rounding invariants
- Sec 87A rebate & marginal relief formulas
- Sec 234A/B/C/F interest schedules
- Sec 55(2)(ac) capital gains grandfathering
- Sec 70/71 loss set-off matrix
- Statutory ITR form classifier
- Pre-flight schema gatekeeper & ITD JSON generator

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/arpan0702/cloud-itr.git
cd cloud-itr

# Install dependencies
npm install

# Run dev server on port 3002
npm run dev

# Run production build
npm run build
npm start
```

---

## ⚖️ License

MIT License. Engineered by [Arpan Dutta](https://nafisi.in).
