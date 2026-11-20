import React from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export const AnimatedEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const animated = (data as { animated?: boolean } | undefined)?.animated !== false;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeDasharray: animated ? "8 6" : undefined,
        animation: animated ? "ogmop-flow 1.2s linear infinite" : undefined,
      }}
      className={animated ? "ogmop-animated-edge" : undefined}
    />
  );
};

export default AnimatedEdge;
