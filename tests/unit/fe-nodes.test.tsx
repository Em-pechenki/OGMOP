import { describe, it } from "vitest";

// Заготовки: компоненты нод появятся в src/frontend/components/nodes (или аналог).
describe.skip("FE: node components (заготовка)", () => {
  it.todo("TriggerNode renders label and status");
  it.todo("ScannerNode renders scannerType and findings count");
  it.todo("LogicNode renders condition");
  it.todo("NotifyNode renders channel");
  it.todo("AiNode renders provider/model");
});

describe.skip("FE: PropertyPanel (заготовка)", () => {
  it.todo("shows 'select node' when none selected");
  it.todo("renders params form for selected node");
  it.todo("Apply/Reset buttons work");
});

describe.skip("FE: ResultsPanel (заготовка)", () => {
  it.todo("filters findings by severity");
  it.todo("renders finding card with snippet");
  it.todo("shows empty state when no findings");
});
