// Hand-maintained B02 migration projection, not generated from a live database.
export type DiscoveryRow = {
  discovery_id: string;
  owner_id: string;
  entity_version: number;
  created_at: string;
};
export type AccessRow = { discovery_id: string; identity_id: string; role: string };
export type AgentBDatabase = {
  public: {
    Tables: {
      agent_b_discoveries: { Row: DiscoveryRow; Insert: never; Update: never; Relationships: [] };
      agent_b_discovery_access: { Row: AccessRow; Insert: never; Update: never; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      agent_b_create_owned_discovery: { Args: { p_expected_identity: string }; Returns: DiscoveryRow[] };
      agent_b_advance_entity_version: {
        Args: { p_discovery_id: string; p_expected_identity: string; p_expected_version: number };
        Returns: DiscoveryRow[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
