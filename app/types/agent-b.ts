export type AgentBMessageRole = "user" | "agent" | "system";

export type AgentBDiscoveryStatus =
  | "idle"
  | "discovering"
  | "validating"
  | "awaiting_human_decision"
  | "briefing_ready"
  | "unavailable";

export type AgentBReadiness = "incomplete" | "partial" | "ready_for_review" | "complete";

export type AgentBMessage = {
  id: string;
  role: AgentBMessageRole;
  content: string;
  createdAt?: string;
};

export type AgentBDiscoveryProgress = {
  activeDomain: string | null;
  completedDomains: string[];
  pendingDomains: string[];
  readiness: AgentBReadiness | null;
};

export type AgentBSession = {
  sessionId: string | null;
  status: AgentBDiscoveryStatus;
  messages: AgentBMessage[];
  discoveryProgress: AgentBDiscoveryProgress;
  requiresHumanDecision: boolean;
};

export type AgentBRequest = {
  sessionId: string | null;
  message: string;
  locale: "pt-BR";
  source: "portfolio-agent-b";
};

export type AgentBError = {
  code: "AGENT_B_UNAVAILABLE" | "INVALID_RESPONSE" | "RATE_LIMITED" | "TIMEOUT";
  message: string;
  retryable: boolean;
};
