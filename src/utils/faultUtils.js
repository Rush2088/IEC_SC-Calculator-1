export const HV_VOLTAGE_OPTIONS = [
  {value: '500', label: '500'},
  {value: '330', label: '330'},
  {value: '275', label: '275'},
  {value: '220', label: '220'},
  {value: '132', label: '132'},
  {value: '66', label: '66'},
  {value: '33', label: '33'},
  {value: '11', label: '11'},
];

export const LV_VOLTAGE_OPTIONS = [
  {value: '132', label: '132'},
  {value: '66', label: '66'},
  {value: '33', label: '33'},
  {value: '11', label: '11'},
  {value: '0.77', label: '0.770'},
  {value: '0.69', label: '0.690'},
  {value: '0.66', label: '0.660'},
  {value: '0.415', label: '0.415'},
  {value: '0.4', label: '0.400'},
];

export const C_FACTOR_OPTIONS = [
  {value: '0.9', label: '0.9'},
  {value: '0.95', label: '0.95'},
  {value: '1.0', label: '1.0'},
  {value: '1.1', label: '1.1'},
];

export const DEFAULT_VALUES = {
  gridKV: '330',
  gridKA: '50',
  cFactor: '1.1',
  gridXR: '14',
  txMVA: '180',
  txHV: '330',
  txLV: '33',
  txZ: '14.5',
  considerKFactor: false,
};

export function calculateFaultLevel(
    gridKV, gridKA, cFactor = 1.1, gridXR = 14, txMVA, txHV, txLV, txZ,
    considerKFactor = false) {
  const Sbase = 100e6;

  const gridKVNum = Number(gridKV);
  const gridKANum = Number(gridKA);
  const cFactorNum = Number(cFactor);
  const gridXRNum = Number(gridXR);
  const txMVANum = Number(txMVA);
  const txHVNum = Number(txHV);
  const txLVNum = Number(txLV);
  const txZNum = Number(txZ);

  // Base currents
  const I_grid_base = Sbase / (Math.sqrt(3) * gridKVNum * 1e3);
  const I_lv_base = Sbase / (Math.sqrt(3) * txLVNum * 1e3);

  // Grid short-circuit level on 100 MVA base
  const If_grid_pu = (gridKANum * 1e3) / I_grid_base;

  // Magnitude of grid Thevenin impedance in pu on 100 MVA base
  const Z_grid_mag_pu = cFactorNum / If_grid_pu;

  // Split grid impedance using X/R
  // X/R = X / R
  // |Z| = sqrt(R^2 + X^2) = R * sqrt(1 + (X/R)^2)
  const R_grid_pu = Z_grid_mag_pu / Math.sqrt(1 + gridXRNum ** 2);
  const X_grid_pu = R_grid_pu * gridXRNum;

  // Transformer impedance on 100 MVA base
  const Z_TX_pu_uncorrected = (txZNum * 0.01 * Sbase) / (txMVANum * 1e6);

  // IEC 60909 transformer correction factor
  const xT = txZNum / 100;
  const K_T = (0.95 * cFactorNum) / (1 + 0.6 * xT);

  // Apply Kt only if checkbox is ticked
  const K_T_applied = considerKFactor ? K_T : 1;

  // Transformer impedance magnitude after K-factor application
  const Z_TX_pu = K_T_applied * Z_TX_pu_uncorrected;

  // Assume transformer impedance is predominantly reactive
  const R_TX_pu = 0;
  const X_TX_pu = Z_TX_pu;

  // Total impedance in pu
  const Rtot_pu = R_grid_pu + R_TX_pu;
  const Xtot_pu = X_grid_pu + X_TX_pu;
  const Ztot_pu = Math.sqrt(Rtot_pu ** 2 + Xtot_pu ** 2);

  // LV fault current
  const If_pu = cFactorNum / Ztot_pu;
  const IF_max = Math.round((If_pu * I_lv_base / 1e3) * 100) / 100;

  return {
    Sbase,

    // Inputs echoed back
    gridKV: gridKVNum,
    gridKA: gridKANum,
    cFactor: cFactorNum,
    gridXR: gridXRNum,
    txMVA: txMVANum,
    txHV: txHVNum,
    txLV: txLVNum,
    txZ: txZNum,
    considerKFactor,

    // Base currents
    I_grid_base,
    I_lv_base,

    // Grid values
    If_grid_pu,
    Z_grid_mag_pu,
    R_grid_pu,
    X_grid_pu,

    // Transformer values
    Z_TX_pu_uncorrected,
    K_T,
    K_T_applied,
    Z_TX_pu,
    R_TX_pu,
    X_TX_pu,

    // Total values
    Rtot_pu,
    Xtot_pu,
    Ztot_pu,
    If_pu,
    IF_max,

    kFactorApplied: considerKFactor,
  };
}

export function validateInputs(values) {
  const parsed = {
    gridKV: Number(values.gridKV),
    gridKA: Number(values.gridKA),
    cFactor: Number(values.cFactor),
    gridXR: Number(values.gridXR),
    txMVA: Number(values.txMVA),
    txHV: Number(values.txHV),
    txLV: Number(values.txLV),
    txZ: Number(values.txZ),
    considerKFactor: Boolean(values.considerKFactor),
  };

  const valid = [
    parsed.gridKV,
    parsed.gridKA,
    parsed.cFactor,
    parsed.gridXR,
    parsed.txMVA,
    parsed.txHV,
    parsed.txLV,
    parsed.txZ,
  ].every((v) => Number.isFinite(v) && v > 0);

  if (!valid) {
    return {
      valid: false,
      message: 'Please enter valid positive values for all parameters.',
      parsed,
    };
  }

  if (parsed.txLV >= parsed.txHV) {
    return {
      valid: false,
      message: 'Transformer LV must be lower than Transformer HV.',
      parsed,
    };
  }

  return {
    valid: true,
    message: '',
    parsed,
  };
}