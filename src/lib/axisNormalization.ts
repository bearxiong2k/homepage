type AxisTaxonomy = {
  objects_vocab?: string[];
  rewrite_types?: Record<string, string>;
};

export type NormalizedAxes = {
  axis_C_object_vocab: string[];
  axis_D_rewrite_types: string[];
};

const FALLBACK_OBJECT = 'Uncategorized object';
const FALLBACK_REWRITE = 'Uncategorized rewrite';

const objectRules: Array<[string, RegExp]> = [
  ['macro template', /\b(macro|template|rtl|netlist|verilog|subcircuit|eda|apr|lef|lib)\b|\b(physical layout|macro layout|layout generation|layout artifact)\b/],
  ['hardware hierarchy', /\b(chip|tile|core|bank|subarray|mat|node|hierarchy|level|dpu|mram|wram|alu|interconnect|buffer|noc|h tree|memory hierarchy)\b/],
  ['crossbar / array', /\b(crossbar|array|xb|mvmu|ou|rram|reram|pcm|sram|bitcell|1t1r|wordline|bitline|compute lookup)\b/],
  ['operator graph', /\b(graph|operator|op|dag|onnx|torch|layer|conv|matmul|gemm|gemv)\b|\b(model graph|neural network|network topology)\b/],
  ['loop / tensor schedule', /\b(loop|tensor|schedule|tiling|partition|linalg|affine|polyhedral|dataflow|scatter|gather|einsum)\b|\b(loop tile|tensor tile)\b/],
  ['instruction stream', /\b(instruction|command|isa|microprogram|trace|meta op|program|kernel|launch|code|stream)\b/],
  ['numeric format', /\b(bit|precision|quant|numeric|fixed|float|bf16|int\d*|format|shift|compressor|approx|exponent|fraction|significance|cell precision)\b/],
  ['ADC / DAC / peripherals', /\b(adc|dac|peripheral|sense|sensing|mux|driver|accumulator|adder|shift add|post processing|reduction path)\b/],
  ['nonideality / faults', /\b(nonideality|fault|variation|drift|noise|error|accuracy|calibration|bist|test vector|ir drop)\b/],
  ['runtime state', /\b(runtime|request|batch|cache|kv|tasklet|thread|host|device state|launch state)\b/],
  ['sparsity / masks', /\b(sparse|sparsity|mask|prun|zero|block diagonal|monarch)\b/],
  ['benchmark API', /\b(benchmark|api|workload|baseline|harness|iterator|programming interface)\b/],
  ['chip / emulator address', /\b(address|coordinate|emulator|chip in loop|array coordinate)\b/],
  ['memory service properties', /\b(memory service|cache|consistency|bandwidth|latency|capacity|mram|wram|global memory|local memory)\b/]
];

const rewriteRules: Array<[string, RegExp]> = [
  ['hardware-template', /\b(template|macro|architecture|hardware configuration|eda|rtl|netlist|subcircuit|design candidate|generated backend flow)\b|\b(physical layout|macro layout|layout generation|layout artifact)\b/],
  ['graph', /\b(graph|operator|fusion|split|segmentation|conv|matmul|edge|boolean)\b|\bgraph topology\b/],
  ['loop', /\b(loop|tensor|schedule|tiling|dataflow|affine|polyhedral|partition)\b|\b(loop tile|tensor tile)\b/],
  ['mapping', /\b(mapping|placement|allocation|binding|layout|resource|array|core|memory layout|data placement|replication)\b/],
  ['mode', /\b(mode|compute memory|access mode|buffering|analog digital|device mode)\b/],
  ['instruction', /\b(instruction|command|trace|microprogram|code generation|api sequence|meta op|backend api)\b/],
  ['numeric', /\b(numeric|precision|bit width|quant|approx|fixed point|compression|encoding|fraction|exponent|format)\b/],
  ['runtime', /\b(runtime|batch|data movement|copy|communication|cache|tasklet|host|device|spilling)\b/],
  ['accuracy', /\b(accuracy|fault|variation|calibration|nonideality|remap|bist|test vector|error)\b/],
  ['benchmark', /\b(benchmark|workload|baseline|harness|porting|api command)\b/]
];

function normalizeTerm(term: string) {
  return term
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[_/.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueInOrder(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function classifyWithRules(terms: string[], rules: Array<[string, RegExp]>, allowed: Set<string>, fallback: string) {
  const matches: string[] = [];
  for (const rawTerm of terms) {
    const term = normalizeTerm(rawTerm);
    for (const [category, pattern] of rules) {
      if (allowed.has(category) && pattern.test(term)) matches.push(category);
    }
  }
  return matches.length ? uniqueInOrder(matches) : fallback ? [fallback] : [];
}

export function normalizePaperAxes(
  paper: { axis_C_first_class_objects?: string[]; axis_D_rewrite_objects?: string[] },
  taxonomy: AxisTaxonomy
): NormalizedAxes {
  const objectAllowed = new Set([...(taxonomy.objects_vocab ?? []), FALLBACK_OBJECT]);
  const rewriteLabels = taxonomy.rewrite_types ?? {};
  const rewriteAllowed = new Set([...Object.keys(rewriteLabels), FALLBACK_REWRITE]);
  const rewriteByCode = classifyWithRules(paper.axis_D_rewrite_objects ?? [], rewriteRules, rewriteAllowed, FALLBACK_REWRITE);

  return {
    axis_C_object_vocab: classifyWithRules(
      paper.axis_C_first_class_objects ?? [],
      objectRules,
      objectAllowed,
      FALLBACK_OBJECT
    ),
    axis_D_rewrite_types: rewriteByCode.map((code) => rewriteLabels[code] ?? code)
  };
}

export function axisCategorySets(taxonomy: AxisTaxonomy) {
  return {
    objectCategories: [...(taxonomy.objects_vocab ?? []), FALLBACK_OBJECT],
    rewriteCategories: [...Object.values(taxonomy.rewrite_types ?? {}), FALLBACK_REWRITE]
  };
}
