import { useEffect } from "react";
import {
  HV_VOLTAGE_OPTIONS,
  LV_VOLTAGE_OPTIONS,
  C_FACTOR_OPTIONS,
  validateInputs,
} from "../utils/faultUtils";

function FieldCard({ label, unit, children }) {
  return (
    <div className="summary-chip">
      <div className="summary-label">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <div className="summary-input-wrap flex-none">{children}</div>
        <span className="unit-base shrink-0">{unit}</span>
      </div>
    </div>
  );
}

function CheckboxCard({ label, checked, onChange, note }) {
  return (
    <div className="summary-chip-checkbox">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{label}</span>
        </label>
        <span className="text-sm font-mono text-slate-300">{note}</span>
      </div>
    </div>
  );
}

function ResultTile({ label, value, highlight = false, compact = false }) {
  return (
    <div
      className={
        highlight
          ? `result-tile result-tile-primary ${compact ? "w-full max-w-[260px]" : ""}`
          : `result-tile result-tile-alert ${compact ? "w-full max-w-[260px]" : ""}`
      }
    >
      <div
        className={
          highlight
            ? "mb-1 text-sm text-white/85"
            : "mb-1 text-sm text-slate-300"
        }
      >
        {label}
      </div>
      <div
        className={
          highlight
            ? "text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
            : "text-xl font-extrabold tracking-tight text-slate-50 sm:text-2xl"
        }
      >
        {value}
      </div>
    </div>
  );
}

export default function ResultsCard({
  values,
  setValues,
  result,
  error,
  step,
  setStep,
  onReset,
}) {
  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  const validation = validateInputs(values);
  const canProceed = validation.valid;

  const kTDisplay = result?.K_T ? result.K_T.toFixed(4) : "-";
  const appliedKtDisplay = result?.K_T_applied
    ? result.K_T_applied.toFixed(4)
    : "-";

  function handleNext() {
    if (step < 3 && canProceed) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  const padLabel = (label, width = 26) => label.padEnd(width, " ");

  const summaryText = result
    ? [
        `${padLabel("Grid Voltage")} : ${values.gridKV} kV`,
        `${padLabel("Grid Fault Level")} : ${values.gridKA} kA`,
        `${padLabel("C-Factor")} : ${values.cFactor}`,
        `${padLabel("Grid X/R")} : ${values.gridXR}`,
        `${padLabel("Transformer Rating")} : ${values.txMVA} MVA`,
        `${padLabel("Transformer HV")} : ${values.txHV} kV`,
        `${padLabel("Transformer LV")} : ${values.txLV} kV`,
        `${padLabel("Transformer Z")} : ${values.txZ} %`,
        `${padLabel("Consider K-Factor")} : ${
          values.considerKFactor ? "Yes" : "No"
        }`,
        `${padLabel("Calculated K_T")} : ${kTDisplay}`,
        `${padLabel("Applied K_T")} : ${appliedKtDisplay}`,
        ``,
        `Impedances on 100 MVA Base`,
        `${padLabel("Grid Z")} : ${result.Z_grid_mag_pu.toFixed(4)} pu`,
        `${padLabel("Transformer Z")} : ${result.Z_TX_pu.toFixed(4)} pu`,
        `${padLabel("Total Z")} : ${result.Ztot_pu.toFixed(4)} pu`,
      ].join("\n")
    : "";
  useEffect(() => {
  function handleKeyDown(e) {
    // Ignore if user is typing in input/select/textarea
    const tag = e.target.tagName.toLowerCase();
    if (tag === "textarea") return;

    if (e.key === "Enter" || e.key === "ArrowRight") {
      if (step < 3 && canProceed) {
        e.preventDefault();
        setStep(step + 1);
      }
    }

    if (e.key === "ArrowLeft") {
      if (step > 1) {
        e.preventDefault();
        setStep(step - 1);
      }
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [step, canProceed, setStep]);
  

  return (
    <section className="glass-card p-4 sm:p-5">
      <div className="mb-4 sm:mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
          Fault Level Calculator
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          IEC60909 Short Circuit Calculator
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div
          className={
            step >= 1
              ? "h-2 flex-1 rounded-full bg-cyan-400"
              : "h-2 flex-1 rounded-full bg-white/10"
          }
        />
        <div
          className={
            step >= 2
              ? "h-2 flex-1 rounded-full bg-cyan-400"
              : "h-2 flex-1 rounded-full bg-white/10"
          }
        />
        <div
          className={
            step >= 3
              ? "h-2 flex-1 rounded-full bg-cyan-400"
              : "h-2 flex-1 rounded-full bg-white/10"
          }
        />
      </div>

      <div className="mb-5 text-sm font-medium text-slate-300">
        {step === 1 && "Step 1 of 3 : Grid Parameters"}
        {step === 2 && "Step 2 of 3 : Transformer Parameters"}
        {step === 3 && "Step 3 of 3 : Results Summary"}
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-orange-400/40 bg-orange-500/10 px-3 py-2 text-sm font-semibold text-orange-200">
          {error}
        </div>
      ) : null}

      {step === 1 && (
        <div className="flex flex-col gap-3 sm:gap-4">
          <FieldCard label="Grid Voltage" unit="kV">
            <select
              className="input-inline w-[6.5rem] sm:w-[7rem]"
              value={values.gridKV}
              onChange={(e) => updateField("gridKV", e.target.value)}
            >
              {HV_VOLTAGE_OPTIONS.map((v) => (
                <option
                  key={v.value}
                  value={v.value}
                  className="bg-slate-900 text-white"
                >
                  {v.label}
                </option>
              ))}
            </select>
          </FieldCard>

          <FieldCard label="Grid Fault Level" unit="kA">
            <input
              className="input-inline w-[6.5rem] sm:w-[7rem]"
              type="number"
              step="any"
              value={values.gridKA}
              onChange={(e) => updateField("gridKA", e.target.value)}
            />
          </FieldCard>

          <FieldCard label="C-Factor" unit="">
            <select
              className="input-inline w-[6.5rem] sm:w-[7rem]"
              value={values.cFactor}
              onChange={(e) => updateField("cFactor", e.target.value)}
            >
              {C_FACTOR_OPTIONS.map((v) => (
                <option
                  key={v.value}
                  value={v.value}
                  className="bg-slate-900 text-white"
                >
                  {v.label}
                </option>
              ))}
            </select>
          </FieldCard>

          <FieldCard label="X/R" unit="">
            <input
              className="input-inline w-[6.5rem] sm:w-[7rem]"
              type="number"
              step="any"
              value={values.gridXR}
              onChange={(e) => updateField("gridXR", e.target.value)}
            />
          </FieldCard>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3 sm:gap-4">
          <FieldCard label="Transformer Rating" unit="MVA">
            <input
              className="input-inline w-[6.5rem] sm:w-[7rem]"
              type="number"
              step="any"
              value={values.txMVA}
              onChange={(e) => updateField("txMVA", e.target.value)}
            />
          </FieldCard>

          <FieldCard label="Transformer HV" unit="kV">
            <select
              className="input-inline w-[6.5rem] sm:w-[7rem]"
              value={values.txHV}
              onChange={(e) => updateField("txHV", e.target.value)}
            >
              {HV_VOLTAGE_OPTIONS.map((v) => (
                <option
                  key={v.value}
                  value={v.value}
                  className="bg-slate-900 text-white"
                >
                  {v.label}
                </option>
              ))}
            </select>
          </FieldCard>

          <FieldCard label="Transformer LV" unit="kV">
            <select
              className="input-inline w-[6.5rem] sm:w-[7rem]"
              value={values.txLV}
              onChange={(e) => updateField("txLV", e.target.value)}
            >
              {LV_VOLTAGE_OPTIONS.map((v) => (
                <option
                  key={v.value}
                  value={v.value}
                  className="bg-slate-900 text-white"
                >
                  {v.label}
                </option>
              ))}
            </select>
          </FieldCard>

          <FieldCard label="Transformer Z" unit="%">
            <input
              className="input-inline w-[6.5rem] sm:w-[7rem]"
              type="number"
              step="any"
              value={values.txZ}
              onChange={(e) => updateField("txZ", e.target.value)}
            />
          </FieldCard>

          <CheckboxCard
            label="Consider Transformer K-Factor"
            checked={values.considerKFactor}
            onChange={(checked) => updateField("considerKFactor", checked)}
            note={
              <>
                K<sub>t</sub> = {kTDisplay}
              </>
            }
          />
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          {result ? (
            <>
              <div className="flex justify-start">
                <ResultTile
                  label="LV Fault Current"
                  value={`${result.IF_max.toFixed(2)} kA`}
                  highlight
                  compact
                />
              </div>

              <div className="divider" />

              <textarea
                readOnly
                value={summaryText}
                rows={15}
                className="w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-4 font-mono text-xs leading-5 text-slate-100 outline-none"
              />
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
              Enter valid positive values. Transformer LV must stay lower than
              Transformer HV.
            </div>
          )}
        </div>
      )}

      <div className="divider" />

      <div className="mt-2 flex items-center justify-center gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Reset
          </button>
        )}
      </div>
    </section>
  );
}