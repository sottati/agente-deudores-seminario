
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "agreements": {
                  Row: {
                    "acceptance_ip": string | null,"accepted_at": string,"created_at": string,"document_html": string | null,"id": string,"offer_id": string,"organization_id": string,"template_version": string,"transcript_sha256": string,"user_agent": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "acceptance_ip"?: string | null,"accepted_at"?: string,"created_at"?: string,"document_html"?: string | null,"id"?: string,"offer_id": string,"organization_id": string,"template_version": string,"transcript_sha256": string,"user_agent"?: string | null
                  }
                  Update: {
                    "acceptance_ip"?: string | null,"accepted_at"?: string,"created_at"?: string,"document_html"?: string | null,"id"?: string,"offer_id"?: string,"organization_id"?: string,"template_version"?: string,"transcript_sha256"?: string,"user_agent"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "agreements_offer_id_organization_id_fkey"
      columns: ["offer_id","organization_id"]
isOneToOne: false
      referencedRelation: "offers"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"audit_events": {
                  Row: {
                    "actor_user_id": string | null,"created_at": string,"id": string,"negotiation_id": string | null,"organization_id": string,"payload": NonNullable<Json>,"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_user_id"?: string | null,"created_at"?: string,"id"?: string,"negotiation_id"?: string | null,"organization_id": string,"payload"?: NonNullable<Json>,"type": string
                  }
                  Update: {
                    "actor_user_id"?: string | null,"created_at"?: string,"id"?: string,"negotiation_id"?: string | null,"organization_id"?: string,"payload"?: NonNullable<Json>,"type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_events_negotiation_id_organization_id_fkey"
      columns: ["negotiation_id","organization_id"]
isOneToOne: false
      referencedRelation: "negotiations"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "audit_events_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"debtors": {
                  Row: {
                    "alias": string,"archived_at": string | null,"created_at": string,"email": string | null,"full_name": string,"group_label": string | null,"id": string,"organization_id": string,"phone": string | null,"updated_at": string,"verification_hash": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alias": string,"archived_at"?: string | null,"created_at"?: string,"email"?: string | null,"full_name": string,"group_label"?: string | null,"id"?: string,"organization_id": string,"phone"?: string | null,"updated_at"?: string,"verification_hash"?: string | null
                  }
                  Update: {
                    "alias"?: string,"archived_at"?: string | null,"created_at"?: string,"email"?: string | null,"full_name"?: string,"group_label"?: string | null,"id"?: string,"organization_id"?: string,"phone"?: string | null,"updated_at"?: string,"verification_hash"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "debtors_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"debts": {
                  Row: {
                    "concept": string,"created_at": string,"debtor_id": string,"due_date": string,"id": string,"interest_cents": number,"organization_id": string,"principal_cents": number,"status": Database["public"]['Enums']["debt_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "concept": string,"created_at"?: string,"debtor_id": string,"due_date": string,"id"?: string,"interest_cents"?: number,"organization_id": string,"principal_cents": number,"status"?: Database["public"]['Enums']["debt_status"],"updated_at"?: string
                  }
                  Update: {
                    "concept"?: string,"created_at"?: string,"debtor_id"?: string,"due_date"?: string,"id"?: string,"interest_cents"?: number,"organization_id"?: string,"principal_cents"?: number,"status"?: Database["public"]['Enums']["debt_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "debts_debtor_id_organization_id_fkey"
      columns: ["debtor_id","organization_id"]
isOneToOne: false
      referencedRelation: "debtors"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "debts_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"installments": {
                  Row: {
                    "agreement_id": string,"amount_cents": number,"due_date": string,"id": string,"number": number,"organization_id": string,"paid_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "agreement_id": string,"amount_cents": number,"due_date": string,"id"?: string,"number": number,"organization_id": string,"paid_at"?: string | null
                  }
                  Update: {
                    "agreement_id"?: string,"amount_cents"?: number,"due_date"?: string,"id"?: string,"number"?: number,"organization_id"?: string,"paid_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "installments_agreement_id_organization_id_fkey"
      columns: ["agreement_id","organization_id"]
isOneToOne: false
      referencedRelation: "agreements"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"memberships": {
                  Row: {
                    "created_at": string,"organization_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"organization_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"organization_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "memberships_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "created_at": string,"id": string,"negotiation_id": string,"organization_id": string,"parts": NonNullable<Json>,"role": Database["public"]['Enums']["message_role"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"negotiation_id": string,"organization_id": string,"parts": NonNullable<Json>,"role": Database["public"]['Enums']["message_role"]
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"negotiation_id"?: string,"organization_id"?: string,"parts"?: NonNullable<Json>,"role"?: Database["public"]['Enums']["message_role"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_negotiation_id_organization_id_fkey"
      columns: ["negotiation_id","organization_id"]
isOneToOne: false
      referencedRelation: "negotiations"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"negotiation_policies": {
                  Row: {
                    "custom_instructions": string | null,"escalate_above_amount_cents": number | null,"max_first_due_days": number,"max_installments": number,"max_interest_waiver_pct": number,"max_principal_discount_pct": number,"min_down_payment_pct": number,"min_installment_amount_cents": number,"offer_validity_hours": number,"organization_id": string,"single_payment_interest_waiver_pct": number,"tone": Database["public"]['Enums']["agent_tone"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "custom_instructions"?: string | null,"escalate_above_amount_cents"?: number | null,"max_first_due_days"?: number,"max_installments"?: number,"max_interest_waiver_pct"?: number,"max_principal_discount_pct"?: number,"min_down_payment_pct"?: number,"min_installment_amount_cents"?: number,"offer_validity_hours"?: number,"organization_id": string,"single_payment_interest_waiver_pct"?: number,"tone"?: Database["public"]['Enums']["agent_tone"],"updated_at"?: string
                  }
                  Update: {
                    "custom_instructions"?: string | null,"escalate_above_amount_cents"?: number | null,"max_first_due_days"?: number,"max_installments"?: number,"max_interest_waiver_pct"?: number,"max_principal_discount_pct"?: number,"min_down_payment_pct"?: number,"min_installment_amount_cents"?: number,"offer_validity_hours"?: number,"organization_id"?: string,"single_payment_interest_waiver_pct"?: number,"tone"?: Database["public"]['Enums']["agent_tone"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "negotiation_policies_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: true
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"negotiations": {
                  Row: {
                    "channel": Database["public"]['Enums']["negotiation_channel"],"created_at": string,"created_by": string | null,"debt_id": string,"expires_at": string,"id": string,"organization_id": string,"policy_snapshot": NonNullable<Json>,"status": Database["public"]['Enums']["negotiation_status"],"token_hash": string,"updated_at": string,"verification_attempts": number,"verified_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "channel"?: Database["public"]['Enums']["negotiation_channel"],"created_at"?: string,"created_by"?: string | null,"debt_id": string,"expires_at": string,"id"?: string,"organization_id": string,"policy_snapshot": NonNullable<Json>,"status"?: Database["public"]['Enums']["negotiation_status"],"token_hash": string,"updated_at"?: string,"verification_attempts"?: number,"verified_at"?: string | null
                  }
                  Update: {
                    "channel"?: Database["public"]['Enums']["negotiation_channel"],"created_at"?: string,"created_by"?: string | null,"debt_id"?: string,"expires_at"?: string,"id"?: string,"organization_id"?: string,"policy_snapshot"?: NonNullable<Json>,"status"?: Database["public"]['Enums']["negotiation_status"],"token_hash"?: string,"updated_at"?: string,"verification_attempts"?: number,"verified_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "negotiations_debt_id_organization_id_fkey"
      columns: ["debt_id","organization_id"]
isOneToOne: false
      referencedRelation: "debts"
      referencedColumns: ["id","organization_id"]
    },{
      foreignKeyName: "negotiations_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"offers": {
                  Row: {
                    "created_at": string,"down_payment_cents": number,"engine_version": string,"id": string,"installments": number,"negotiation_id": string,"organization_id": string,"schedule": NonNullable<Json>,"status": Database["public"]['Enums']["offer_status"],"total_cents": number,"valid_until": string,"waived_interest_cents": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"down_payment_cents"?: number,"engine_version": string,"id"?: string,"installments": number,"negotiation_id": string,"organization_id": string,"schedule": NonNullable<Json>,"status"?: Database["public"]['Enums']["offer_status"],"total_cents": number,"valid_until": string,"waived_interest_cents"?: number
                  }
                  Update: {
                    "created_at"?: string,"down_payment_cents"?: number,"engine_version"?: string,"id"?: string,"installments"?: number,"negotiation_id"?: string,"organization_id"?: string,"schedule"?: NonNullable<Json>,"status"?: Database["public"]['Enums']["offer_status"],"total_cents"?: number,"valid_until"?: string,"waived_interest_cents"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "offers_negotiation_id_organization_id_fkey"
      columns: ["negotiation_id","organization_id"]
isOneToOne: false
      referencedRelation: "negotiations"
      referencedColumns: ["id","organization_id"]
    }
                  ]
                },"organizations": {
                  Row: {
                    "created_at": string,"display_name_for_debtors": string,"id": string,"kind": Database["public"]['Enums']["organization_kind"],"name": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name_for_debtors": string,"id"?: string,"kind": Database["public"]['Enums']["organization_kind"],"name": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"display_name_for_debtors"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["organization_kind"],"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "is_member":
{ Args: { "org": string }; Returns: boolean
                           }
          }
          Enums: {
            "agent_tone": "empatico_formal"|"empatico_cercano"|"neutral","debt_status": "open"|"in_negotiation"|"agreed"|"paid"|"written_off","message_role": "debtor"|"agent"|"admin"|"system","negotiation_channel": "web_sim","negotiation_status": "pending"|"verifying"|"active"|"offer_pending"|"escalated"|"agreed"|"expired"|"locked","offer_status": "proposed"|"superseded"|"accepted"|"expired","organization_kind": "consorcio"|"colegio"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "agent_tone": ["empatico_formal", "empatico_cercano", "neutral"],"debt_status": ["open", "in_negotiation", "agreed", "paid", "written_off"],"message_role": ["debtor", "agent", "admin", "system"],"negotiation_channel": ["web_sim"],"negotiation_status": ["pending", "verifying", "active", "offer_pending", "escalated", "agreed", "expired", "locked"],"offer_status": ["proposed", "superseded", "accepted", "expired"],"organization_kind": ["consorcio", "colegio"]
          }
        }
} as const
