import { TriggerNode } from "./TriggerNode";
import { LogicNode } from "./LogicNode";
import { ScannerNode } from "./ScannerNode";
import { NotifyNode } from "./NotifyNode";
import { AiNode } from "./AiNode";

export const nodeTypes = {
  trigger: TriggerNode,
  logic: LogicNode,
  scanner: ScannerNode,
  notify: NotifyNode,
  ai: AiNode,
};

export { TriggerNode, LogicNode, ScannerNode, NotifyNode, AiNode };