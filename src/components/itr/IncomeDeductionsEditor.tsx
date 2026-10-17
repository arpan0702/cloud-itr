"use client";

import React from "react";
import { ClientProfile, HousePropertyDetails, UpdatedReturnDetails } from "@/lib/itr/types";

interface Props {
  profile: ClientProfile;
  onChange: (updated: ClientProfile) => void;
  activeSubTab: string;
  onSelectSubTab: (tab: string) => void;
}

export function IncomeDeductionsEditor({
  profile,
  onChange,
  activeSubTab,
  onSelectSubTab,
}: Props) {
  const tabs = [
    { id: "personal", label: "1. Personal & Bank" },
    { id: "salary", label: "2. Salary & HRA" },
    { id: "house", label: "3. House Property" },
    { id: "capital", label: "4. Capital Gains" },
    { id: "business", label: "5. Business & 44AD/ADA" },
    { id: "other", label: "6. Other Sources" },
    { id: "deductions", label: "7. Chapter VI-A" },
    { id: "tds", label: "8. TDS & Advance Tax" },
    { id: "updated", label: "9. ITR-U (Sec 139(8A))" },
  ];

  const updateProfile = (updater: (prev: ClientProfile) => ClientProfile) => {
    const next = updater(JSON.parse(JSON.stringify(profile)));
    next.lastUpdated = new Date().toISOString();
    onChange(next);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 mb-8 shadow-xl">
      {/* Sub tabs navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-5 border-b border-neutral-900 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectSubTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === t.id
                ? "bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20"
                : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Personal & Bank */}
      {activeSubTab === "personal" && (
        <div className="space-y-4 text-xs">
          <h4 className="text-sm font-bold text-white mb-2">Personal & Bank Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-neutral-400 block mb-1">PAN Number *</label>
              <input
                type="text"
                value={profile.personal.pan}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.personal.pan = e.target.value.toUpperCase();
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#22c55e] focus:outline-none"
                placeholder="ABCDE1234F"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Aadhaar Number (12 digits)</label>
              <input
                type="text"
                value={profile.personal.aadhaar}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.personal.aadhaar = e.target.value;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#22c55e] focus:outline-none"
                placeholder="12-digit Aadhaar"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Date of Birth</label>
              <input
                type="date"
                value={profile.personal.dob}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.personal.dob = e.target.value;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:border-[#22c55e] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">First Name *</label>
              <input
                type="text"
                value={profile.personal.firstName}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.personal.firstName = e.target.value;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:border-[#22c55e] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Last Name *</label>
              <input
                type="text"
                value={profile.personal.lastName}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.personal.lastName = e.target.value;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:border-[#22c55e] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Mobile Number *</label>
              <input
                type="text"
                value={profile.personal.mobile}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.personal.mobile = e.target.value;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:border-[#22c55e] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-900">
            <h5 className="text-xs font-bold text-neutral-300 mb-2">Primary Refund Bank Account</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-neutral-400 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={profile.personal.bankAccounts[0]?.bankName || ""}
                  onChange={(e) =>
                    updateProfile((p) => {
                      if (!p.personal.bankAccounts[0]) {
                        p.personal.bankAccounts[0] = {
                          id: "b1",
                          bankName: "",
                          ifscCode: "",
                          accountNumber: "",
                          accountType: "SAVINGS",
                          isPrimaryForRefund: true,
                        };
                      }
                      p.personal.bankAccounts[0].bankName = e.target.value;
                      return p;
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">IFSC Code *</label>
                <input
                  type="text"
                  value={profile.personal.bankAccounts[0]?.ifscCode || ""}
                  onChange={(e) =>
                    updateProfile((p) => {
                      if (p.personal.bankAccounts[0]) {
                        p.personal.bankAccounts[0].ifscCode = e.target.value.toUpperCase();
                      }
                      return p;
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm uppercase"
                  placeholder="HDFC0001234"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Account Number *</label>
                <input
                  type="text"
                  value={profile.personal.bankAccounts[0]?.accountNumber || ""}
                  onChange={(e) =>
                    updateProfile((p) => {
                      if (p.personal.bankAccounts[0]) {
                        p.personal.bankAccounts[0].accountNumber = e.target.value;
                      }
                      return p;
                    })
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Salary & HRA */}
      {activeSubTab === "salary" && (
        <div className="space-y-4 text-xs">
          <h4 className="text-sm font-bold text-white mb-2">Salary & Allowances (Form 16 Part B)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-neutral-400 block mb-1">Gross Salary u/s 17(1) (₹)</label>
              <input
                type="number"
                value={profile.salary.grossSalary}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.salary.grossSalary = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Perquisites u/s 17(2) (₹)</label>
              <input
                type="number"
                value={profile.salary.perquisitesValue}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.salary.perquisitesValue = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">HRA Received (₹)</label>
              <input
                type="number"
                value={profile.salary.hraReceived}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.salary.hraReceived = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Actual Annual Rent Paid (₹)</label>
              <input
                type="number"
                value={profile.salary.actualRentPaid}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.salary.actualRentPaid = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isMetro"
                checked={profile.salary.isMetroCity}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.salary.isMetroCity = e.target.checked;
                    return p;
                  })
                }
                className="w-4 h-4 accent-[#22c55e]"
              />
              <label htmlFor="isMetro" className="text-neutral-300">
                Accommodation in Metro City (50% HRA limit)
              </label>
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Professional Tax Paid (₹)</label>
              <input
                type="number"
                value={profile.salary.professionalTax}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.salary.professionalTax = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: House Property */}
      {activeSubTab === "house" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">House Property Schedule</h4>
            <button
              onClick={() =>
                updateProfile((p) => {
                  p.houseProperties.push({
                    id: `hp_${Date.now()}`,
                    propertyType: "LET_OUT",
                    annualGrossRent: 0,
                    municipalTaxesPaid: 0,
                    homeLoanInterest: 0,
                    preConstructionInterest: 0,
                  });
                  return p;
                })
              }
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer"
            >
              + Add Property
            </button>
          </div>

          {profile.houseProperties.length === 0 ? (
            <div className="p-4 rounded-xl bg-neutral-900/40 text-neutral-400 text-center">
              No house property declared. Click &quot;+ Add Property&quot; if you own self-occupied or rented property.
            </div>
          ) : (
            profile.houseProperties.map((hp, idx) => (
              <div
                key={hp.id}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Property #{idx + 1}</span>
                  <button
                    onClick={() =>
                      updateProfile((p) => {
                        p.houseProperties = p.houseProperties.filter((item) => item.id !== hp.id);
                        return p;
                      })
                    }
                    className="text-red-400 hover:text-red-300 text-xs font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Property Type</label>
                    <select
                      value={hp.propertyType}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const target = p.houseProperties.find((i) => i.id === hp.id);
                          if (target) target.propertyType = e.target.value as HousePropertyDetails["propertyType"];
                          return p;
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="SELF_OCCUPIED">Self-Occupied</option>
                      <option value="LET_OUT">Let-Out (Rented)</option>
                      <option value="DEEMED_LET_OUT">Deemed Let-Out</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Annual Rent Received (₹)</label>
                    <input
                      type="number"
                      disabled={hp.propertyType === "SELF_OCCUPIED"}
                      value={hp.annualGrossRent}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const target = p.houseProperties.find((i) => i.id === hp.id);
                          if (target) target.annualGrossRent = Number(e.target.value) || 0;
                          return p;
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Home Loan Interest u/s 24(b) (₹)
                    </label>
                    <input
                      type="number"
                      value={hp.homeLoanInterest}
                      onChange={(e) =>
                        updateProfile((p) => {
                          const target = p.houseProperties.find((i) => i.id === hp.id);
                          if (target) target.homeLoanInterest = Number(e.target.value) || 0;
                          return p;
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Capital Gains */}
      {activeSubTab === "capital" && (
        <div className="space-y-4 text-xs">
          <h4 className="text-sm font-bold text-white mb-2">Capital Gains Schedule (Sec 111A / 112A)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <label className="text-neutral-300 font-bold block mb-1">
                STCG u/s 111A (Listed Equities / Equity MFs)
              </label>
              <p className="text-[11px] text-neutral-500 mb-2">
                Taxed at 20% (post-July 2024 Budget) or 15% pre.
              </p>
              <input
                type="number"
                value={profile.capitalGains.stcg111A}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.capitalGains.stcg111A = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <label className="text-neutral-300 font-bold block mb-1">
                LTCG u/s 112A (Listed Equities / Equity MFs)
              </label>
              <p className="text-[11px] text-neutral-500 mb-2">
                First ₹1,25,000 exempt; balance taxed at 12.5%.
              </p>
              <input
                type="number"
                value={profile.capitalGains.ltcg112A}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.capitalGains.ltcg112A = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="foreignAssets"
              checked={profile.hasForeignAssetsOrIncome}
              onChange={(e) =>
                updateProfile((p) => {
                  p.hasForeignAssetsOrIncome = e.target.checked;
                  return p;
                })
              }
              className="w-4 h-4 accent-[#22c55e]"
            />
            <label htmlFor="foreignAssets" className="text-neutral-300">
              Taxpayer holds Foreign Assets, US Equities (Vested RSUs/ESOPs), or Foreign Bank Accounts (Triggers Schedule FA in ITR-2)
            </label>
          </div>
        </div>
      )}

      {/* Tab 5: Business & Presumptive */}
      {activeSubTab === "business" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="isPresumptive"
              checked={profile.presumptive.isApplicable}
              onChange={(e) =>
                updateProfile((p) => {
                  p.presumptive.isApplicable = e.target.checked;
                  return p;
                })
              }
              className="w-4 h-4 accent-[#22c55e]"
            />
            <label htmlFor="isPresumptive" className="text-sm font-bold text-white">
              Enable Presumptive Taxation (Section 44AD / 44ADA / Schedule BPS)
            </label>
          </div>

          {profile.presumptive.isApplicable && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-400 block mb-1">
                    44AD Turnover via Digital / Bank Channels (₹) [@ 6%]
                  </label>
                  <input
                    type="number"
                    value={profile.presumptive.grossTurnoverDigital}
                    onChange={(e) =>
                      updateProfile((p) => {
                        p.presumptive.grossTurnoverDigital = Number(e.target.value) || 0;
                        return p;
                      })
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">
                    44ADA Gross Professional Receipts (₹) [Min 50% profit]
                  </label>
                  <input
                    type="number"
                    value={profile.presumptive.grossReceipts44ADA}
                    onChange={(e) =>
                      updateProfile((p) => {
                        p.presumptive.grossReceipts44ADA = Number(e.target.value) || 0;
                        return p;
                      })
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Schedule BPS / Balance sheet */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h5 className="font-bold text-white">
                  Schedule BPS: Financial Particulars of Business (Assets & Liabilities)
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Cash in Hand</label>
                    <input
                      type="number"
                      value={profile.presumptive.balanceSheet.cashInHand}
                      onChange={(e) =>
                        updateProfile((p) => {
                          p.presumptive.balanceSheet.cashInHand = Number(e.target.value) || 0;
                          return p;
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Bank Balances</label>
                    <input
                      type="number"
                      value={profile.presumptive.balanceSheet.bankBalances}
                      onChange={(e) =>
                        updateProfile((p) => {
                          p.presumptive.balanceSheet.bankBalances = Number(e.target.value) || 0;
                          return p;
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Sundry Debtors</label>
                    <input
                      type="number"
                      value={profile.presumptive.balanceSheet.sundryDebtors}
                      onChange={(e) =>
                        updateProfile((p) => {
                          p.presumptive.balanceSheet.sundryDebtors = Number(e.target.value) || 0;
                          return p;
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Proprietor Capital</label>
                    <input
                      type="number"
                      value={profile.presumptive.balanceSheet.proprietorCapital}
                      onChange={(e) =>
                        updateProfile((p) => {
                          p.presumptive.balanceSheet.proprietorCapital = Number(e.target.value) || 0;
                          return p;
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Other Sources */}
      {activeSubTab === "other" && (
        <div className="space-y-4 text-xs">
          <h4 className="text-sm font-bold text-white mb-2">Income from Other Sources</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-neutral-400 block mb-1">Savings Bank Interest (₹)</label>
              <input
                type="number"
                value={profile.otherSources.savingsBankInterest}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.otherSources.savingsBankInterest = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Fixed Deposit (FD) Interest (₹)</label>
              <input
                type="number"
                value={profile.otherSources.fixedDepositInterest}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.otherSources.fixedDepositInterest = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Dividend Income (₹)</label>
              <input
                type="number"
                value={profile.otherSources.dividendIncome}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.otherSources.dividendIncome = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Agricultural Income (₹)</label>
              <input
                type="number"
                value={profile.otherSources.agriculturalIncome}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.otherSources.agriculturalIncome = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
                placeholder="<= 5000 in ITR-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Chapter VI-A Deductions */}
      {activeSubTab === "deductions" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Deductions under Chapter VI-A</h4>
            <span className="text-[11px] text-neutral-400">
              Note: Allowed predominantly under <b>Old Regime</b>. (80CCD(2) allowed in both).
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-neutral-400 block mb-1">Section 80C (Cap ₹1.5L)</label>
              <input
                type="number"
                value={profile.deductions.sec80C}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.deductions.sec80C = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Section 80CCD(1B) NPS Self (Cap ₹50k)</label>
              <input
                type="number"
                value={profile.deductions.sec80CCD1B}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.deductions.sec80CCD1B = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Section 80CCD(2) Employer NPS (Both Regimes)</label>
              <input
                type="number"
                value={profile.deductions.sec80CCD2}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.deductions.sec80CCD2 = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Section 80D Health Insurance (Self/Family)</label>
              <input
                type="number"
                value={profile.deductions.sec80D_Self}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.deductions.sec80D_Self = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Section 80D Health Insurance (Parents)</label>
              <input
                type="number"
                value={profile.deductions.sec80D_Parents}
                onChange={(e) =>
                  updateProfile((p) => {
                    p.deductions.sec80D_Parents = Number(e.target.value) || 0;
                    return p;
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: TDS & Advance Tax */}
      {activeSubTab === "tds" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">TDS Claimed & Advance Tax Paid</h4>
            <button
              onClick={() =>
                updateProfile((p) => {
                  p.tdsRecords.push({
                    id: `tds_${Date.now()}`,
                    type: "OTHER",
                    tan: "BLRX00000A",
                    deductorName: "NEW DEDUCTOR",
                    grossAmount: 50000,
                    tdsDeducted: 5000,
                    tdsClaimed: 5000,
                    financialYear: p.fiscalYear,
                    matchedWith26AS: true,
                  });
                  return p;
                })
              }
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold cursor-pointer"
            >
              + Add TDS Entry
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left">
              <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">TAN</th>
                  <th className="p-2.5">Deductor Name</th>
                  <th className="p-2.5 text-right">Gross (₹)</th>
                  <th className="p-2.5 text-right">TDS Claimed (₹)</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {profile.tdsRecords.map((t) => (
                  <tr key={t.id}>
                    <td className="p-2.5 font-mono">{t.tan}</td>
                    <td className="p-2.5 font-medium">{t.deductorName}</td>
                    <td className="p-2.5 text-right font-mono">₹{t.grossAmount.toLocaleString("en-IN")}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#22c55e]">
                      ₹{t.tdsClaimed.toLocaleString("en-IN")}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() =>
                          updateProfile((p) => {
                            p.tdsRecords = p.tdsRecords.filter((item) => item.id !== t.id);
                            return p;
                          })
                        }
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 9: Updated Return (ITR-U) */}
      {activeSubTab === "updated" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="isUpdated"
              checked={profile.updatedReturn.isUpdatedReturn}
              onChange={(e) =>
                updateProfile((p) => {
                  p.updatedReturn.isUpdatedReturn = e.target.checked;
                  if (e.target.checked) p.selectedForm = "ITR-U";
                  return p;
                })
              }
              className="w-4 h-4 accent-[#22c55e]"
            />
            <label htmlFor="isUpdated" className="text-sm font-bold text-white">
              File as Updated Return under Section 139(8A) [ITR-U]
            </label>
          </div>

          {profile.updatedReturn.isUpdatedReturn && (
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <p className="text-xs text-neutral-400">
                Section 139(8A) allows taxpayers to update their returns within 24 months from the end of the relevant Assessment Year upon paying additional tax.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">
                    Filing Window Period
                  </label>
                  <select
                    value={profile.updatedReturn.filingPeriod}
                    onChange={(e) =>
                      updateProfile((p) => {
                        p.updatedReturn.filingPeriod = e.target.value as UpdatedReturnDetails["filingPeriod"];
                        return p;
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="WITHIN_12_MONTHS">
                      Within 12 months from end of AY (25% Additional Tax)
                    </option>
                    <option value="BETWEEN_12_AND_24_MONTHS">
                      Between 12 and 24 months from end of AY (50% Additional Tax)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">
                    Reason for Updating Return
                  </label>
                  <select
                    value={profile.updatedReturn.reasonCode}
                    onChange={(e) =>
                      updateProfile((p) => {
                        p.updatedReturn.reasonCode = e.target.value as UpdatedReturnDetails["reasonCode"];
                        return p;
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="PREVIOUSLY_NOT_FILED">Return previously not filed</option>
                    <option value="INCOME_NOT_REPORTED">Income not reported correctly</option>
                    <option value="WRONG_HEAD_OF_INCOME">Wrong head of income chosen</option>
                    <option value="REDUCTION_OF_LOSSES">Reduction of carried forward loss</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
