import { useMemo, useState } from "react";
import ResultsCard from "../components/ResultsCard";
import {
  DEFAULT_VALUES,
  calculateFaultLevel,
  validateInputs,
} from "../utils/faultUtils";

export default function Home() {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [step, setStep] = useState(1);

  const { result, error } = useMemo(() => {
    const validation = validateInputs(values);

    if (!validation.valid) {
      return { result: null, error: validation.message };
    }

    const {
      gridKV,
      gridKA,
      cFactor,
      gridXR,
      txMVA,
      txHV,
      txLV,
      txZ,
      considerKFactor,
    } = validation.parsed;

    return {
      result: calculateFaultLevel(
        gridKV,
        gridKA,
        cFactor,
        gridXR,
        txMVA,
        txHV,
        txLV,
        txZ,
        considerKFactor
      ),
      error: "",
    };
  }, [values]);

  function handleReset() {
    setValues(DEFAULT_VALUES);
    setStep(1);
  }

  function handleStepChange(nextStep) {
    if (nextStep === 2 && step === 1) {
      setValues((prev) => ({
        ...prev,
        txHV: prev.gridKV,
      }));
    }
    setStep(nextStep);
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[820px]">
        <ResultsCard
          values={values}
          setValues={setValues}
          result={result}
          error={error}
          step={step}
          setStep={handleStepChange}
          onReset={handleReset}
        />
      </div>
    </main>
  );
}