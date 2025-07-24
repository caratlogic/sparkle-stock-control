export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      column_customizations: {
        Row: {
          column_key: string
          created_at: string | null
          display_name: string
          id: string
          table_name: string
          updated_at: string | null
          user_email: string
        }
        Insert: {
          column_key: string
          created_at?: string | null
          display_name: string
          id?: string
          table_name: string
          updated_at?: string | null
          user_email: string
        }
        Update: {
          column_key?: string
          created_at?: string | null
          display_name?: string
          id?: string
          table_name?: string
          updated_at?: string | null
          user_email?: string
        }
        Relationships: []
      }
      consignment_items: {
        Row: {
          carat_consigned: number
          consignment_id: string
          created_at: string | null
          gem_id: string
          id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          carat_consigned?: number
          consignment_id: string
          created_at?: string | null
          gem_id: string
          id?: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          carat_consigned?: number
          consignment_id?: string
          created_at?: string | null
          gem_id?: string
          id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "consignment_items_consignment_id_fkey"
            columns: ["consignment_id"]
            isOneToOne: false
            referencedRelation: "consignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignment_items_gem_id_fkey"
            columns: ["gem_id"]
            isOneToOne: false
            referencedRelation: "gems"
            referencedColumns: ["id"]
          },
        ]
      }
      consignments: {
        Row: {
          consignment_number: string
          created_at: string | null
          customer_id: string
          date_created: string
          id: string
          notes: string | null
          return_date: string
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          consignment_number: string
          created_at?: string | null
          customer_id: string
          date_created?: string
          id?: string
          notes?: string | null
          return_date: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          consignment_number?: string
          created_at?: string | null
          customer_id?: string
          date_created?: string
          id?: string
          notes?: string | null
          return_date?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          amount: number
          created_at: string
          credit_note_number: string
          currency: string
          customer_id: string
          date_created: string
          description: string | null
          id: string
          reason: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          credit_note_number: string
          currency?: string
          customer_id: string
          date_created?: string
          description?: string | null
          id?: string
          reason: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          credit_note_number?: string
          currency?: string
          customer_id?: string
          date_created?: string
          description?: string | null
          id?: string
          reason?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_communications: {
        Row: {
          communication_type: string
          created_at: string | null
          customer_id: string
          id: string
          is_read: boolean | null
          message: string
          related_consignment_id: string | null
          related_invoice_id: string | null
          response_status: string | null
          sender_email: string | null
          sender_name: string | null
          sender_type: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          communication_type: string
          created_at?: string | null
          customer_id: string
          id?: string
          is_read?: boolean | null
          message: string
          related_consignment_id?: string | null
          related_invoice_id?: string | null
          response_status?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sender_type: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          communication_type?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_consignment_id?: string | null
          related_invoice_id?: string | null
          response_status?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sender_type?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_communications_related_consignment_id_fkey"
            columns: ["related_consignment_id"]
            isOneToOne: false
            referencedRelation: "consignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_communications_related_invoice_id_fkey"
            columns: ["related_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_reminders: {
        Row: {
          communication_id: string | null
          created_at: string | null
          customer_id: string
          id: string
          is_sent: boolean | null
          message: string
          reminder_date: string
          reminder_type: string
          staff_email: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          communication_id?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          is_sent?: boolean | null
          message: string
          reminder_date: string
          reminder_type: string
          staff_email?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          communication_id?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          is_sent?: boolean | null
          message?: string
          reminder_date?: string
          reminder_type?: string
          staff_email?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_reminders_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "customer_communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          city: string
          company: string | null
          country: string | null
          created_at: string | null
          currency: string
          customer_id: string
          date_added: string
          discount: number | null
          email: string
          id: string
          kyc_status: boolean
          last_purchase_date: string | null
          name: string
          notes: string | null
          phone: string
          state: string
          status: string
          street: string
          tax_id: string | null
          total_purchases: number | null
          updated_at: string | null
          updated_by: string | null
          vat_number: string | null
          zip_code: string
        }
        Insert: {
          city: string
          company?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string
          customer_id: string
          date_added?: string
          discount?: number | null
          email: string
          id?: string
          kyc_status?: boolean
          last_purchase_date?: string | null
          name: string
          notes?: string | null
          phone: string
          state: string
          status?: string
          street: string
          tax_id?: string | null
          total_purchases?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vat_number?: string | null
          zip_code: string
        }
        Update: {
          city?: string
          company?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string
          customer_id?: string
          date_added?: string
          discount?: number | null
          email?: string
          id?: string
          kyc_status?: boolean
          last_purchase_date?: string | null
          name?: string
          notes?: string | null
          phone?: string
          state?: string
          status?: string
          street?: string
          tax_id?: string | null
          total_purchases?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vat_number?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      gem_certificates: {
        Row: {
          certificate_number: string
          certificate_type: string
          certificate_url: string | null
          created_at: string
          expiry_date: string | null
          gem_id: string
          id: string
          issue_date: string | null
          issuing_authority: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          certificate_number: string
          certificate_type: string
          certificate_url?: string | null
          created_at?: string
          expiry_date?: string | null
          gem_id: string
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          certificate_number?: string
          certificate_type?: string
          certificate_url?: string | null
          created_at?: string
          expiry_date?: string | null
          gem_id?: string
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_gem_certificates_gem_id"
            columns: ["gem_id"]
            isOneToOne: false
            referencedRelation: "gems"
            referencedColumns: ["id"]
          },
        ]
      }
      gems: {
        Row: {
          associated_entity: string
          box_number: string | null
          carat: number
          certificate_number: string
          certificate_type: string
          color: string
          color_comment: string
          cost_price: number
          created_at: string | null
          date_added: string
          description: string | null
          gem_type: string
          id: string
          image_url: string | null
          in_stock: number
          measurements: string | null
          measurements_mm: string | null
          notes: string | null
          old_code: string | null
          origin: string | null
          ownership_status: string
          price: number
          price_in_letters: string | null
          purchase_date: string | null
          reserved: number
          retail_price: number | null
          shape: string | null
          shape_detail: string | null
          sold: number
          status: string
          stock_id: string
          stock_type: string
          stone_description: string | null
          supplier: string | null
          total_in_letters: string | null
          treatment: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          associated_entity?: string
          box_number?: string | null
          carat: number
          certificate_number: string
          certificate_type?: string
          color: string
          color_comment?: string
          cost_price: number
          created_at?: string | null
          date_added?: string
          description?: string | null
          gem_type: string
          id?: string
          image_url?: string | null
          in_stock?: number
          measurements?: string | null
          measurements_mm?: string | null
          notes?: string | null
          old_code?: string | null
          origin?: string | null
          ownership_status?: string
          price: number
          price_in_letters?: string | null
          purchase_date?: string | null
          reserved?: number
          retail_price?: number | null
          shape?: string | null
          shape_detail?: string | null
          sold?: number
          status?: string
          stock_id: string
          stock_type?: string
          stone_description?: string | null
          supplier?: string | null
          total_in_letters?: string | null
          treatment?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          associated_entity?: string
          box_number?: string | null
          carat?: number
          certificate_number?: string
          certificate_type?: string
          color?: string
          color_comment?: string
          cost_price?: number
          created_at?: string | null
          date_added?: string
          description?: string | null
          gem_type?: string
          id?: string
          image_url?: string | null
          in_stock?: number
          measurements?: string | null
          measurements_mm?: string | null
          notes?: string | null
          old_code?: string | null
          origin?: string | null
          ownership_status?: string
          price?: number
          price_in_letters?: string | null
          purchase_date?: string | null
          reserved?: number
          retail_price?: number | null
          shape?: string | null
          shape_detail?: string | null
          sold?: number
          status?: string
          stock_id?: string
          stock_type?: string
          stone_description?: string | null
          supplier?: string | null
          total_in_letters?: string | null
          treatment?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          carat_purchased: number
          created_at: string | null
          gem_id: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          carat_purchased?: number
          created_at?: string | null
          gem_id: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          carat_purchased?: number
          created_at?: string | null
          gem_id?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_gem_id_fkey"
            columns: ["gem_id"]
            isOneToOne: false
            referencedRelation: "gems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date: string
          payment_method: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_id: string
          date_created: string
          date_due: string
          id: string
          invoice_number: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          date_created?: string
          date_due: string
          id?: string
          invoice_number: string
          notes?: string | null
          status?: string
          subtotal: number
          tax_amount: number
          tax_rate?: number
          total: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          date_created?: string
          date_due?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_transactions: {
        Row: {
          associated_entity: string
          created_at: string
          id: string
          ownership_status: string
          partner_id: string
          partner_share: number
          revenue_amount: number
          transaction_date: string
          transaction_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          associated_entity: string
          created_at?: string
          id?: string
          ownership_status: string
          partner_id: string
          partner_share?: number
          revenue_amount?: number
          transaction_date?: string
          transaction_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          associated_entity?: string
          created_at?: string
          id?: string
          ownership_status?: string
          partner_id?: string
          partner_share?: number
          revenue_amount?: number
          transaction_date?: string
          transaction_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          ownership_percentage: number
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          ownership_percentage?: number
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          ownership_percentage?: number
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      qr_code_settings: {
        Row: {
          created_at: string | null
          field_config: Json
          id: string
          updated_at: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          field_config?: Json
          id?: string
          updated_at?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          field_config?: Json
          id?: string
          updated_at?: string | null
          user_email?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          discount: number
          gem_id: string
          id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount?: number
          gem_id: string
          id?: string
          quantity?: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          discount?: number
          gem_id?: string
          id?: string
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_gem_id_fkey"
            columns: ["gem_id"]
            isOneToOne: false
            referencedRelation: "gems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          customer_id: string
          date_created: string
          discount_percentage: number
          id: string
          notes: string | null
          quotation_number: string
          status: string
          subtotal: number
          terms: string | null
          total: number
          updated_at: string
          updated_by: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          date_created?: string
          discount_percentage?: number
          id?: string
          notes?: string | null
          quotation_number: string
          status?: string
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          date_created?: string
          discount_percentage?: number
          id?: string
          notes?: string | null
          quotation_number?: string
          status?: string
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_customer_be_inactive: {
        Args: { customer_uuid: string }
        Returns: boolean
      }
      recalculate_all_customer_totals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
