'use client';

import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  OnConnect,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useMemo, useRef, useState } from 'react';

type NodeKind = 'client' | 'loadBalancer' | 'microservice' | 'redis' | 'database';
type HandleSide = 'left' | 'right';
type MicroserviceMode = 'general' | 'read' | 'write';
type Severity = 'error' | 'warning';

interface ValidationIssue {
  id: string;
  message: string;
  severity: Severity;
  nodeId?: string;
  edgeId?: string;
}

interface CanvasNodePayload {
  id: string;
  kind: NodeKind;
  label: string;
  mode?: MicroserviceMode;
  handles: {
    left: number;
    right: number;
  };
}

interface CanvasEdgePayload {
  id: string;
  source: string;
  sourceHandle: string | null;
  target: string;
  targetHandle: string | null;
}

interface ValidationPayload {
  nodes: CanvasNodePayload[];
  edges: CanvasEdgePayload[];
}

interface SystemNodeData extends Record<string, unknown> {
  label: string;
  kind: NodeKind;
  leftHandles: number;
  rightHandles: number;
  mode?: MicroserviceMode;
  onAddHandle: (nodeId: string, side: HandleSide) => void;
  onModeChange: (nodeId: string, mode: MicroserviceMode) => void;
}

const FLOW_NODE_TYPE = 'systemNode';
type SystemFlowNode = Node<SystemNodeData, typeof FLOW_NODE_TYPE>;
// Leave this empty or set NEXT_PUBLIC_SYSTEM_DESIGN_VALIDATION_URL to enable API integration.
const validationEndpoint = process.env.NEXT_PUBLIC_SYSTEM_DESIGN_VALIDATION_URL ?? '';

const nodeTemplates: Record<
  NodeKind,
  {
    label: string;
    leftHandles: number;
    rightHandles: number;
    mode?: MicroserviceMode;
  }
> = {
  client: {
    label: 'Client',
    leftHandles: 0,
    rightHandles: 1,
  },
  loadBalancer: {
    label: 'Load Balancer',
    leftHandles: 1,
    rightHandles: 2,
  },
  microservice: {
    label: 'Backend Microservice',
    leftHandles: 1,
    rightHandles: 1,
    mode: 'general',
  },
  redis: {
    label: 'Redis Cache',
    leftHandles: 1,
    rightHandles: 1,
  },
  database: {
    label: 'Database',
    leftHandles: 1,
    rightHandles: 0,
  },
};

const cardToneByKind: Record<NodeKind, string> = {
  client: 'border-sky-400/70',
  loadBalancer: 'border-amber-400/70',
  microservice: 'border-emerald-400/70',
  redis: 'border-red-400/70',
  database: 'border-violet-400/70',
};

function getHandleTopPosition(index: number, total: number): string {
  return `${((index + 1) / (total + 1)) * 100}%`;
}

function SystemNode({ id, data }: NodeProps<SystemFlowNode>) {
  const hasModeControl = data.kind === 'microservice';

  return (
    <div className={`nm-flat-sm rounded-lg border px-3 py-2 min-w-52 ${cardToneByKind[data.kind]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-(--heading-color)">{data.label}</p>
        <div className="flex gap-1">
          <button
            className="nm-button rounded-full px-2 py-1 text-[10px]"
            type="button"
            onClick={() => data.onAddHandle(id, 'left')}
          >
            +L
          </button>
          <button
            className="nm-button rounded-full px-2 py-1 text-[10px]"
            type="button"
            onClick={() => data.onAddHandle(id, 'right')}
          >
            +R
          </button>
        </div>
      </div>

      {hasModeControl ? (
        <label className="mt-2 block text-[11px]">
          <span className="mr-2 opacity-70">Mode</span>
          <select
            className="nm-inset-sm rounded-lg px-2 py-1 text-[11px]"
            value={data.mode ?? 'general'}
            onChange={(event) => data.onModeChange(id, event.target.value as MicroserviceMode)}
          >
            <option value="general">General</option>
            <option value="read">Read</option>
            <option value="write">Write</option>
          </select>
        </label>
      ) : null}

      {Array.from({ length: data.leftHandles }).map((_, index) => (
        <Handle
          key={`left-${index}`}
          id={`left-${index}`}
          type="target"
          position={Position.Left}
          style={{ top: getHandleTopPosition(index, data.leftHandles) }}
        />
      ))}

      {Array.from({ length: data.rightHandles }).map((_, index) => (
        <Handle
          key={`right-${index}`}
          id={`right-${index}`}
          type="source"
          position={Position.Right}
          style={{ top: getHandleTopPosition(index, data.rightHandles) }}
        />
      ))}
    </div>
  );
}

function buildValidationPayload(
  nodes: Array<SystemFlowNode>,
  edges: Array<Edge>
): ValidationPayload {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      kind: node.data.kind,
      label: node.data.label,
      mode: node.data.mode,
      handles: {
        left: node.data.leftHandles,
        right: node.data.rightHandles,
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: edge.sourceHandle ?? null,
      target: edge.target,
      targetHandle: edge.targetHandle ?? null,
    })),
  };
}

async function validateGraph(payload: ValidationPayload): Promise<ValidationIssue[]> {
  if (!validationEndpoint) {
    return [];
  }

  const response = await fetch(validationEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Validation request failed');
  }

  const result = (await response.json()) as { issues?: ValidationIssue[] };
  return result.issues ?? [];
}

export default function SystemDesignCanvas() {
  const idCounter = useRef(1);
  const [nodes, setNodes, onNodesChange] = useNodesState<SystemFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onAddHandle = useCallback((nodeId: string, side: HandleSide) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            leftHandles: side === 'left' ? node.data.leftHandles + 1 : node.data.leftHandles,
            rightHandles: side === 'right' ? node.data.rightHandles + 1 : node.data.rightHandles,
          },
        };
      })
    );
  }, [setNodes]);

  const onModeChange = useCallback((nodeId: string, mode: MicroserviceMode) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            mode,
          },
        };
      })
    );
  }, [setNodes]);

  const addNode = useCallback((kind: NodeKind) => {
    const template = nodeTemplates[kind];
    const id = String(idCounter.current++);

    const nextNode: SystemFlowNode = {
      id,
      type: FLOW_NODE_TYPE,
      position: {
        x: 80 + (nodes.length % 4) * 220,
        y: 80 + Math.floor(nodes.length / 4) * 150,
      },
      data: {
        label: template.label,
        kind,
        leftHandles: template.leftHandles,
        rightHandles: template.rightHandles,
        mode: template.mode,
        onAddHandle,
        onModeChange,
      },
    };

    setNodes((currentNodes) => [...currentNodes, nextNode]);
  }, [nodes.length, onAddHandle, onModeChange, setNodes]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            animated: true,
            type: 'smoothstep',
          },
          currentEdges
        )
      );
    },
    [setEdges]
  );

  const validateDesign = useCallback(async () => {
    const payload = buildValidationPayload(nodes, edges);
    setValidationError(null);
    setIsValidating(true);

    try {
      const issues = await validateGraph(payload);
      setValidationIssues(issues);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed.';
      setValidationError(message);
      setValidationIssues([]);
    } finally {
      setIsValidating(false);
    }
  }, [edges, nodes]);

  const nodeTypes = useMemo(
    () => ({
      [FLOW_NODE_TYPE]: SystemNode,
    }),
    []
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <section className="nm-flat rounded-lg p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-(--heading-color) mr-2">Add node:</span>
          <button className="nm-button rounded-md px-3 py-2 text-sm" type="button" onClick={() => addNode('client')}>
            Client
          </button>
          <button className="nm-button rounded-md px-3 py-2 text-sm" type="button" onClick={() => addNode('loadBalancer')}>
            Load Balancer
          </button>
          <button className="nm-button rounded-md px-3 py-2 text-sm" type="button" onClick={() => addNode('microservice')}>
            Backend Microservice
          </button>
          <button className="nm-button rounded-md px-3 py-2 text-sm" type="button" onClick={() => addNode('redis')}>
            Redis Cache
          </button>
          <button className="nm-button rounded-md px-3 py-2 text-sm" type="button" onClick={() => addNode('database')}>
            Database
          </button>

          <button
            className="nm-button rounded-md px-3 py-2 text-sm ml-auto"
            type="button"
            onClick={validateDesign}
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Validate Design'}
          </button>
        </div>
      </section>

      <section className="nm-flat rounded-lg p-3 h-[70vh] min-h-130">
        <ReactFlow<SystemFlowNode, Edge>
          fitView
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <MiniMap />
          <Controls />
          <Background gap={18} size={1} />
        </ReactFlow>
      </section>

      <section className="nm-flat rounded-lg p-5">
        <h2 className="text-lg font-bold text-(--heading-color)">Validation Results</h2>
        <p className="text-sm opacity-70 mt-1">
          Frontend payload is ready. Set a URL in the validation integration block to enable API checks.
        </p>

        {validationError ? (
          <p className="text-sm text-red-500 mt-3">{validationError}</p>
        ) : null}

        {validationIssues.length === 0 ? (
          <p className="text-sm opacity-70 mt-3">No issues returned yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {validationIssues.map((issue) => (
              <li key={issue.id} className="nm-inset-sm rounded-md px-3 py-2 text-sm">
                <p className={issue.severity === 'error' ? 'text-red-500' : 'text-amber-500'}>{issue.severity.toUpperCase()}</p>
                <p className="mt-1">{issue.message}</p>
                <p className="mt-1 opacity-70 text-xs">
                  {issue.nodeId ? `Node: ${issue.nodeId}` : ''}
                  {issue.edgeId ? ` Edge: ${issue.edgeId}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
