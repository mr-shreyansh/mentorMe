"use client";

import { BaseEdge, EdgeProps, getStraightPath } from "@xyflow/react";

export default function WireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  animated
}: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        stroke: animated ? "#fb923c" : "#a1a1aa", // orange animated, zinc resting
        strokeWidth: 2,
      }}
    />
  );
}
