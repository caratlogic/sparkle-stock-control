export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      consignment_items: {
        Row: {
          consignment_id: string
          created_at: string | null
          gem_id: string
          id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          consignment_id: string
          created_at?: string | null
          gem_id: string
          id?: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
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
      customers: {
        Row: {
          city: string
          company: string | null
          country: string | null
          created_at: string | null
          customer_id: string
          date_added: string
          email: string
          id: string
          last_purchase_date: string | null
          name: string
          notes: string | null
          phone: string
          state: string
          street: string
          tax_id: string | null
          total_purchases: number | null
          updated_at: string | null
          zip_code: string
        }
        Insert: {
          city: string
          company?: string | null
          country?: string | null
          created_at?: string | null
          customer_id: string
          date_added?: string
          email: string
          id?: string
          last_purchase_date?: string | null
          name: string
          notes?: string | null
          phone: string
          state: string
          street: string
          tax_id?: string | null
          total_purchases?: number | null
          updated_at?: string | null
          zip_code: string
        }
        Update: {
          city?: string
          company?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string
          date_added?: string
          email?: string
          id?: string
          last_purchase_date?: string | null
          name?: string
          notes?: string | null
          phone?: string
          state?: string
          street?: string
          tax_id?: string | null
          total_purchases?: number | null
          updated_at?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      gems: {
        Row: {
          carat: number
          certificate_number: string
          clarity: string
          color: string
          cost_price: number
          created_at: string | null
          cut: string
          date_added: string
          gem_type: string
          id: string
          notes: string | null
          price: number
          status: string
          stock_id: string
          updated_at: string | null
        }
        Insert: {
          carat: number
          certificate_number: string
          clarity: string
          color: string
          cost_price: number
          created_at?: string | null
          cut: string
          date_added?: string
          gem_type: string
          id?: string
          notes?: string | null
          price: number
          status?: string
          stock_id: string
          updated_at?: string | null
        }
        Update: {
          carat?: number
          certificate_number?: string
          clarity?: string
          color?: string
          cost_price?: number
          created_at?: string | null
          cut?: string
          date_added?: string
          gem_type?: string
          id?: string
          notes?: string | null
          price?: number
          status?: string
          stock_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          gem_id: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          gem_id: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
