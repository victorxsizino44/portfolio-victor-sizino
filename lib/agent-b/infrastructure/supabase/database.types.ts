// Hand-maintained B02 migration projection, not generated from a live database.
export type DiscoveryRow = {
  discovery_id: string;
  owner_id: string;
  entity_version: number;
  created_at: string;
};
export type AccessRow = { discovery_id: string; identity_id: string; role: string };
export type InformationRecordRow = { record_id: string; discovery_id: string; entity_version: number; payload: unknown; lineage_root_id: string; supersedes_record_id: string | null; created_at: string };
export type RuntimeStateRow = { discovery_id: string; runtime_version: number; freshness: string; current_state: unknown; pending: unknown };
export type SessionRow = { session_id: string; discovery_id: string; previous_session_id: string | null; lifecycle: string; created_at: string };
export type Mc02Row = { record_id: string; discovery_id: string; kind: string; entity_version: number; payload: unknown; lineage_root_id: string; supersedes_id: string | null; operation_id: string; request: unknown; created_at: string };
export type AgentBDatabase = {
  public: {
    Tables: {
      agent_b_discoveries: { Row: DiscoveryRow; Insert: never; Update: never; Relationships: [] };
      agent_b_discovery_access: { Row: AccessRow; Insert: never; Update: never; Relationships: [] };
      agent_b_information_records: { Row: InformationRecordRow; Insert: never; Update: never; Relationships: [] };
      agent_b_runtime_state: { Row: RuntimeStateRow; Insert: never; Update: never; Relationships: [] };
      agent_b_sessions: { Row: SessionRow; Insert: never; Update: never; Relationships: [] };
      agent_b_mc02_state: { Row: Mc02Row; Insert: never; Update: never; Relationships: [] };
      agent_b_mc02_current: { Row: { discovery_id: string; kind: string; record_id: string }; Insert: never; Update: never; Relationships: [] };
      agent_b_evidence_representations: { Row: { representation_id: string; discovery_id: string; file_reference_id: string; payload: unknown }; Insert: never; Update: never; Relationships: [] };
      agent_b_evidence_candidates: { Row: { candidate_id: string; discovery_id: string; representation_id: string; payload: unknown }; Insert: never; Update: never; Relationships: [] };
      agent_b_governed_evidence: { Row: { evidence_id: string; entity_version: number; discovery_id: string; candidate_id: string; previous_version: number|null; payload: unknown; operation_id: string; created_at: string }; Insert: never; Update: never; Relationships: [] };
      agent_b_evidence_information_links: { Row: { evidence_id: string; information_record_id: string; discovery_id: string; entity_version: number; information_version: number }; Insert: never; Update: never; Relationships: [] };
      agent_b_handoffs: { Row: { handoff_id: string; discovery_id: string; version: number; status: string; source_runtime_version: number; decision: unknown; previous_handoff_id: string|null; issued_at: string }; Insert: never; Update: never; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      agent_b_publish_information: { Args: { p_actor: string; p_input: unknown }; Returns: unknown };
      agent_b_publish_context_catalog: { Args: { p_actor: string; p_input: unknown }; Returns: unknown };
      agent_b_read_context_catalog: { Args: { p_actor: string; p_discovery: string; p_kind: string; p_history: boolean }; Returns: unknown };
      agent_b_create_owned_discovery_once: { Args: { p_expected_identity: string; p_operation_id: string }; Returns: DiscoveryRow[] };
      agent_b_initialize_runtime: { Args: { p_actor: string; p_input: unknown }; Returns: unknown };
      agent_b_resume_atomic: { Args: { p_actor: string; p_input: unknown }; Returns: unknown };
      agent_b_mutate_handoff: { Args: { p_actor: string; p_input: unknown }; Returns: unknown };
      agent_b_read_handoff: { Args: { p_actor: string; p_discovery: string; p_history: boolean }; Returns: unknown };
      agent_b_register_evidence_file: { Args: { p_actor: string; p_stored: unknown; p_reference: unknown }; Returns: undefined };
      agent_b_mutate_evidence: { Args: { p_actor: string; p_input: unknown }; Returns: unknown };
      agent_b_read_evidence: { Args: { p_actor: string; p_discovery: string; p_evidence: string; p_history: boolean }; Returns: unknown };
      agent_b_read_mc02: { Args: { p_actor: string; p_discovery: string; p_kind: string; p_history: boolean }; Returns: unknown };
      agent_b_write_mc02: { Args: { p_actor: string; p_input: unknown }; Returns: unknown };
      agent_b_read_governed_context: { Args: { p_actor: string; p_discovery: string; p_session: string }; Returns: unknown };
      agent_b_record_human_decision: { Args: { p_actor: string; p_decision: unknown }; Returns: unknown };
      agent_b_validate_human_decision: { Args: { p_actor: string; p_intent: unknown }; Returns: undefined };
      agent_b_create_owned_discovery: { Args: { p_expected_identity: string }; Returns: DiscoveryRow[] };
      agent_b_advance_entity_version: {
        Args: { p_discovery_id: string; p_expected_identity: string; p_expected_version: number };
        Returns: DiscoveryRow[];
      };
      agent_b_create_information_record: { Args: { p_expected_identity: string; p_record: unknown; p_created_at: string }; Returns: InformationRecordRow[] };
      agent_b_update_information_record: { Args: { p_expected_identity: string; p_discovery_id: string; p_expected_version: number; p_record: unknown; p_created_at: string }; Returns: InformationRecordRow[] };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
