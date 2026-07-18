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
      abandoned_carts: {
        Row: {
          cart_id: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          id: string
          last_step: string | null
          recovered: boolean
          value: number | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          last_step?: string | null
          recovered?: boolean
          value?: number | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          last_step?: string | null
          recovered?: boolean
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abandoned_carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_display: string
          body: Json
          category: string | null
          cover_media_id: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          related_collection_ids: string[]
          related_experience_ids: string[]
          related_product_ids: string[]
          seo_metadata_id: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_display?: string
          body?: Json
          category?: string | null
          cover_media_id?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          related_collection_ids?: string[]
          related_experience_ids?: string[]
          related_product_ids?: string[]
          seo_metadata_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_display?: string
          body?: Json
          category?: string | null
          cover_media_id?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          related_collection_ids?: string[]
          related_experience_ids?: string[]
          related_product_ids?: string[]
          seo_metadata_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          portfolio_project_id: string | null
          reservation_id: string | null
          role_description: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          supplier_id: string | null
          team_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          portfolio_project_id?: string | null
          reservation_id?: string | null
          role_description?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          supplier_id?: string | null
          team_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          portfolio_project_id?: string | null
          reservation_id?: string | null
          role_description?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          supplier_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_portfolio_project_id_fkey"
            columns: ["portfolio_project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_portfolio_project_id_fkey"
            columns: ["portfolio_project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          context: Json
          correlation_id: string
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          source: string
          staff_user_id: string | null
        }
        Insert: {
          action: string
          context?: Json
          correlation_id?: string
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          source?: string
          staff_user_id?: string | null
        }
        Update: {
          action?: string
          context?: Json
          correlation_id?: string
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          source?: string
          staff_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"] | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          name: string
          scope: string | null
          starts_at: string | null
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          scope?: string | null
          starts_at?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          scope?: string | null
          starts_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          digital_product_id: string | null
          id: string
          personalization_json: Json | null
          price_breakdown_json: Json
          product_id: string | null
          product_snapshot: Json
          quantity: number
          removed_at: string | null
          requires_proof: boolean
          selected_addons_json: Json | null
          total_price_snapshot: number | null
          unit_price_snapshot: number | null
          updated_at: string
          uploaded_file_ids: string[]
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          digital_product_id?: string | null
          id?: string
          personalization_json?: Json | null
          price_breakdown_json?: Json
          product_id?: string | null
          product_snapshot?: Json
          quantity?: number
          removed_at?: string | null
          requires_proof?: boolean
          selected_addons_json?: Json | null
          total_price_snapshot?: number | null
          unit_price_snapshot?: number | null
          updated_at?: string
          uploaded_file_ids?: string[]
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          digital_product_id?: string | null
          id?: string
          personalization_json?: Json | null
          price_breakdown_json?: Json
          product_id?: string | null
          product_snapshot?: Json
          quantity?: number
          removed_at?: string | null
          requires_proof?: boolean
          selected_addons_json?: Json | null
          total_price_snapshot?: number | null
          unit_price_snapshot?: number | null
          updated_at?: string
          uploaded_file_ids?: string[]
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          anonymous_token_hash: string | null
          created_at: string
          currency: string
          customer_id: string | null
          id: string
          status: Database["public"]["Enums"]["cart_status"]
          updated_at: string
        }
        Insert: {
          anonymous_token_hash?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
        }
        Update: {
          anonymous_token_hash?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories_public"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_sessions: {
        Row: {
          billing_address_id: string | null
          billing_address_snapshot: Json | null
          cart_id: string | null
          created_at: string
          customer_id: string | null
          delivery_address_id: string | null
          delivery_address_snapshot: Json | null
          distance_sales_consent_at: string | null
          expires_at: string
          id: string
          invoice_identity: Json
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          kvkk_consent_at: string | null
          legal_version_ids: Json
          proof_acknowledged_at: string | null
          shipping_amount: number
          shipping_method_id: string | null
          status: Database["public"]["Enums"]["checkout_status"]
          subtotal_amount: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          billing_address_id?: string | null
          billing_address_snapshot?: Json | null
          cart_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_address_id?: string | null
          delivery_address_snapshot?: Json | null
          distance_sales_consent_at?: string | null
          expires_at?: string
          id?: string
          invoice_identity?: Json
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          kvkk_consent_at?: string | null
          legal_version_ids?: Json
          proof_acknowledged_at?: string | null
          shipping_amount?: number
          shipping_method_id?: string | null
          status?: Database["public"]["Enums"]["checkout_status"]
          subtotal_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          billing_address_id?: string | null
          billing_address_snapshot?: Json | null
          cart_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_address_id?: string | null
          delivery_address_snapshot?: Json | null
          distance_sales_consent_at?: string | null
          expires_at?: string
          id?: string
          invoice_identity?: Json
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          kvkk_consent_at?: string | null
          legal_version_ids?: Json
          proof_acknowledged_at?: string | null
          shipping_amount?: number
          shipping_method_id?: string | null
          status?: Database["public"]["Enums"]["checkout_status"]
          subtotal_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_shipping_method_id_fkey"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "shipping_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          lead_id: string | null
          name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["client_status"]
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
        }
        Relationships: [
          {
            foreignKeyName: "clients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_set_items: {
        Row: {
          default_quantity: number
          id: string
          is_required: boolean
          product_id: string
          set_id: string
          sort_order: number
        }
        Insert: {
          default_quantity?: number
          id?: string
          is_required?: boolean
          product_id: string
          set_id: string
          sort_order?: number
        }
        Update: {
          default_quantity?: number
          id?: string
          is_required?: boolean
          product_id?: string
          set_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_set_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "collection_set_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_set_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_set_items_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "collection_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_set_items_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "collection_sets_public"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_sets: {
        Row: {
          bundle_discount_pct: number | null
          bundle_price: number | null
          collection_id: string | null
          created_at: string
          id: string
          name_tr: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          story: string | null
          updated_at: string
        }
        Insert: {
          bundle_discount_pct?: number | null
          bundle_price?: number | null
          collection_id?: string | null
          created_at?: string
          id?: string
          name_tr: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          story?: string | null
          updated_at?: string
        }
        Update: {
          bundle_discount_pct?: number | null
          bundle_price?: number | null
          collection_id?: string | null
          created_at?: string
          id?: string
          name_tr?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          story?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_sets_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_sets_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          hero_media_id: string | null
          id: string
          is_featured: boolean
          materials: string[]
          name: string
          palette: Json
          seo_metadata_id: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          story: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_media_id?: string | null
          id?: string
          is_featured?: boolean
          materials?: string[]
          name: string
          palette?: Json
          seo_metadata_id?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          story?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_media_id?: string | null
          id?: string
          is_featured?: boolean
          materials?: string[]
          name?: string
          palette?: Json
          seo_metadata_id?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          story?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      colors: {
        Row: {
          hex: string | null
          id: string
          name_tr: string
          slug: string
          sort_order: number
        }
        Insert: {
          hex?: string | null
          id?: string
          name_tr: string
          slug: string
          sort_order?: number
        }
        Update: {
          hex?: string | null
          id?: string
          name_tr?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          checkbox_label_snapshot: string | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          created_at: string
          customer_id: string | null
          id: string
          ip: unknown
          legal_document_version_id: string | null
          order_id: string | null
          reservation_id: string | null
          session_ref: string | null
          source_route: string | null
          user_agent: string | null
        }
        Insert: {
          checkbox_label_snapshot?: string | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          created_at?: string
          customer_id?: string | null
          id?: string
          ip?: unknown
          legal_document_version_id?: string | null
          order_id?: string | null
          reservation_id?: string | null
          session_ref?: string | null
          source_route?: string | null
          user_agent?: string | null
        }
        Update: {
          checkbox_label_snapshot?: string | null
          consent_type?: Database["public"]["Enums"]["consent_type"]
          created_at?: string
          customer_id?: string | null
          id?: string
          ip?: unknown
          legal_document_version_id?: string | null
          order_id?: string | null
          reservation_id?: string | null
          session_ref?: string | null
          source_route?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_legal_document_version_id_fkey"
            columns: ["legal_document_version_id"]
            isOneToOne: false
            referencedRelation: "legal_document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_legal_document_version_id_fkey"
            columns: ["legal_document_version_id"]
            isOneToOne: false
            referencedRelation: "legal_documents_public"
            referencedColumns: ["version_id"]
          },
          {
            foreignKeyName: "consent_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          assigned_staff_id: string | null
          channel: Database["public"]["Enums"]["consultation_channel"]
          city_id: string | null
          confirmed_slot: Json | null
          consultation_number: string
          created_at: string
          customer_id: string | null
          id: string
          lead_id: string | null
          note: string | null
          preferred_slots: Json
          service_category:
            | Database["public"]["Enums"]["service_category"]
            | null
          status: Database["public"]["Enums"]["consultation_status"]
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          channel?: Database["public"]["Enums"]["consultation_channel"]
          city_id?: string | null
          confirmed_slot?: Json | null
          consultation_number: string
          created_at?: string
          customer_id?: string | null
          id?: string
          lead_id?: string | null
          note?: string | null
          preferred_slots?: Json
          service_category?:
            | Database["public"]["Enums"]["service_category"]
            | null
          status?: Database["public"]["Enums"]["consultation_status"]
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          channel?: Database["public"]["Enums"]["consultation_channel"]
          city_id?: string | null
          confirmed_slot?: Json | null
          consultation_number?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          lead_id?: string | null
          note?: string | null
          preferred_slots?: Json
          service_category?:
            | Database["public"]["Enums"]["service_category"]
            | null
          status?: Database["public"]["Enums"]["consultation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          consent: boolean
          created_at: string
          email: string | null
          id: string
          inquiry_type: Database["public"]["Enums"]["contact_inquiry_type"]
          message: string | null
          name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["contact_status"]
        }
        Insert: {
          consent?: boolean
          created_at?: string
          email?: string | null
          id?: string
          inquiry_type?: Database["public"]["Enums"]["contact_inquiry_type"]
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string | null
          id?: string
          inquiry_type?: Database["public"]["Enums"]["contact_inquiry_type"]
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
        }
        Relationships: []
      }
      content_revisions: {
        Row: {
          action: string
          actor_staff_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          snapshot: Json
          version: number
        }
        Insert: {
          action?: string
          actor_staff_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          snapshot: Json
          version: number
        }
        Update: {
          action?: string
          actor_staff_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_revisions_actor_staff_id_fkey"
            columns: ["actor_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_consent_logs: {
        Row: {
          action: Database["public"]["Enums"]["cookie_action"]
          categories_json: Json
          consent_version: string | null
          created_at: string
          customer_id: string | null
          id: string
          ip: unknown
          session_ref: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["cookie_action"]
          categories_json?: Json
          consent_version?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          ip?: unknown
          session_ref?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["cookie_action"]
          categories_json?: Json
          consent_version?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          ip?: unknown
          session_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cookie_consent_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["price_type"]
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          min_order_amount: number | null
          per_customer_limit: number | null
          scope: string | null
          scope_id: string | null
          starts_at: string | null
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["price_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          per_customer_limit?: number | null
          scope?: string | null
          scope_id?: string | null
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["price_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          per_customer_limit?: number | null
          scope?: string | null
          scope_id?: string | null
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line: string | null
          city: string | null
          country: string
          created_at: string
          customer_id: string
          deleted_at: string | null
          district: string | null
          full_name: string
          id: string
          is_default: boolean
          is_default_billing: boolean
          is_default_shipping: boolean
          label: string | null
          neighborhood: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          country?: string
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          district?: string | null
          full_name: string
          id?: string
          is_default?: boolean
          is_default_billing?: boolean
          is_default_shipping?: boolean
          label?: string | null
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          city?: string | null
          country?: string
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          district?: string | null
          full_name?: string
          id?: string
          is_default?: boolean
          is_default_billing?: boolean
          is_default_shipping?: boolean
          label?: string | null
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_data_requests: {
        Row: {
          customer_id: string
          id: string
          kind: Database["public"]["Enums"]["data_request_kind"]
          note: string | null
          requested_at: string
          resolution_note: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["data_request_status"]
        }
        Insert: {
          customer_id: string
          id?: string
          kind: Database["public"]["Enums"]["data_request_kind"]
          note?: string | null
          requested_at?: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["data_request_status"]
        }
        Update: {
          customer_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["data_request_kind"]
          note?: string | null
          requested_at?: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["data_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "customer_data_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_digital_projects: {
        Row: {
          access_token_hash: string | null
          created_at: string
          customer_id: string
          delivered_url: string | null
          digital_product_id: string | null
          expires_at: string | null
          id: string
          order_item_id: string | null
          project_data: Json
          status: Database["public"]["Enums"]["digital_project_status"]
          updated_at: string
        }
        Insert: {
          access_token_hash?: string | null
          created_at?: string
          customer_id: string
          delivered_url?: string | null
          digital_product_id?: string | null
          expires_at?: string | null
          id?: string
          order_item_id?: string | null
          project_data?: Json
          status?: Database["public"]["Enums"]["digital_project_status"]
          updated_at?: string
        }
        Update: {
          access_token_hash?: string | null
          created_at?: string
          customer_id?: string
          delivered_url?: string | null
          digital_product_id?: string | null
          expires_at?: string | null
          id?: string
          order_item_id?: string | null
          project_data?: Json
          status?: Database["public"]["Enums"]["digital_project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cdp_order_item_fk"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_digital_projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_digital_projects_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_digital_projects_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_identity_events: {
        Row: {
          auth_user_id: string
          created_at: string
          customer_id: string
          event_type: string
          id: string
          provider: string
          provider_identity_hash: string | null
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          customer_id: string
          event_type: string
          id?: string
          provider: string
          provider_identity_hash?: string | null
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          customer_id?: string
          event_type?: string
          id?: string
          provider?: string
          provider_identity_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_identity_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          author_staff_id: string | null
          created_at: string
          customer_id: string
          id: string
          note: string
        }
        Insert: {
          author_staff_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          note: string
        }
        Update: {
          author_staff_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_author_staff_id_fkey"
            columns: ["author_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_support_messages: {
        Row: {
          attachment_ids: string[]
          created_at: string
          id: string
          is_internal_note: boolean
          message: string
          sender_id: string | null
          sender_type: Database["public"]["Enums"]["support_sender_type"]
          thread_id: string
        }
        Insert: {
          attachment_ids?: string[]
          created_at?: string
          id?: string
          is_internal_note?: boolean
          message: string
          sender_id?: string | null
          sender_type: Database["public"]["Enums"]["support_sender_type"]
          thread_id: string
        }
        Update: {
          attachment_ids?: string[]
          created_at?: string
          id?: string
          is_internal_note?: boolean
          message?: string
          sender_id?: string | null
          sender_type?: Database["public"]["Enums"]["support_sender_type"]
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_support_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "customer_support_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_support_threads: {
        Row: {
          assigned_staff_id: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string | null
          reservation_id: string | null
          source: Database["public"]["Enums"]["support_source"]
          status: Database["public"]["Enums"]["support_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id?: string | null
          reservation_id?: string | null
          source?: Database["public"]["Enums"]["support_source"]
          status?: Database["public"]["Enums"]["support_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string | null
          reservation_id?: string | null
          source?: Database["public"]["Enums"]["support_source"]
          status?: Database["public"]["Enums"]["support_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_support_threads_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_support_threads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_support_threads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_support_threads_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_uploads: {
        Row: {
          anonymous_token_hash: string | null
          cart_id: string
          created_at: string
          customer_id: string | null
          id: string
          mime_type: string
          original_name: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          anonymous_token_hash?: string | null
          cart_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          mime_type: string
          original_name: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          anonymous_token_hash?: string | null
          cart_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          mime_type?: string
          original_name?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_uploads_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_uploads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          kvkk_consent_at: string | null
          marketing_consent_at: string | null
          name: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kvkk_consent_at?: string | null
          marketing_consent_at?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kvkk_consent_at?: string | null
          marketing_consent_at?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          icon_media_id: string | null
          id: string
          name_tr: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_media_id?: string | null
          id?: string
          name_tr: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_media_id?: string | null
          id?: string
          name_tr?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_icon_media_id_fkey"
            columns: ["icon_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_icon_media_id_fkey"
            columns: ["icon_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_assets: {
        Row: {
          asset_type: string | null
          bucket: string
          created_at: string
          digital_product_id: string
          id: string
          is_source: boolean
          storage_path: string
        }
        Insert: {
          asset_type?: string | null
          bucket?: string
          created_at?: string
          digital_product_id: string
          id?: string
          is_source?: boolean
          storage_path: string
        }
        Update: {
          asset_type?: string | null
          bucket?: string
          created_at?: string
          digital_product_id?: string
          id?: string
          is_source?: boolean
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_assets_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_assets_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_download_links: {
        Row: {
          created_at: string
          customer_digital_project_id: string
          download_count: number
          expires_at: string | null
          id: string
          max_downloads: number | null
          url_signed_ref: string | null
        }
        Insert: {
          created_at?: string
          customer_digital_project_id: string
          download_count?: number
          expires_at?: string | null
          id?: string
          max_downloads?: number | null
          url_signed_ref?: string | null
        }
        Update: {
          created_at?: string
          customer_digital_project_id?: string
          download_count?: number
          expires_at?: string | null
          id?: string
          max_downloads?: number | null
          url_signed_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_download_links_customer_digital_project_id_fkey"
            columns: ["customer_digital_project_id"]
            isOneToOne: false
            referencedRelation: "customer_digital_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_offerings: {
        Row: {
          collection_id: string | null
          description: string | null
          id: string
          preview_media_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          type: Database["public"]["Enums"]["digital_offering_type"]
        }
        Insert: {
          collection_id?: string | null
          description?: string | null
          id?: string
          preview_media_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          type: Database["public"]["Enums"]["digital_offering_type"]
        }
        Update: {
          collection_id?: string | null
          description?: string | null
          id?: string
          preview_media_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          type?: Database["public"]["Enums"]["digital_offering_type"]
        }
        Relationships: [
          {
            foreignKeyName: "digital_offerings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_offerings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_offerings_preview_media_id_fkey"
            columns: ["preview_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_offerings_preview_media_id_fkey"
            columns: ["preview_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_personalization_fields: {
        Row: {
          digital_product_id: string
          field_type: Database["public"]["Enums"]["personalization_field_type"]
          helper_text: string | null
          id: string
          label: string
          options: Json | null
          required: boolean
          sort_order: number
        }
        Insert: {
          digital_product_id: string
          field_type: Database["public"]["Enums"]["personalization_field_type"]
          helper_text?: string | null
          id?: string
          label: string
          options?: Json | null
          required?: boolean
          sort_order?: number
        }
        Update: {
          digital_product_id?: string
          field_type?: Database["public"]["Enums"]["personalization_field_type"]
          helper_text?: string | null
          id?: string
          label?: string
          options?: Json | null
          required?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "digital_personalization_fields_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_personalization_fields_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_products: {
        Row: {
          base_price: number | null
          behavior: Database["public"]["Enums"]["digital_behavior"]
          collection_id: string | null
          created_at: string
          delivery_mode: Database["public"]["Enums"]["digital_delivery_mode"]
          digital_type: Database["public"]["Enums"]["digital_type"]
          id: string
          name_tr: string
          preview_media_ids: string[]
          seo_metadata_id: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          behavior?: Database["public"]["Enums"]["digital_behavior"]
          collection_id?: string | null
          created_at?: string
          delivery_mode?: Database["public"]["Enums"]["digital_delivery_mode"]
          digital_type: Database["public"]["Enums"]["digital_type"]
          id?: string
          name_tr: string
          preview_media_ids?: string[]
          seo_metadata_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          behavior?: Database["public"]["Enums"]["digital_behavior"]
          collection_id?: string | null
          created_at?: string
          delivery_mode?: Database["public"]["Enums"]["digital_delivery_mode"]
          digital_type?: Database["public"]["Enums"]["digital_type"]
          id?: string
          name_tr?: string
          preview_media_ids?: string[]
          seo_metadata_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_products_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_products_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      email_delivery_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          notification_id: string | null
          occurred_at: string
          provider_event_id: string
          provider_message_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          notification_id?: string | null
          occurred_at: string
          provider_event_id: string
          provider_message_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          notification_id?: string | null
          occurred_at?: string
          provider_event_id?: string
          provider_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_delivery_events_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_outbox"
            referencedColumns: ["id"]
          },
        ]
      }
      email_suppressions: {
        Row: {
          created_at: string
          first_occurred_at: string
          id: string
          last_occurred_at: string
          provider: string
          provider_message_id: string | null
          reason: string
          recipient_hash: string
        }
        Insert: {
          created_at?: string
          first_occurred_at: string
          id?: string
          last_occurred_at: string
          provider?: string
          provider_message_id?: string | null
          reason: string
          recipient_hash: string
        }
        Update: {
          created_at?: string
          first_occurred_at?: string
          id?: string
          last_occurred_at?: string
          provider?: string
          provider_message_id?: string | null
          reason?: string
          recipient_hash?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          id: string
          name_tr: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          id?: string
          name_tr: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          id?: string
          name_tr?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: []
      }
      experiences: {
        Row: {
          created_at: string
          hero_media_id: string | null
          id: string
          included_modules: Json
          name: string
          process_steps: Json
          seo_metadata_id: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_media_id?: string | null
          id?: string
          included_modules?: Json
          name: string
          process_steps?: Json
          seo_metadata_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_media_id?: string | null
          id?: string
          included_modules?: Json
          name?: string
          process_steps?: Json
          seo_metadata_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: Database["public"]["Enums"]["faq_category"]
          id: string
          linked_entity_id: string | null
          linked_entity_type: string | null
          question: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          answer: string
          category?: Database["public"]["Enums"]["faq_category"]
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          question: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          answer?: string
          category?: Database["public"]["Enums"]["faq_category"]
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          question?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          item_id: string
          item_type: Database["public"]["Enums"]["favorite_item_type"]
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          item_id: string
          item_type: Database["public"]["Enums"]["favorite_item_type"]
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          item_id?: string
          item_type?: Database["public"]["Enums"]["favorite_item_type"]
        }
        Relationships: [
          {
            foreignKeyName: "favorites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_audit_log: {
        Row: {
          action: string
          actor_staff_id: string | null
          actor_type: string
          correlation_id: string
          created_at: string
          id: string
          metadata: Json
          order_id: string | null
          payment_event_id: string | null
          payment_id: string | null
          provider_event_id: string | null
          refund_id: string | null
          severity: string
        }
        Insert: {
          action: string
          actor_staff_id?: string | null
          actor_type: string
          correlation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          order_id?: string | null
          payment_event_id?: string | null
          payment_id?: string | null
          provider_event_id?: string | null
          refund_id?: string | null
          severity?: string
        }
        Update: {
          action?: string
          actor_staff_id?: string | null
          actor_type?: string
          correlation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          order_id?: string | null
          payment_event_id?: string | null
          payment_id?: string | null
          provider_event_id?: string | null
          refund_id?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_audit_log_actor_staff_id_fkey"
            columns: ["actor_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_audit_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_audit_log_payment_event_id_fkey"
            columns: ["payment_event_id"]
            isOneToOne: false
            referencedRelation: "payment_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_audit_log_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_audit_log_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["id"]
          },
        ]
      }
      galleries: {
        Row: {
          created_at: string
          id: string
          linked_entity_id: string | null
          linked_entity_type: string | null
          media_ids: string[]
          status: Database["public"]["Enums"]["content_status"]
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          media_ids?: string[]
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          media_ids?: string[]
          status?: Database["public"]["Enums"]["content_status"]
          title?: string | null
        }
        Relationships: []
      }
      installment_options: {
        Row: {
          card_family: string | null
          count: number
          id: string
          is_active: boolean
          min_amount: number
          provider: Database["public"]["Enums"]["payment_provider"]
        }
        Insert: {
          card_family?: string | null
          count: number
          id?: string
          is_active?: boolean
          min_amount?: number
          provider: Database["public"]["Enums"]["payment_provider"]
        }
        Update: {
          card_family?: string | null
          count?: number
          id?: string
          is_active?: boolean
          min_amount?: number
          provider?: Database["public"]["Enums"]["payment_provider"]
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          delta: number
          id: string
          note: string | null
          quantity_after: number
          quantity_before: number
          reason: string
          staff_user_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          note?: string | null
          quantity_after: number
          quantity_before: number
          reason: string
          staff_user_id: string
          variant_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          note?: string | null
          quantity_after?: number
          quantity_before?: number
          reason?: string
          staff_user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          lead_id: string
          note: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          note: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_status: Database["public"]["Enums"]["lead_status"] | null
          id: string
          lead_id: string
          to_status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["lead_status"] | null
          id?: string
          lead_id: string
          to_status: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["lead_status"] | null
          id?: string
          lead_id?: string
          to_status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_staff_id: string | null
          budget_band: Database["public"]["Enums"]["price_band"] | null
          converted_customer_id: string | null
          created_at: string
          email: string | null
          event_date_or_season: string | null
          event_type: string | null
          guest_count_band: string | null
          id: string
          location: string | null
          lost_reason: string | null
          message: string | null
          metadata: Json
          name: string | null
          next_follow_up_at: string | null
          phone: string | null
          priority: string
          source_entity_id: string | null
          source_entity_type: string | null
          source_type: Database["public"]["Enums"]["lead_source_type"]
          status: Database["public"]["Enums"]["lead_status"]
          style_notes: string | null
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          budget_band?: Database["public"]["Enums"]["price_band"] | null
          converted_customer_id?: string | null
          created_at?: string
          email?: string | null
          event_date_or_season?: string | null
          event_type?: string | null
          guest_count_band?: string | null
          id?: string
          location?: string | null
          lost_reason?: string | null
          message?: string | null
          metadata?: Json
          name?: string | null
          next_follow_up_at?: string | null
          phone?: string | null
          priority?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          source_type?: Database["public"]["Enums"]["lead_source_type"]
          status?: Database["public"]["Enums"]["lead_status"]
          style_notes?: string | null
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          budget_band?: Database["public"]["Enums"]["price_band"] | null
          converted_customer_id?: string | null
          created_at?: string
          email?: string | null
          event_date_or_season?: string | null
          event_type?: string | null
          guest_count_band?: string | null
          id?: string
          location?: string | null
          lost_reason?: string | null
          message?: string | null
          metadata?: Json
          name?: string | null
          next_follow_up_at?: string | null
          phone?: string | null
          priority?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          source_type?: Database["public"]["Enums"]["lead_source_type"]
          status?: Database["public"]["Enums"]["lead_status"]
          style_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_customer_id_fkey"
            columns: ["converted_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_document_versions: {
        Row: {
          approval_status: string
          body: Json
          content_hash: string | null
          created_at: string
          effective_from: string | null
          id: string
          is_current: boolean
          legal_document_id: string
          lifecycle_state: string
          locale: string
          needs_lawyer_review: boolean
          published_at: string | null
          published_by: string | null
          source_metadata: Json
          summary: string | null
          supersedes_version_id: string | null
          updated_at: string
          version: string
        }
        Insert: {
          approval_status?: string
          body?: Json
          content_hash?: string | null
          created_at?: string
          effective_from?: string | null
          id?: string
          is_current?: boolean
          legal_document_id: string
          lifecycle_state?: string
          locale?: string
          needs_lawyer_review?: boolean
          published_at?: string | null
          published_by?: string | null
          source_metadata?: Json
          summary?: string | null
          supersedes_version_id?: string | null
          updated_at?: string
          version: string
        }
        Update: {
          approval_status?: string
          body?: Json
          content_hash?: string | null
          created_at?: string
          effective_from?: string | null
          id?: string
          is_current?: boolean
          legal_document_id?: string
          lifecycle_state?: string
          locale?: string
          needs_lawyer_review?: boolean
          published_at?: string | null
          published_by?: string | null
          source_metadata?: Json
          summary?: string | null
          supersedes_version_id?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_versions_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_document_versions_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents_public"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "legal_document_versions_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_document_versions_supersedes_version_id_fkey"
            columns: ["supersedes_version_id"]
            isOneToOne: false
            referencedRelation: "legal_document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_document_versions_supersedes_version_id_fkey"
            columns: ["supersedes_version_id"]
            isOneToOne: false
            referencedRelation: "legal_documents_public"
            referencedColumns: ["version_id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          doc_key: Database["public"]["Enums"]["legal_doc_key"]
          id: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title_tr: string
        }
        Insert: {
          doc_key: Database["public"]["Enums"]["legal_doc_key"]
          id?: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title_tr: string
        }
        Update: {
          doc_key?: Database["public"]["Enums"]["legal_doc_key"]
          id?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title_tr?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          id: string
          name_tr: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name_tr: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name_tr?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          archived_at: string | null
          bucket: string
          content_hash: string | null
          created_at: string
          focal_x: number
          focal_y: number
          height: number | null
          id: string
          is_public: boolean
          linked_entity_id: string | null
          linked_entity_type: string | null
          mime_type: string | null
          size_bytes: number | null
          storage_path: string | null
          tags: string[]
          title: string | null
          type: Database["public"]["Enums"]["media_type"]
          uploaded_by: string | null
          url: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          archived_at?: string | null
          bucket?: string
          content_hash?: string | null
          created_at?: string
          focal_x?: number
          focal_y?: number
          height?: number | null
          id?: string
          is_public?: boolean
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          tags?: string[]
          title?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          uploaded_by?: string | null
          url?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          archived_at?: string | null
          bucket?: string
          content_hash?: string | null
          created_at?: string
          focal_x?: number
          focal_y?: number
          height?: number | null
          id?: string
          is_public?: boolean
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          tags?: string[]
          title?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          uploaded_by?: string | null
          url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      media_usage_refs: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          field_name: string
          id: string
          media_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          field_name: string
          id?: string
          media_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          field_name?: string
          id?: string
          media_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_refs_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_usage_refs_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_offerings: {
        Row: {
          collection_id: string | null
          delivery_timeline_days: number | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          type: Database["public"]["Enums"]["memory_offering_type"]
        }
        Insert: {
          collection_id?: string | null
          delivery_timeline_days?: number | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          type: Database["public"]["Enums"]["memory_offering_type"]
        }
        Update: {
          collection_id?: string | null
          delivery_timeline_days?: number | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          type?: Database["public"]["Enums"]["memory_offering_type"]
        }
        Relationships: [
          {
            foreignKeyName: "memory_offerings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_offerings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_timeline: {
        Row: {
          created_at: string
          detail: Json
          from_status: string | null
          id: string
          notification_id: string
          provider_event_id: string | null
          source: string
          staff_user_id: string | null
          to_status: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          from_status?: string | null
          id?: string
          notification_id: string
          provider_event_id?: string | null
          source: string
          staff_user_id?: string | null
          to_status: string
        }
        Update: {
          created_at?: string
          detail?: Json
          from_status?: string | null
          id?: string
          notification_id?: string
          provider_event_id?: string | null
          source?: string
          staff_user_id?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_timeline_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_outbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_delivery_timeline_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          aggregate_id: string | null
          aggregate_type: string
          attempts: number
          available_at: string
          cancelled_at: string | null
          category: string
          channel: Database["public"]["Enums"]["notification_channel"]
          correlation_id: string
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          environment: string
          event_type: string
          failed_at: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          last_error_code: string | null
          last_provider_event_at: string | null
          locale: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          next_attempt_at: string
          order_id: string | null
          payload: Json
          provider: string | null
          provider_message_id: string | null
          recipient_email: string | null
          recipient_kind: string
          reply_to_route: string | null
          review_required_at: string | null
          sender_email: string | null
          sent_at: string | null
          status: string
          suppressed_at: string | null
          template_key: string
          updated_at: string
        }
        Insert: {
          aggregate_id?: string | null
          aggregate_type: string
          attempts?: number
          available_at?: string
          cancelled_at?: string | null
          category?: string
          channel: Database["public"]["Enums"]["notification_channel"]
          correlation_id?: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          environment?: string
          event_type: string
          failed_at?: string | null
          id?: string
          idempotency_key: string
          last_error?: string | null
          last_error_code?: string | null
          last_provider_event_at?: string | null
          locale?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_attempt_at?: string
          order_id?: string | null
          payload?: Json
          provider?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_kind?: string
          reply_to_route?: string | null
          review_required_at?: string | null
          sender_email?: string | null
          sent_at?: string | null
          status?: string
          suppressed_at?: string | null
          template_key: string
          updated_at?: string
        }
        Update: {
          aggregate_id?: string | null
          aggregate_type?: string
          attempts?: number
          available_at?: string
          cancelled_at?: string | null
          category?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          correlation_id?: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          environment?: string
          event_type?: string
          failed_at?: string | null
          id?: string
          idempotency_key?: string
          last_error?: string | null
          last_error_code?: string | null
          last_provider_event_at?: string | null
          locale?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_attempt_at?: string
          order_id?: string | null
          payload?: Json
          provider?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_kind?: string
          reply_to_route?: string | null
          review_required_at?: string | null
          sender_email?: string | null
          sent_at?: string | null
          status?: string
          suppressed_at?: string | null
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_outbox_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string
          channel: Database["public"]["Enums"]["notification_channel"]
          customer_id: string
          id: string
          opted_in: boolean
          updated_at: string
        }
        Insert: {
          category: string
          channel: Database["public"]["Enums"]["notification_channel"]
          customer_id: string
          id?: string
          opted_in?: boolean
          updated_at?: string
        }
        Update: {
          category?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          customer_id?: string
          id?: string
          opted_in?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body_tr: string | null
          created_at: string
          customer_id: string
          id: string
          is_read: boolean
          link: string | null
          title_tr: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body_tr?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_read?: boolean
          link?: string | null
          title_tr: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body_tr?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title_tr?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_cancellation_requests: {
        Row: {
          created_at: string
          customer_id: string
          eligibility_snapshot: Json
          id: string
          order_id: string
          reason: string
          resolution_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          eligibility_snapshot?: Json
          id?: string
          order_id: string
          reason: string
          resolution_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          eligibility_snapshot?: Json
          id?: string
          order_id?: string
          reason?: string
          resolution_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_cancellation_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_cancellation_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_cancellation_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          digital_product_id: string | null
          id: string
          order_id: string
          personalization_json: Json | null
          product_id: string | null
          product_snapshot: Json
          quantity: number
          requires_proof: boolean
          selected_addons_json: Json | null
          total_price: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          digital_product_id?: string | null
          id?: string
          order_id: string
          personalization_json?: Json | null
          product_id?: string | null
          product_snapshot?: Json
          quantity?: number
          requires_proof?: boolean
          selected_addons_json?: Json | null
          total_price?: number
          unit_price?: number
          variant_id?: string | null
        }
        Update: {
          digital_product_id?: string | null
          id?: string
          order_id?: string
          personalization_json?: Json | null
          product_id?: string | null
          product_snapshot?: Json
          quantity?: number
          requires_proof?: boolean
          selected_addons_json?: Json | null
          total_price?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "digital_products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_events: {
        Row: {
          actor_customer_id: string | null
          actor_staff_id: string | null
          actor_type: string
          created_at: string
          detail_tr: string | null
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          metadata: Json
          order_id: string
          title_tr: string
          to_status: Database["public"]["Enums"]["order_status"]
          visible_to_customer: boolean
        }
        Insert: {
          actor_customer_id?: string | null
          actor_staff_id?: string | null
          actor_type: string
          created_at?: string
          detail_tr?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json
          order_id: string
          title_tr: string
          to_status: Database["public"]["Enums"]["order_status"]
          visible_to_customer?: boolean
        }
        Update: {
          actor_customer_id?: string | null
          actor_staff_id?: string | null
          actor_type?: string
          created_at?: string
          detail_tr?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json
          order_id?: string
          title_tr?: string
          to_status?: Database["public"]["Enums"]["order_status"]
          visible_to_customer?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "order_status_events_actor_customer_id_fkey"
            columns: ["actor_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_events_actor_staff_id_fkey"
            columns: ["actor_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_staff_id: string | null
          balance_amount: number | null
          billing_address_snapshot: Json | null
          checkout_session_id: string | null
          created_at: string
          currency: string
          customer_id: string | null
          customer_note: string | null
          delivery_address_snapshot: Json | null
          deposit_amount: number | null
          einvoice_ref: string | null
          einvoice_status: Database["public"]["Enums"]["einvoice_status"]
          fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]
          id: string
          installment_count: number
          internal_note: string | null
          invoice_identity: Json
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          legal_snapshot: Json | null
          order_number: string
          payable_type: Database["public"]["Enums"]["payable_type"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          reservation_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          balance_amount?: number | null
          billing_address_snapshot?: Json | null
          checkout_session_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_note?: string | null
          delivery_address_snapshot?: Json | null
          deposit_amount?: number | null
          einvoice_ref?: string | null
          einvoice_status?: Database["public"]["Enums"]["einvoice_status"]
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          installment_count?: number
          internal_note?: string | null
          invoice_identity?: Json
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          legal_snapshot?: Json | null
          order_number: string
          payable_type?: Database["public"]["Enums"]["payable_type"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          balance_amount?: number | null
          billing_address_snapshot?: Json | null
          checkout_session_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_note?: string | null
          delivery_address_snapshot?: Json | null
          deposit_amount?: number | null
          einvoice_ref?: string | null
          einvoice_status?: Database["public"]["Enums"]["einvoice_status"]
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          installment_count?: number
          internal_note?: string | null
          invoice_identity?: Json
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          legal_snapshot?: Json | null
          order_number?: string
          payable_type?: Database["public"]["Enums"]["payable_type"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      packages_internal: {
        Row: {
          experience_id: string | null
          id: string
          included_service_ids: string[]
          name: string
          price_band: Database["public"]["Enums"]["price_band"] | null
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          experience_id?: string | null
          id?: string
          included_service_ids?: string[]
          name: string
          price_band?: Database["public"]["Enums"]["price_band"] | null
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          experience_id?: string | null
          id?: string
          included_service_ids?: string[]
          name?: string
          price_band?: Database["public"]["Enums"]["price_band"] | null
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: [
          {
            foreignKeyName: "packages_internal_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_internal_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences_public"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          body: Json
          created_at: string
          id: string
          seo_metadata_id: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          body?: Json
          created_at?: string
          id?: string
          seo_metadata_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: Json
          created_at?: string
          id?: string
          seo_metadata_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          correlation_id: string | null
          error_code: string | null
          event_type: string | null
          id: string
          outcome: string
          payload: Json | null
          payload_digest: string | null
          payment_id: string | null
          processing_status: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_event_id: string | null
          received_at: string
          signature_valid: boolean
        }
        Insert: {
          correlation_id?: string | null
          error_code?: string | null
          event_type?: string | null
          id?: string
          outcome?: string
          payload?: Json | null
          payload_digest?: string | null
          payment_id?: string | null
          processing_status?: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_event_id?: string | null
          received_at?: string
          signature_valid?: boolean
        }
        Update: {
          correlation_id?: string | null
          error_code?: string | null
          event_type?: string | null
          id?: string
          outcome?: string
          payload?: Json | null
          payload_digest?: string | null
          payment_id?: string | null
          processing_status?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_event_id?: string | null
          received_at?: string
          signature_valid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_rate_limits: {
        Row: {
          identity_hash: string
          request_count: number
          route_key: string
          window_started_at: string
        }
        Insert: {
          identity_hash: string
          request_count: number
          route_key: string
          window_started_at: string
        }
        Update: {
          identity_hash?: string
          request_count?: number
          route_key?: string
          window_started_at?: string
        }
        Relationships: []
      }
      payment_reconciliation_discrepancies: {
        Row: {
          assigned_reviewer: string | null
          created_at: string
          discrepancy_type: string
          evidence: Json
          expected_amount_minor: number | null
          fingerprint: string
          id: string
          last_checked_at: string
          order_id: string | null
          payment_event_id: string | null
          payment_id: string | null
          provider_amount_minor: number | null
          provider_reference: string | null
          recommended_action: string
          refund_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_reviewer?: string | null
          created_at?: string
          discrepancy_type: string
          evidence?: Json
          expected_amount_minor?: number | null
          fingerprint: string
          id?: string
          last_checked_at?: string
          order_id?: string | null
          payment_event_id?: string | null
          payment_id?: string | null
          provider_amount_minor?: number | null
          provider_reference?: string | null
          recommended_action: string
          refund_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_reviewer?: string | null
          created_at?: string
          discrepancy_type?: string
          evidence?: Json
          expected_amount_minor?: number | null
          fingerprint?: string
          id?: string
          last_checked_at?: string
          order_id?: string | null
          payment_event_id?: string | null
          payment_id?: string | null
          provider_amount_minor?: number | null
          provider_reference?: string | null
          recommended_action?: string
          refund_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reconciliation_discrepancies_assigned_reviewer_fkey"
            columns: ["assigned_reviewer"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reconciliation_discrepancies_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reconciliation_discrepancies_payment_event_id_fkey"
            columns: ["payment_event_id"]
            isOneToOne: false
            referencedRelation: "payment_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reconciliation_discrepancies_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reconciliation_discrepancies_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          amount_minor: number
          attempt_number: number
          captured_total_minor: number | null
          card_family: string | null
          checkout_session_id: string | null
          correlation_id: string | null
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          initialized_at: string | null
          installment_count: number
          last_error_code: string | null
          last_error_message: string | null
          masked_card: string | null
          order_id: string | null
          paid_at: string | null
          pending_expires_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_conversation_id: string | null
          provider_payment_id: string | null
          provider_redirect_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          amount_minor: number
          attempt_number?: number
          captured_total_minor?: number | null
          card_family?: string | null
          checkout_session_id?: string | null
          correlation_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          initialized_at?: string | null
          installment_count?: number
          last_error_code?: string | null
          last_error_message?: string | null
          masked_card?: string | null
          order_id?: string | null
          paid_at?: string | null
          pending_expires_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_conversation_id?: string | null
          provider_payment_id?: string | null
          provider_redirect_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_minor?: number
          attempt_number?: number
          captured_total_minor?: number | null
          card_family?: string | null
          checkout_session_id?: string | null
          correlation_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          initialized_at?: string | null
          installment_count?: number
          last_error_code?: string | null
          last_error_message?: string | null
          masked_card?: string | null
          order_id?: string | null
          paid_at?: string | null
          pending_expires_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_conversation_id?: string | null
          provider_payment_id?: string | null
          provider_redirect_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_checkout_session_id_fkey"
            columns: ["checkout_session_id"]
            isOneToOne: false
            referencedRelation: "checkout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          city: string | null
          collection_id: string | null
          cover_media_id: string | null
          created_at: string
          event_type: string | null
          gallery_id: string | null
          guest_count_band: string | null
          id: string
          internal_credit_notes: string | null
          seo_metadata_id: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          testimonial_id: string | null
          title: string
        }
        Insert: {
          city?: string | null
          collection_id?: string | null
          cover_media_id?: string | null
          created_at?: string
          event_type?: string | null
          gallery_id?: string | null
          guest_count_band?: string | null
          id?: string
          internal_credit_notes?: string | null
          seo_metadata_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          testimonial_id?: string | null
          title: string
        }
        Update: {
          city?: string | null
          collection_id?: string | null
          cover_media_id?: string | null
          created_at?: string
          event_type?: string | null
          gallery_id?: string | null
          guest_count_band?: string | null
          id?: string
          internal_credit_notes?: string | null
          seo_metadata_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          testimonial_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_addons: {
        Row: {
          addon_type: Database["public"]["Enums"]["addon_type"]
          id: string
          is_optional: boolean
          name_tr: string
          price: number
          price_type: Database["public"]["Enums"]["price_type"]
          product_id: string | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          addon_type?: Database["public"]["Enums"]["addon_type"]
          id?: string
          is_optional?: boolean
          name_tr: string
          price?: number
          price_type?: Database["public"]["Enums"]["price_type"]
          product_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          addon_type?: Database["public"]["Enums"]["addon_type"]
          id?: string
          is_optional?: boolean
          name_tr?: string
          price?: number
          price_type?: Database["public"]["Enums"]["price_type"]
          product_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: [
          {
            foreignKeyName: "product_addons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_addons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_addons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_city_availability: {
        Row: {
          city_id: string
          extra_lead_time_days: number | null
          id: string
          is_available: boolean
          product_id: string
        }
        Insert: {
          city_id: string
          extra_lead_time_days?: number | null
          id?: string
          is_available?: boolean
          product_id: string
        }
        Update: {
          city_id?: string
          extra_lead_time_days?: number | null
          id?: string
          is_available?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_city_availability_city_fk"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_city_availability_city_fk"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_city_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_city_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_city_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colors: {
        Row: {
          color_id: string
          product_id: string
        }
        Insert: {
          color_id: string
          product_id: string
        }
        Update: {
          color_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "product_colors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_event_types: {
        Row: {
          event_type_id: string
          product_id: string
        }
        Insert: {
          event_type_id: string
          product_id: string
        }
        Update: {
          event_type_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_event_types_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_event_types_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_event_types_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_event_types_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_materials: {
        Row: {
          material_id: string
          product_id: string
        }
        Insert: {
          material_id: string
          product_id: string
        }
        Update: {
          material_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "product_materials_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          created_at: string
          id: string
          is_cover: boolean
          media_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_cover?: boolean
          media_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_cover?: boolean
          media_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_personalization_fields: {
        Row: {
          field_type: Database["public"]["Enums"]["personalization_field_type"]
          helper_text: string | null
          id: string
          label: string
          options: Json | null
          product_id: string
          required: boolean
          sort_order: number
        }
        Insert: {
          field_type: Database["public"]["Enums"]["personalization_field_type"]
          helper_text?: string | null
          id?: string
          label: string
          options?: Json | null
          product_id: string
          required?: boolean
          sort_order?: number
        }
        Update: {
          field_type?: Database["public"]["Enums"]["personalization_field_type"]
          helper_text?: string | null
          id?: string
          label?: string
          options?: Json | null
          product_id?: string
          required?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_personalization_fields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_personalization_fields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_personalization_fields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_tiers: {
        Row: {
          id: string
          min_qty: number
          product_id: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          id?: string
          min_qty: number
          product_id: string
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          id?: string
          min_qty?: number
          product_id?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_tiers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_tiers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_proofs: {
        Row: {
          approved_at: string | null
          assigned_staff_id: string | null
          created_at: string
          created_by: string | null
          customer_comment: string | null
          due_at: string | null
          file_name: string | null
          file_size_bytes: number | null
          id: string
          media_id: string | null
          mime_type: string | null
          order_id: string
          order_item_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["proof_status"]
          storage_path: string | null
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          assigned_staff_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_comment?: string | null
          due_at?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          media_id?: string | null
          mime_type?: string | null
          order_id: string
          order_item_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proof_status"]
          storage_path?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          assigned_staff_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_comment?: string | null
          due_at?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          media_id?: string | null
          mime_type?: string | null
          order_id?: string
          order_item_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["proof_status"]
          storage_path?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_proofs_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_proofs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_proofs_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_proofs_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_proofs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_proofs_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_publication_events: {
        Row: {
          action: string
          actor_staff_id: string | null
          created_at: string
          id: string
          product_id: string
          readiness: Json
        }
        Insert: {
          action: string
          actor_staff_id?: string | null
          created_at?: string
          id?: string
          product_id: string
          readiness?: Json
        }
        Update: {
          action?: string
          actor_staff_id?: string | null
          created_at?: string
          id?: string
          product_id?: string
          readiness?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_publication_events_actor_staff_id_fkey"
            columns: ["actor_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_publication_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_publication_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_publication_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tag_links: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tag_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_tag_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tag_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tag_links_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "product_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          id: string
          name_tr: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name_tr: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name_tr?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          option_values: Json
          price: number | null
          product_id: string
          sku: string | null
          sort_order: number
          status: Database["public"]["Enums"]["variant_status"]
          stock_quantity: number | null
          title: string
        }
        Insert: {
          id?: string
          option_values?: Json
          price?: number | null
          product_id: string
          sku?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["variant_status"]
          stock_quantity?: number | null
          title: string
        }
        Update: {
          id?: string
          option_values?: Json
          price?: number | null
          product_id?: string
          sku?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["variant_status"]
          stock_quantity?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      production_jobs: {
        Row: {
          approved_proof_id: string | null
          assigned_staff_id: string | null
          blocker: string | null
          completed_at: string | null
          created_at: string
          due_at: string | null
          id: string
          internal_note: string | null
          material_ready: boolean
          order_id: string
          order_item_id: string
          paused_at: string | null
          priority: number
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_proof_id?: string | null
          assigned_staff_id?: string | null
          blocker?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          internal_note?: string | null
          material_ready?: boolean
          order_id: string
          order_item_id: string
          paused_at?: string | null
          priority?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_proof_id?: string | null
          assigned_staff_id?: string | null
          blocker?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          internal_note?: string | null
          material_ready?: boolean
          order_id?: string
          order_item_id?: string
          paused_at?: string | null
          priority?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_jobs_approved_proof_id_fkey"
            columns: ["approved_proof_id"]
            isOneToOne: false
            referencedRelation: "product_proofs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_jobs_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_jobs_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: true
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          base_price: number | null
          behavior_type: Database["public"]["Enums"]["product_behavior"]
          brand_motif_tags: string[]
          category_id: string | null
          collection_id: string | null
          collection_set_id: string | null
          created_at: string
          currency: string
          delivery_note: string | null
          description: string | null
          gift_wrapping_available: boolean
          id: string
          internal_cost: number | null
          is_personalizable: boolean
          material_story: string | null
          materials: string | null
          media_ids: string[]
          motif: string | null
          name: string
          object_type: string | null
          occasion_type: string | null
          packaging_notes: string | null
          personalization_options: Json
          price_band: Database["public"]["Enums"]["price_band"] | null
          production_time_days: number | null
          proof_required: boolean
          published_at: string | null
          published_by: string | null
          return_note: string | null
          seo_metadata_id: string | null
          sku: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          stock_mode: Database["public"]["Enums"]["stock_mode"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          base_price?: number | null
          behavior_type?: Database["public"]["Enums"]["product_behavior"]
          brand_motif_tags?: string[]
          category_id?: string | null
          collection_id?: string | null
          collection_set_id?: string | null
          created_at?: string
          currency?: string
          delivery_note?: string | null
          description?: string | null
          gift_wrapping_available?: boolean
          id?: string
          internal_cost?: number | null
          is_personalizable?: boolean
          material_story?: string | null
          materials?: string | null
          media_ids?: string[]
          motif?: string | null
          name: string
          object_type?: string | null
          occasion_type?: string | null
          packaging_notes?: string | null
          personalization_options?: Json
          price_band?: Database["public"]["Enums"]["price_band"] | null
          production_time_days?: number | null
          proof_required?: boolean
          published_at?: string | null
          published_by?: string | null
          return_note?: string | null
          seo_metadata_id?: string | null
          sku?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          stock_mode?: Database["public"]["Enums"]["stock_mode"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          base_price?: number | null
          behavior_type?: Database["public"]["Enums"]["product_behavior"]
          brand_motif_tags?: string[]
          category_id?: string | null
          collection_id?: string | null
          collection_set_id?: string | null
          created_at?: string
          currency?: string
          delivery_note?: string | null
          description?: string | null
          gift_wrapping_available?: boolean
          id?: string
          internal_cost?: number | null
          is_personalizable?: boolean
          material_story?: string | null
          materials?: string | null
          media_ids?: string[]
          motif?: string | null
          name?: string
          object_type?: string | null
          occasion_type?: string | null
          packaging_notes?: string | null
          personalization_options?: Json
          price_band?: Database["public"]["Enums"]["price_band"] | null
          production_time_days?: number | null
          proof_required?: boolean
          published_at?: string | null
          published_by?: string | null
          return_note?: string | null
          seo_metadata_id?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          stock_mode?: Database["public"]["Enums"]["stock_mode"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_set_id_fkey"
            columns: ["collection_set_id"]
            isOneToOne: false
            referencedRelation: "collection_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_set_id_fkey"
            columns: ["collection_set_id"]
            isOneToOne: false
            referencedRelation: "collection_sets_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_comments: {
        Row: {
          actor_type: string
          comment: string
          created_at: string
          customer_id: string | null
          id: string
          proof_id: string
          staff_user_id: string | null
        }
        Insert: {
          actor_type: string
          comment: string
          created_at?: string
          customer_id?: string | null
          id?: string
          proof_id: string
          staff_user_id?: string | null
        }
        Update: {
          actor_type?: string
          comment?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          proof_id?: string
          staff_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proof_comments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_comments_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "product_proofs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_comments_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_check_items: {
        Row: {
          id: string
          is_required: boolean
          key: string
          label_tr: string
          note: string | null
          passed: boolean | null
          quality_check_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_required?: boolean
          key: string
          label_tr: string
          note?: string | null
          passed?: boolean | null
          quality_check_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_required?: boolean
          key?: string
          label_tr?: string
          note?: string | null
          passed?: boolean | null
          quality_check_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quality_check_items_quality_check_id_fkey"
            columns: ["quality_check_id"]
            isOneToOne: false
            referencedRelation: "quality_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checks: {
        Row: {
          checked_at: string | null
          checked_by: string | null
          created_at: string
          id: string
          note: string | null
          production_job_id: string
          status: string
        }
        Insert: {
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          production_job_id: string
          status?: string
        }
        Update: {
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          production_job_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checks_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_production_job_id_fkey"
            columns: ["production_job_id"]
            isOneToOne: false
            referencedRelation: "production_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          budget_band: Database["public"]["Enums"]["price_band"] | null
          city: string | null
          collection_id: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          event_date_or_season: string | null
          event_type: string | null
          experience_id: string | null
          guest_count: number | null
          id: string
          message: string | null
          name: string | null
          needed_modules: string[]
          phone: string | null
          service_package_ids: string[]
          status: Database["public"]["Enums"]["lead_status"]
          uploaded_file_ids: string[]
          venue_type: string | null
        }
        Insert: {
          budget_band?: Database["public"]["Enums"]["price_band"] | null
          city?: string | null
          collection_id?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          event_date_or_season?: string | null
          event_type?: string | null
          experience_id?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          name?: string | null
          needed_modules?: string[]
          phone?: string | null
          service_package_ids?: string[]
          status?: Database["public"]["Enums"]["lead_status"]
          uploaded_file_ids?: string[]
          venue_type?: string | null
        }
        Update: {
          budget_band?: Database["public"]["Enums"]["price_band"] | null
          city?: string | null
          collection_id?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          event_date_or_season?: string | null
          event_type?: string | null
          experience_id?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          name?: string | null
          needed_modules?: string[]
          phone?: string | null
          service_package_ids?: string[]
          status?: Database["public"]["Enums"]["lead_status"]
          uploaded_file_ids?: string[]
          venue_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_experience_fk"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_experience_fk"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences_public"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          city: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          deposit_required: number | null
          discount: number | null
          event_date: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          items: Json
          lead_id: string | null
          notes_customer: string | null
          notes_internal: string | null
          quote_number: string
          quote_request_id: string | null
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number | null
          terms_version: string | null
          total: number | null
          travel_fee: number | null
          updated_at: string
          valid_until: string | null
          venue: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deposit_required?: number | null
          discount?: number | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          items?: Json
          lead_id?: string | null
          notes_customer?: string | null
          notes_internal?: string | null
          quote_number: string
          quote_request_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number | null
          terms_version?: string | null
          total?: number | null
          travel_fee?: number | null
          updated_at?: string
          valid_until?: string | null
          venue?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deposit_required?: number | null
          discount?: number | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          items?: Json
          lead_id?: string | null
          notes_customer?: string | null
          notes_internal?: string | null
          quote_number?: string
          quote_request_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number | null
          terms_version?: string | null
          total?: number | null
          travel_fee?: number | null
          updated_at?: string
          valid_until?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          amount_minor: number
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          correlation_id: string | null
          created_at: string
          created_by: string | null
          id: string
          idempotency_key: string | null
          notes_internal: string | null
          order_id: string | null
          payment_id: string | null
          provider_error_code: string | null
          provider_error_message: string | null
          provider_reference: string | null
          provider_status: string
          reason: Database["public"]["Enums"]["refund_reason"]
          requested_by: string | null
          reservation_id: string | null
          retryable: boolean
          status: Database["public"]["Enums"]["refund_status"]
          submitted_at: string | null
          type: Database["public"]["Enums"]["refund_type"]
        }
        Insert: {
          amount: number
          amount_minor: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          idempotency_key?: string | null
          notes_internal?: string | null
          order_id?: string | null
          payment_id?: string | null
          provider_error_code?: string | null
          provider_error_message?: string | null
          provider_reference?: string | null
          provider_status?: string
          reason?: Database["public"]["Enums"]["refund_reason"]
          requested_by?: string | null
          reservation_id?: string | null
          retryable?: boolean
          status?: Database["public"]["Enums"]["refund_status"]
          submitted_at?: string | null
          type?: Database["public"]["Enums"]["refund_type"]
        }
        Update: {
          amount?: number
          amount_minor?: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          idempotency_key?: string | null
          notes_internal?: string | null
          order_id?: string | null
          payment_id?: string | null
          provider_error_code?: string | null
          provider_error_message?: string | null
          provider_reference?: string | null
          provider_status?: string
          reason?: Database["public"]["Enums"]["refund_reason"]
          requested_by?: string | null
          reservation_id?: string | null
          retryable?: boolean
          status?: Database["public"]["Enums"]["refund_status"]
          submitted_at?: string | null
          type?: Database["public"]["Enums"]["refund_type"]
        }
        Relationships: [
          {
            foreignKeyName: "refunds_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_status: Database["public"]["Enums"]["reservation_status"] | null
          id: string
          note: string | null
          reservation_id: string
          to_status: Database["public"]["Enums"]["reservation_status"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["reservation_status"] | null
          id?: string
          note?: string | null
          reservation_id: string
          to_status: Database["public"]["Enums"]["reservation_status"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["reservation_status"] | null
          id?: string
          note?: string | null
          reservation_id?: string
          to_status?: Database["public"]["Enums"]["reservation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reservation_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_status_history_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          addon_ids: string[]
          assigned_staff_id: string | null
          balance_due_date: string | null
          cancellation_reason: string | null
          city_id: string | null
          collection_id: string | null
          created_at: string
          customer_id: string
          deposit_amount: number | null
          deposit_paid_at: string | null
          event_date: string | null
          event_location: Json
          event_time: string | null
          guest_count: number | null
          id: string
          quote_id: string | null
          reservation_number: string
          service_package_id: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          addon_ids?: string[]
          assigned_staff_id?: string | null
          balance_due_date?: string | null
          cancellation_reason?: string | null
          city_id?: string | null
          collection_id?: string | null
          created_at?: string
          customer_id: string
          deposit_amount?: number | null
          deposit_paid_at?: string | null
          event_date?: string | null
          event_location?: Json
          event_time?: string | null
          guest_count?: number | null
          id?: string
          quote_id?: string | null
          reservation_number: string
          service_package_id?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          addon_ids?: string[]
          assigned_staff_id?: string | null
          balance_due_date?: string | null
          cancellation_reason?: string | null
          city_id?: string | null
          collection_id?: string | null
          created_at?: string
          customer_id?: string
          deposit_amount?: number | null
          deposit_paid_at?: string | null
          event_date?: string | null
          event_location?: Json
          event_time?: string | null
          guest_count?: number | null
          id?: string
          quote_id?: string | null
          reservation_number?: string
          service_package_id?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          customer_id: string
          id: string
          is_verified_purchase: boolean
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          order_id: string | null
          photo_consent: boolean
          photo_media_ids: string[]
          rating: number | null
          reservation_id: string | null
          status: Database["public"]["Enums"]["review_status"]
          subject_id: string | null
          subject_type: Database["public"]["Enums"]["review_subject_type"]
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_verified_purchase?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          order_id?: string | null
          photo_consent?: boolean
          photo_media_ids?: string[]
          rating?: number | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          subject_id?: string | null
          subject_type: Database["public"]["Enums"]["review_subject_type"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_verified_purchase?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          order_id?: string | null
          photo_consent?: boolean
          photo_media_ids?: string[]
          rating?: number | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          subject_id?: string | null
          subject_type?: Database["public"]["Enums"]["review_subject_type"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      search_documents: {
        Row: {
          body_tokens: unknown
          department: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["search_entity_type"]
          event_types: string[]
          id: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title_tr: string
          updated_at: string
        }
        Insert: {
          body_tokens?: unknown
          department?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["search_entity_type"]
          event_types?: string[]
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title_tr: string
          updated_at?: string
        }
        Update: {
          body_tokens?: unknown
          department?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["search_entity_type"]
          event_types?: string[]
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          noindex: boolean
          og_image_id: string | null
          schema_type: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          noindex?: boolean
          og_image_id?: string | null
          schema_type?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          noindex?: boolean
          og_image_id?: string | null
          schema_type?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_metadata_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_metadata_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_addons: {
        Row: {
          description: string | null
          id: string
          is_optional: boolean
          name: string
          price: number | null
          price_band: Database["public"]["Enums"]["price_band"] | null
          service_package_id: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          id?: string
          is_optional?: boolean
          name: string
          price?: number | null
          price_band?: Database["public"]["Enums"]["price_band"] | null
          service_package_id: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          is_optional?: boolean
          name?: string
          price?: number | null
          price_band?: Database["public"]["Enums"]["price_band"] | null
          service_package_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_addons_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_addons_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_availability_blocks: {
        Row: {
          booked_count: number
          capacity: number
          city_id: string | null
          date: string
          id: string
          is_blackout: boolean
          note: string | null
          service_category:
            | Database["public"]["Enums"]["service_category"]
            | null
        }
        Insert: {
          booked_count?: number
          capacity?: number
          city_id?: string | null
          date: string
          id?: string
          is_blackout?: boolean
          note?: string | null
          service_category?:
            | Database["public"]["Enums"]["service_category"]
            | null
        }
        Update: {
          booked_count?: number
          capacity?: number
          city_id?: string | null
          date?: string
          id?: string
          is_blackout?: boolean
          note?: string | null
          service_category?:
            | Database["public"]["Enums"]["service_category"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "service_availability_blocks_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_availability_blocks_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_briefs: {
        Row: {
          brief_json: Json
          id: string
          reservation_id: string
          updated_at: string
          uploaded_file_ids: string[]
        }
        Insert: {
          brief_json?: Json
          id?: string
          reservation_id: string
          updated_at?: string
          uploaded_file_ids?: string[]
        }
        Update: {
          brief_json?: Json
          id?: string
          reservation_id?: string
          updated_at?: string
          uploaded_file_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "service_briefs_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_checklists: {
        Row: {
          due_date: string | null
          id: string
          is_done: boolean
          item_tr: string
          owner_staff_id: string | null
          reservation_id: string
          sort_order: number
        }
        Insert: {
          due_date?: string | null
          id?: string
          is_done?: boolean
          item_tr: string
          owner_staff_id?: string | null
          reservation_id: string
          sort_order?: number
        }
        Update: {
          due_date?: string | null
          id?: string
          is_done?: boolean
          item_tr?: string
          owner_staff_id?: string | null
          reservation_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_checklists_owner_staff_id_fkey"
            columns: ["owner_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_checklists_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_cities: {
        Row: {
          city_name: string
          city_slug: string
          created_at: string
          id: string
          is_active: boolean
          notes_tr: string | null
          travel_fee_model: Database["public"]["Enums"]["travel_fee_model"]
          travel_fee_value: number | null
        }
        Insert: {
          city_name: string
          city_slug: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes_tr?: string | null
          travel_fee_model?: Database["public"]["Enums"]["travel_fee_model"]
          travel_fee_value?: number | null
        }
        Update: {
          city_name?: string
          city_slug?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes_tr?: string | null
          travel_fee_model?: Database["public"]["Enums"]["travel_fee_model"]
          travel_fee_value?: number | null
        }
        Relationships: []
      }
      service_city_availability: {
        Row: {
          city_id: string
          city_note_tr: string | null
          city_specific_lead_time_days: number | null
          id: string
          is_available: boolean
          service_package_id: string
        }
        Insert: {
          city_id: string
          city_note_tr?: string | null
          city_specific_lead_time_days?: number | null
          id?: string
          is_available?: boolean
          service_package_id: string
        }
        Update: {
          city_id?: string
          city_note_tr?: string | null
          city_specific_lead_time_days?: number | null
          id?: string
          is_available?: boolean
          service_package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_city_availability_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_city_availability_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "service_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_city_availability_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_city_availability_service_package_id_fkey"
            columns: ["service_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_milestones: {
        Row: {
          amount: number | null
          due_date: string | null
          id: string
          payment_id: string | null
          reservation_id: string
          sort_order: number
          status: Database["public"]["Enums"]["milestone_status"]
          title_tr: string
          type: Database["public"]["Enums"]["milestone_type"]
        }
        Insert: {
          amount?: number | null
          due_date?: string | null
          id?: string
          payment_id?: string | null
          reservation_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title_tr: string
          type: Database["public"]["Enums"]["milestone_type"]
        }
        Update: {
          amount?: number | null
          due_date?: string | null
          id?: string
          payment_id?: string | null
          reservation_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title_tr?: string
          type?: Database["public"]["Enums"]["milestone_type"]
        }
        Relationships: [
          {
            foreignKeyName: "service_milestones_payment_fk"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_milestones_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          base_from_price: number | null
          behavior_type: Database["public"]["Enums"]["service_behavior"]
          collection_id: string | null
          created_at: string
          deposit_model: Database["public"]["Enums"]["deposit_model"]
          deposit_value: number | null
          description: string | null
          experience_ids: string[]
          gallery_id: string | null
          hero_media_id: string | null
          id: string
          internal_cost_notes: string | null
          min_lead_time_days: number
          name: string
          price_band: Database["public"]["Enums"]["price_band"] | null
          price_display: Database["public"]["Enums"]["price_display"]
          requires_event_date: boolean
          requires_guest_count: boolean
          requires_venue: boolean
          seo_metadata_id: string | null
          service_category: Database["public"]["Enums"]["service_category"]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          updated_at: string
        }
        Insert: {
          base_from_price?: number | null
          behavior_type?: Database["public"]["Enums"]["service_behavior"]
          collection_id?: string | null
          created_at?: string
          deposit_model?: Database["public"]["Enums"]["deposit_model"]
          deposit_value?: number | null
          description?: string | null
          experience_ids?: string[]
          gallery_id?: string | null
          hero_media_id?: string | null
          id?: string
          internal_cost_notes?: string | null
          min_lead_time_days?: number
          name: string
          price_band?: Database["public"]["Enums"]["price_band"] | null
          price_display?: Database["public"]["Enums"]["price_display"]
          requires_event_date?: boolean
          requires_guest_count?: boolean
          requires_venue?: boolean
          seo_metadata_id?: string | null
          service_category: Database["public"]["Enums"]["service_category"]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          updated_at?: string
        }
        Update: {
          base_from_price?: number | null
          behavior_type?: Database["public"]["Enums"]["service_behavior"]
          collection_id?: string | null
          created_at?: string
          deposit_model?: Database["public"]["Enums"]["deposit_model"]
          deposit_value?: number | null
          description?: string | null
          experience_ids?: string[]
          gallery_id?: string | null
          hero_media_id?: string | null
          id?: string
          internal_cost_notes?: string | null
          min_lead_time_days?: number
          name?: string
          price_band?: Database["public"]["Enums"]["price_band"] | null
          price_display?: Database["public"]["Enums"]["price_display"]
          requires_event_date?: boolean
          requires_guest_count?: boolean
          requires_venue?: boolean
          seo_metadata_id?: string | null
          service_category?: Database["public"]["Enums"]["service_category"]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_gallery_fk"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_gallery_fk"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      services_internal: {
        Row: {
          description: string | null
          experience_id: string | null
          id: string
          internal_cost_notes: string | null
          name: string
          status: string
        }
        Insert: {
          description?: string | null
          experience_id?: string | null
          id?: string
          internal_cost_notes?: string | null
          name: string
          status?: string
        }
        Update: {
          description?: string | null
          experience_id?: string | null
          id?: string
          internal_cost_notes?: string | null
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_internal_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_internal_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences_public"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier_name: string | null
          created_at: string
          delivered_at: string | null
          exception_code: string | null
          failed_delivery_at: string | null
          id: string
          internal_note: string | null
          order_id: string
          package_count: number
          shipped_at: string | null
          shipping_method_id: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          tracking_number: string | null
        }
        Insert: {
          carrier_name?: string | null
          created_at?: string
          delivered_at?: string | null
          exception_code?: string | null
          failed_delivery_at?: string | null
          id?: string
          internal_note?: string | null
          order_id: string
          package_count?: number
          shipped_at?: string | null
          shipping_method_id?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_number?: string | null
        }
        Update: {
          carrier_name?: string | null
          created_at?: string
          delivered_at?: string | null
          exception_code?: string | null
          failed_delivery_at?: string | null
          id?: string
          internal_note?: string | null
          order_id?: string
          package_count?: number
          shipped_at?: string | null
          shipping_method_id?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_shipping_method_id_fkey"
            columns: ["shipping_method_id"]
            isOneToOne: false
            referencedRelation: "shipping_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          base_price: number
          city_scope: string[] | null
          id: string
          name: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          type: Database["public"]["Enums"]["shipping_method_type"]
        }
        Insert: {
          base_price?: number
          city_scope?: string[] | null
          id?: string
          name: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          type?: Database["public"]["Enums"]["shipping_method_type"]
        }
        Update: {
          base_price?: number
          city_scope?: string[] | null
          id?: string
          name?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          type?: Database["public"]["Enums"]["shipping_method_type"]
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          business_hours: Json
          business_name: string
          contact_email: string | null
          contact_phone: string | null
          default_seo: Json
          id: string
          service_area_text: string | null
          social_links: Json
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          business_hours?: Json
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          default_seo?: Json
          id?: string
          service_area_text?: string | null
          social_links?: Json
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          business_hours?: Json
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          default_seo?: Json
          id?: string
          service_area_text?: string | null
          social_links?: Json
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          capability_tags: string[]
          contact_info: Json
          created_at: string
          id: string
          internal_rating: number | null
          name: string
          notes: string | null
          status: string
        }
        Insert: {
          capability_tags?: string[]
          contact_info?: Json
          created_at?: string
          id?: string
          internal_rating?: number | null
          name: string
          notes?: string | null
          status?: string
        }
        Update: {
          capability_tags?: string[]
          contact_info?: Json
          created_at?: string
          id?: string
          internal_rating?: number | null
          name?: string
          notes?: string | null
          status?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          capability_tags: string[]
          created_at: string
          id: string
          member_names: string[]
          name: string
          notes: string | null
        }
        Insert: {
          capability_tags?: string[]
          created_at?: string
          id?: string
          member_names?: string[]
          name: string
          notes?: string | null
        }
        Update: {
          capability_tags?: string[]
          created_at?: string
          id?: string
          member_names?: string[]
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_display_name: string | null
          collection_id: string | null
          created_at: string
          event_type: string | null
          id: string
          location: string | null
          media_id: string | null
          quote: string
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          client_display_name?: string | null
          collection_id?: string | null
          created_at?: string
          event_type?: string | null
          id?: string
          location?: string | null
          media_id?: string | null
          quote: string
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          client_display_name?: string | null
          collection_id?: string | null
          created_at?: string
          event_type?: string | null
          id?: string
          location?: string | null
          media_id?: string | null
          quote?: string
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          id: string
          message_tr: string | null
          occurred_at: string
          shipment_id: string
          status: Database["public"]["Enums"]["shipment_status"] | null
        }
        Insert: {
          id?: string
          message_tr?: string | null
          occurred_at?: string
          shipment_id: string
          status?: Database["public"]["Enums"]["shipment_status"] | null
        }
        Update: {
          id?: string
          message_tr?: string | null
          occurred_at?: string
          shipment_id?: string
          status?: Database["public"]["Enums"]["shipment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      articles_public: {
        Row: {
          author_display: string | null
          body: Json | null
          category: string | null
          cover_media_id: string | null
          excerpt: string | null
          id: string | null
          published_at: string | null
          related_collection_ids: string[] | null
          related_experience_ids: string[] | null
          related_product_ids: string[] | null
          seo_metadata_id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          author_display?: string | null
          body?: Json | null
          category?: string | null
          cover_media_id?: string | null
          excerpt?: string | null
          id?: string | null
          published_at?: string | null
          related_collection_ids?: string[] | null
          related_experience_ids?: string[] | null
          related_product_ids?: string[] | null
          seo_metadata_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          author_display?: string | null
          body?: Json | null
          category?: string | null
          cover_media_id?: string | null
          excerpt?: string | null
          id?: string | null
          published_at?: string | null
          related_collection_ids?: string[] | null
          related_experience_ids?: string[] | null
          related_product_ids?: string[] | null
          seo_metadata_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      categories_public: {
        Row: {
          department_id: string | null
          description: string | null
          id: string | null
          name: string | null
          parent_id: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          department_id?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          department_id?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories_public"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_sets_public: {
        Row: {
          bundle_discount_pct: number | null
          bundle_price: number | null
          collection_id: string | null
          id: string | null
          name_tr: string | null
          slug: string | null
          story: string | null
        }
        Insert: {
          bundle_discount_pct?: number | null
          bundle_price?: number | null
          collection_id?: string | null
          id?: string | null
          name_tr?: string | null
          slug?: string | null
          story?: string | null
        }
        Update: {
          bundle_discount_pct?: number | null
          bundle_price?: number | null
          collection_id?: string | null
          id?: string | null
          name_tr?: string | null
          slug?: string | null
          story?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_sets_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_sets_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_public: {
        Row: {
          hero_media_id: string | null
          id: string | null
          is_featured: boolean | null
          materials: string[] | null
          name: string | null
          palette: Json | null
          seo_metadata_id: string | null
          slug: string | null
          sort_order: number | null
          story: string | null
        }
        Insert: {
          hero_media_id?: string | null
          id?: string | null
          is_featured?: boolean | null
          materials?: string[] | null
          name?: string | null
          palette?: Json | null
          seo_metadata_id?: string | null
          slug?: string | null
          sort_order?: number | null
          story?: string | null
        }
        Update: {
          hero_media_id?: string | null
          id?: string | null
          is_featured?: boolean | null
          materials?: string[] | null
          name?: string | null
          palette?: Json | null
          seo_metadata_id?: string | null
          slug?: string | null
          sort_order?: number | null
          story?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      departments_public: {
        Row: {
          description: string | null
          icon_media_id: string | null
          id: string | null
          name_tr: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          icon_media_id?: string | null
          id?: string | null
          name_tr?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          icon_media_id?: string | null
          id?: string | null
          name_tr?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_icon_media_id_fkey"
            columns: ["icon_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_icon_media_id_fkey"
            columns: ["icon_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_offerings_public: {
        Row: {
          collection_id: string | null
          description: string | null
          id: string | null
          preview_media_id: string | null
          title: string | null
          type: Database["public"]["Enums"]["digital_offering_type"] | null
        }
        Insert: {
          collection_id?: string | null
          description?: string | null
          id?: string | null
          preview_media_id?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["digital_offering_type"] | null
        }
        Update: {
          collection_id?: string | null
          description?: string | null
          id?: string | null
          preview_media_id?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["digital_offering_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_offerings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_offerings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_offerings_preview_media_id_fkey"
            columns: ["preview_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_offerings_preview_media_id_fkey"
            columns: ["preview_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_products_public: {
        Row: {
          base_price: number | null
          behavior: Database["public"]["Enums"]["digital_behavior"] | null
          collection_id: string | null
          delivery_mode:
            | Database["public"]["Enums"]["digital_delivery_mode"]
            | null
          digital_type: Database["public"]["Enums"]["digital_type"] | null
          id: string | null
          name_tr: string | null
          preview_media_ids: string[] | null
          seo_metadata_id: string | null
          slug: string | null
        }
        Insert: {
          base_price?: number | null
          behavior?: Database["public"]["Enums"]["digital_behavior"] | null
          collection_id?: string | null
          delivery_mode?:
            | Database["public"]["Enums"]["digital_delivery_mode"]
            | null
          digital_type?: Database["public"]["Enums"]["digital_type"] | null
          id?: string | null
          name_tr?: string | null
          preview_media_ids?: string[] | null
          seo_metadata_id?: string | null
          slug?: string | null
        }
        Update: {
          base_price?: number | null
          behavior?: Database["public"]["Enums"]["digital_behavior"] | null
          collection_id?: string | null
          delivery_mode?:
            | Database["public"]["Enums"]["digital_delivery_mode"]
            | null
          digital_type?: Database["public"]["Enums"]["digital_type"] | null
          id?: string | null
          name_tr?: string | null
          preview_media_ids?: string[] | null
          seo_metadata_id?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_products_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_products_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences_public: {
        Row: {
          hero_media_id: string | null
          id: string | null
          included_modules: Json | null
          name: string | null
          process_steps: Json | null
          seo_metadata_id: string | null
          slug: string | null
          summary: string | null
        }
        Insert: {
          hero_media_id?: string | null
          id?: string | null
          included_modules?: Json | null
          name?: string | null
          process_steps?: Json | null
          seo_metadata_id?: string | null
          slug?: string | null
          summary?: string | null
        }
        Update: {
          hero_media_id?: string | null
          id?: string | null
          included_modules?: Json | null
          name?: string | null
          process_steps?: Json | null
          seo_metadata_id?: string | null
          slug?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs_public: {
        Row: {
          answer: string | null
          category: Database["public"]["Enums"]["faq_category"] | null
          id: string | null
          linked_entity_id: string | null
          linked_entity_type: string | null
          question: string | null
          sort_order: number | null
        }
        Insert: {
          answer?: string | null
          category?: Database["public"]["Enums"]["faq_category"] | null
          id?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          question?: string | null
          sort_order?: number | null
        }
        Update: {
          answer?: string | null
          category?: Database["public"]["Enums"]["faq_category"] | null
          id?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          question?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      galleries_public: {
        Row: {
          id: string | null
          linked_entity_id: string | null
          linked_entity_type: string | null
          media_ids: string[] | null
          title: string | null
        }
        Insert: {
          id?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          media_ids?: string[] | null
          title?: string | null
        }
        Update: {
          id?: string | null
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          media_ids?: string[] | null
          title?: string | null
        }
        Relationships: []
      }
      legal_documents_public: {
        Row: {
          body: Json | null
          content_hash: string | null
          doc_key: Database["public"]["Enums"]["legal_doc_key"] | null
          document_id: string | null
          effective_from: string | null
          locale: string | null
          published_at: string | null
          slug: string | null
          summary: string | null
          title_tr: string | null
          version: string | null
          version_id: string | null
        }
        Relationships: []
      }
      memory_offerings_public: {
        Row: {
          collection_id: string | null
          delivery_timeline_days: number | null
          description: string | null
          id: string | null
          title: string | null
          type: Database["public"]["Enums"]["memory_offering_type"] | null
        }
        Insert: {
          collection_id?: string | null
          delivery_timeline_days?: number | null
          description?: string | null
          id?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["memory_offering_type"] | null
        }
        Update: {
          collection_id?: string | null
          delivery_timeline_days?: number | null
          description?: string | null
          id?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["memory_offering_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_offerings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_offerings_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
        ]
      }
      pages_public: {
        Row: {
          body: Json | null
          id: string | null
          seo_metadata_id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          body?: Json | null
          id?: string | null
          seo_metadata_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          body?: Json | null
          id?: string | null
          seo_metadata_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects_public: {
        Row: {
          city: string | null
          collection_id: string | null
          cover_media_id: string | null
          event_type: string | null
          gallery_id: string | null
          guest_count_band: string | null
          id: string | null
          seo_metadata_id: string | null
          slug: string | null
          testimonial_id: string | null
          title: string | null
        }
        Insert: {
          city?: string | null
          collection_id?: string | null
          cover_media_id?: string | null
          event_type?: string | null
          gallery_id?: string | null
          guest_count_band?: string | null
          id?: string | null
          seo_metadata_id?: string | null
          slug?: string | null
          testimonial_id?: string | null
          title?: string | null
        }
        Update: {
          city?: string | null
          collection_id?: string | null
          cover_media_id?: string | null
          event_type?: string | null
          gallery_id?: string | null
          guest_count_band?: string | null
          id?: string | null
          seo_metadata_id?: string | null
          slug?: string | null
          testimonial_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_addons_public: {
        Row: {
          addon_type: Database["public"]["Enums"]["addon_type"] | null
          id: string | null
          is_optional: boolean | null
          name_tr: string | null
          price: number | null
          price_type: Database["public"]["Enums"]["price_type"] | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          addon_type?: Database["public"]["Enums"]["addon_type"] | null
          id?: string | null
          is_optional?: boolean | null
          name_tr?: string | null
          price?: number | null
          price_type?: Database["public"]["Enums"]["price_type"] | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          addon_type?: Database["public"]["Enums"]["addon_type"] | null
          id?: string | null
          is_optional?: boolean | null
          name_tr?: string | null
          price?: number | null
          price_type?: Database["public"]["Enums"]["price_type"] | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_addons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_addons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_addons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colors_public: {
        Row: {
          hex: string | null
          id: string | null
          name_tr: string | null
          product_id: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_materials_public: {
        Row: {
          id: string | null
          name_tr: string | null
          product_id: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media_public: {
        Row: {
          alt_text: string | null
          id: string | null
          product_id: string | null
          sort_order: number | null
          storage_path: string | null
          url: string | null
        }
        Relationships: []
      }
      product_personalization_fields_public: {
        Row: {
          field_type:
            | Database["public"]["Enums"]["personalization_field_type"]
            | null
          helper_text: string | null
          id: string | null
          label: string | null
          options: Json | null
          product_id: string | null
          required: boolean | null
          sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_personalization_fields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_personalization_fields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_personalization_fields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_tiers_public: {
        Row: {
          id: string | null
          min_qty: number | null
          product_id: string | null
          unit_price: number | null
          variant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_tiers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_price_tiers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants_public: {
        Row: {
          id: string | null
          option_values: Json | null
          price: number | null
          product_id: string | null
          sku: string | null
          sort_order: number | null
          stock_quantity: number | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      products_public: {
        Row: {
          base_price: number | null
          behavior_type: Database["public"]["Enums"]["product_behavior"] | null
          brand_motif_tags: string[] | null
          category_id: string | null
          collection_id: string | null
          collection_set_id: string | null
          currency: string | null
          delivery_note: string | null
          description: string | null
          gift_wrapping_available: boolean | null
          id: string | null
          is_personalizable: boolean | null
          material_story: string | null
          materials: string | null
          media_ids: string[] | null
          motif: string | null
          name: string | null
          object_type: string | null
          occasion_type: string | null
          packaging_notes: string | null
          personalization_options: Json | null
          price_band: Database["public"]["Enums"]["price_band"] | null
          production_time_days: number | null
          proof_required: boolean | null
          return_note: string | null
          seo_metadata_id: string | null
          sku: string | null
          slug: string | null
          sort_order: number | null
          stock_mode: Database["public"]["Enums"]["stock_mode"] | null
        }
        Insert: {
          base_price?: number | null
          behavior_type?: Database["public"]["Enums"]["product_behavior"] | null
          brand_motif_tags?: string[] | null
          category_id?: string | null
          collection_id?: string | null
          collection_set_id?: string | null
          currency?: string | null
          delivery_note?: string | null
          description?: string | null
          gift_wrapping_available?: boolean | null
          id?: string | null
          is_personalizable?: boolean | null
          material_story?: string | null
          materials?: string | null
          media_ids?: string[] | null
          motif?: string | null
          name?: string | null
          object_type?: string | null
          occasion_type?: string | null
          packaging_notes?: string | null
          personalization_options?: Json | null
          price_band?: Database["public"]["Enums"]["price_band"] | null
          production_time_days?: number | null
          proof_required?: boolean | null
          return_note?: string | null
          seo_metadata_id?: string | null
          sku?: string | null
          slug?: string | null
          sort_order?: number | null
          stock_mode?: Database["public"]["Enums"]["stock_mode"] | null
        }
        Update: {
          base_price?: number | null
          behavior_type?: Database["public"]["Enums"]["product_behavior"] | null
          brand_motif_tags?: string[] | null
          category_id?: string | null
          collection_id?: string | null
          collection_set_id?: string | null
          currency?: string | null
          delivery_note?: string | null
          description?: string | null
          gift_wrapping_available?: boolean | null
          id?: string | null
          is_personalizable?: boolean | null
          material_story?: string | null
          materials?: string | null
          media_ids?: string[] | null
          motif?: string | null
          name?: string | null
          object_type?: string | null
          occasion_type?: string | null
          packaging_notes?: string | null
          personalization_options?: Json | null
          price_band?: Database["public"]["Enums"]["price_band"] | null
          production_time_days?: number | null
          proof_required?: boolean | null
          return_note?: string | null
          seo_metadata_id?: string | null
          sku?: string | null
          slug?: string | null
          sort_order?: number | null
          stock_mode?: Database["public"]["Enums"]["stock_mode"] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_set_id_fkey"
            columns: ["collection_set_id"]
            isOneToOne: false
            referencedRelation: "collection_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_set_id_fkey"
            columns: ["collection_set_id"]
            isOneToOne: false
            referencedRelation: "collection_sets_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews_public: {
        Row: {
          body: string | null
          created_at: string | null
          id: string | null
          is_verified_purchase: boolean | null
          photo_media_ids: string[] | null
          rating: number | null
          subject_id: string | null
          subject_type:
            | Database["public"]["Enums"]["review_subject_type"]
            | null
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string | null
          is_verified_purchase?: boolean | null
          photo_media_ids?: never
          rating?: number | null
          subject_id?: string | null
          subject_type?:
            | Database["public"]["Enums"]["review_subject_type"]
            | null
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string | null
          is_verified_purchase?: boolean | null
          photo_media_ids?: never
          rating?: number | null
          subject_id?: string | null
          subject_type?:
            | Database["public"]["Enums"]["review_subject_type"]
            | null
          title?: string | null
        }
        Relationships: []
      }
      seo_metadata_public: {
        Row: {
          canonical_url: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string | null
          noindex: boolean | null
          og_image_id: string | null
          schema_type: string | null
          title: string | null
        }
        Insert: {
          canonical_url?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string | null
          noindex?: boolean | null
          og_image_id?: string | null
          schema_type?: string | null
          title?: string | null
        }
        Update: {
          canonical_url?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string | null
          noindex?: boolean | null
          og_image_id?: string | null
          schema_type?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_metadata_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_metadata_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_cities_public: {
        Row: {
          city_name: string | null
          city_slug: string | null
          id: string | null
          notes_tr: string | null
          travel_fee_model:
            | Database["public"]["Enums"]["travel_fee_model"]
            | null
        }
        Insert: {
          city_name?: string | null
          city_slug?: string | null
          id?: string | null
          notes_tr?: string | null
          travel_fee_model?:
            | Database["public"]["Enums"]["travel_fee_model"]
            | null
        }
        Update: {
          city_name?: string | null
          city_slug?: string | null
          id?: string | null
          notes_tr?: string | null
          travel_fee_model?:
            | Database["public"]["Enums"]["travel_fee_model"]
            | null
        }
        Relationships: []
      }
      service_packages_public: {
        Row: {
          base_from_price: number | null
          behavior_type: Database["public"]["Enums"]["service_behavior"] | null
          collection_id: string | null
          deposit_model: Database["public"]["Enums"]["deposit_model"] | null
          deposit_value: number | null
          description: string | null
          experience_ids: string[] | null
          gallery_id: string | null
          hero_media_id: string | null
          id: string | null
          min_lead_time_days: number | null
          name: string | null
          price_band: Database["public"]["Enums"]["price_band"] | null
          price_display: Database["public"]["Enums"]["price_display"] | null
          requires_event_date: boolean | null
          requires_guest_count: boolean | null
          requires_venue: boolean | null
          seo_metadata_id: string | null
          service_category:
            | Database["public"]["Enums"]["service_category"]
            | null
          slug: string | null
          summary: string | null
        }
        Insert: {
          base_from_price?: number | null
          behavior_type?: Database["public"]["Enums"]["service_behavior"] | null
          collection_id?: string | null
          deposit_model?: Database["public"]["Enums"]["deposit_model"] | null
          deposit_value?: number | null
          description?: string | null
          experience_ids?: string[] | null
          gallery_id?: string | null
          hero_media_id?: string | null
          id?: string | null
          min_lead_time_days?: number | null
          name?: string | null
          price_band?: Database["public"]["Enums"]["price_band"] | null
          price_display?: Database["public"]["Enums"]["price_display"] | null
          requires_event_date?: boolean | null
          requires_guest_count?: boolean | null
          requires_venue?: boolean | null
          seo_metadata_id?: string | null
          service_category?:
            | Database["public"]["Enums"]["service_category"]
            | null
          slug?: string | null
          summary?: string | null
        }
        Update: {
          base_from_price?: number | null
          behavior_type?: Database["public"]["Enums"]["service_behavior"] | null
          collection_id?: string | null
          deposit_model?: Database["public"]["Enums"]["deposit_model"] | null
          deposit_value?: number | null
          description?: string | null
          experience_ids?: string[] | null
          gallery_id?: string | null
          hero_media_id?: string | null
          id?: string | null
          min_lead_time_days?: number | null
          name?: string | null
          price_band?: Database["public"]["Enums"]["price_band"] | null
          price_display?: Database["public"]["Enums"]["price_display"] | null
          requires_event_date?: boolean | null
          requires_guest_count?: boolean | null
          requires_venue?: boolean | null
          seo_metadata_id?: string | null
          service_category?:
            | Database["public"]["Enums"]["service_category"]
            | null
          slug?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_gallery_fk"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_gallery_fk"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_packages_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata_public"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials_public: {
        Row: {
          client_display_name: string | null
          collection_id: string | null
          event_type: string | null
          id: string | null
          location: string | null
          media_id: string | null
          quote: string | null
        }
        Insert: {
          client_display_name?: string | null
          collection_id?: string | null
          event_type?: string | null
          id?: string | null
          location?: string | null
          media_id?: string | null
          quote?: string | null
        }
        Update: {
          client_display_name?: string | null
          collection_id?: string | null
          event_type?: string | null
          id?: string | null
          location?: string | null
          media_id?: string | null
          quote?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "product_media_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_adjust_inventory: {
        Args: {
          p_delta: number
          p_note: string
          p_reason: string
          p_variant_id: string
        }
        Returns: string
      }
      admin_archive_media: { Args: { p_media_id: string }; Returns: undefined }
      admin_archive_product: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      admin_cancel_notification: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      admin_complete_quality_check: {
        Args: { p_items: Json; p_job_id: string; p_note: string }
        Returns: string
      }
      admin_convert_lead: {
        Args: { p_lead_id: string; p_target: string }
        Returns: string
      }
      admin_create_shipment: {
        Args: {
          p_carrier: string
          p_internal_note: string
          p_order_id: string
          p_package_count: number
          p_tracking: string
        }
        Returns: string
      }
      admin_delete_review: {
        Args: { p_confirmation: string; p_review_id: string }
        Returns: undefined
      }
      admin_mark_notification_for_review: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      admin_moderate_review: {
        Args: {
          p_note: string
          p_review_id: string
          p_status: Database["public"]["Enums"]["review_status"]
        }
        Returns: undefined
      }
      admin_notification_detail: {
        Args: { p_notification_id: string }
        Returns: Json
      }
      admin_publish_legal_version: {
        Args: { p_approval_metadata?: Json; p_version_id: string }
        Returns: undefined
      }
      admin_publish_page: { Args: { p_page_id: string }; Returns: undefined }
      admin_publish_product: {
        Args: { p_product_id: string }
        Returns: {
          archived_at: string | null
          archived_by: string | null
          base_price: number | null
          behavior_type: Database["public"]["Enums"]["product_behavior"]
          brand_motif_tags: string[]
          category_id: string | null
          collection_id: string | null
          collection_set_id: string | null
          created_at: string
          currency: string
          delivery_note: string | null
          description: string | null
          gift_wrapping_available: boolean
          id: string
          internal_cost: number | null
          is_personalizable: boolean
          material_story: string | null
          materials: string | null
          media_ids: string[]
          motif: string | null
          name: string
          object_type: string | null
          occasion_type: string | null
          packaging_notes: string | null
          personalization_options: Json
          price_band: Database["public"]["Enums"]["price_band"] | null
          production_time_days: number | null
          proof_required: boolean
          published_at: string | null
          published_by: string | null
          return_note: string | null
          seo_metadata_id: string | null
          sku: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          stock_mode: Database["public"]["Enums"]["stock_mode"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_restore_product: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      admin_retry_notification: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      admin_rollback_page: {
        Args: { p_page_id: string; p_revision_id: string }
        Returns: undefined
      }
      admin_save_page: {
        Args: {
          p_body: Json
          p_page_id: string
          p_slug: string
          p_title: string
        }
        Returns: {
          body: Json
          created_at: string
          id: string
          seo_metadata_id: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "pages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_product_media: {
        Args: { p_media_ids: string[]; p_product_id: string }
        Returns: undefined
      }
      admin_update_lead: {
        Args: {
          p_assigned_staff_id: string
          p_lead_id: string
          p_lost_reason: string
          p_next_follow_up_at: string
          p_note: string
          p_priority: string
          p_status: Database["public"]["Enums"]["lead_status"]
        }
        Returns: undefined
      }
      admin_update_order_operations: {
        Args: {
          p_assigned_staff_id: string
          p_customer_note: string
          p_internal_note: string
          p_order_id: string
        }
        Returns: undefined
      }
      admin_update_staff: {
        Args: {
          p_is_active: boolean
          p_role: Database["public"]["Enums"]["staff_role"]
          p_staff_id: string
        }
        Returns: undefined
      }
      apply_payment_event: {
        Args: {
          p_amount: number
          p_error_code?: string
          p_error_message?: string
          p_event_type: string
          p_payload: Json
          p_payment_id: string
          p_provider_conversation_id: string
          p_provider_event_id: string
          p_provider_payment_id: string
          p_signature_valid: boolean
          p_status: Database["public"]["Enums"]["payment_status"]
        }
        Returns: Database["public"]["Enums"]["payment_status"]
      }
      approve_finance_refund: {
        Args: { p_confirmation: string; p_refund_id: string }
        Returns: undefined
      }
      check_payment_rate_limit: {
        Args: {
          p_identity_hash: string
          p_limit: number
          p_route_key: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      claim_notification_outbox: {
        Args: {
          p_batch_size?: number
          p_stale_after_seconds?: number
          p_worker_id: string
        }
        Returns: {
          aggregate_id: string | null
          aggregate_type: string
          attempts: number
          available_at: string
          cancelled_at: string | null
          category: string
          channel: Database["public"]["Enums"]["notification_channel"]
          correlation_id: string
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          environment: string
          event_type: string
          failed_at: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          last_error_code: string | null
          last_provider_event_at: string | null
          locale: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          next_attempt_at: string
          order_id: string | null
          payload: Json
          provider: string | null
          provider_message_id: string | null
          recipient_email: string | null
          recipient_kind: string
          reply_to_route: string | null
          review_required_at: string | null
          sender_email: string | null
          sent_at: string | null
          status: string
          suppressed_at: string | null
          template_key: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "notification_outbox"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_payment_attempt: {
        Args: {
          p_checkout_session_id: string
          p_customer_id: string
          p_idempotency_key: string
          p_provider: Database["public"]["Enums"]["payment_provider"]
        }
        Returns: {
          amount: number
          currency: string
          order_id: string
          order_number: string
          payment_id: string
        }[]
      }
      create_payment_attempt_v2: {
        Args: {
          p_checkout_session_id: string
          p_customer_id: string
          p_provider: Database["public"]["Enums"]["payment_provider"]
          p_request_key: string
        }
        Returns: {
          amount: number
          amount_minor: number
          currency: string
          merchant_order_id: string
          order_id: string
          order_number: string
          payment_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          provider_redirect_url: string
          reused: boolean
        }[]
      }
      current_customer_id: { Args: never; Returns: string }
      current_staff_id: { Args: never; Returns: string }
      current_staff_role: { Args: never; Returns: string }
      detect_payment_discrepancies: {
        Args: { p_batch_size?: number; p_pending_age_minutes?: number }
        Returns: number
      }
      enqueue_notification: {
        Args: {
          p_aggregate_id: string
          p_aggregate_type: string
          p_category?: string
          p_customer_id: string
          p_event_type: string
          p_idempotency_key: string
          p_locale?: string
          p_order_id: string
          p_payload: Json
          p_recipient_email: string
          p_recipient_kind: string
          p_template_key: string
        }
        Returns: string
      }
      ensure_current_customer_profile: {
        Args: never
        Returns: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          kvkk_consent_at: string | null
          marketing_consent_at: string | null
          name: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_customer_payment_summaries: {
        Args: { p_order_number?: string }
        Returns: {
          amount: number
          created_at: string
          currency: string
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          provider: Database["public"]["Enums"]["payment_provider"]
        }[]
      }
      has_staff_role: { Args: { allowed: string[] }; Returns: boolean }
      ingest_paytr_callback: {
        Args: {
          p_correlation_id: string
          p_currency: string
          p_merchant_order_id: string
          p_payload: Json
          p_payment_amount_minor: number
          p_provider_event_id: string
          p_status: string
          p_total_amount_minor: number
        }
        Returns: Json
      }
      ingest_resend_delivery_event: {
        Args: {
          p_event_type: string
          p_occurred_at: string
          p_provider_event_id: string
          p_provider_message_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: never; Returns: boolean }
      mark_refund_submitted: {
        Args: { p_refund_id: string }
        Returns: undefined
      }
      merge_guest_cart_for_current_user: {
        Args: { p_token_hash: string }
        Returns: string
      }
      notification_outbox_health: { Args: never; Returns: Json }
      order_cancellation_eligibility: {
        Args: { p_order_id: string }
        Returns: Json
      }
      publish_product_proof: {
        Args: {
          p_file_name: string
          p_file_size_bytes: number
          p_message?: string
          p_mime_type: string
          p_order_item_id: string
          p_storage_path: string
        }
        Returns: string
      }
      record_current_identity_event: {
        Args: { p_event_type?: string; p_provider: string }
        Returns: string
      }
      record_payment_initialization: {
        Args: {
          p_error_code?: string
          p_payment_id: string
          p_redirect_url?: string
          p_succeeded: boolean
        }
        Returns: undefined
      }
      record_refund_submission: {
        Args: {
          p_error_code?: string
          p_provider_reference: string
          p_refund_id: string
          p_retryable?: boolean
          p_succeeded: boolean
        }
        Returns: undefined
      }
      request_customer_data_action: {
        Args: {
          p_kind: Database["public"]["Enums"]["data_request_kind"]
          p_note?: string
        }
        Returns: string
      }
      request_finance_refund: {
        Args: {
          p_amount_minor: number
          p_confirmation: string
          p_idempotency_key: string
          p_note?: string
          p_payment_id: string
          p_reason: Database["public"]["Enums"]["refund_reason"]
        }
        Returns: string
      }
      request_order_cancellation: {
        Args: { p_order_id: string; p_reason: string }
        Returns: string
      }
      resolve_payment_discrepancy: {
        Args: { p_discrepancy_id: string; p_notes: string; p_status: string }
        Returns: undefined
      }
      respond_to_product_proof: {
        Args: { p_action: string; p_comment?: string; p_proof_id: string }
        Returns: Database["public"]["Enums"]["proof_status"]
      }
      set_default_address: {
        Args: { p_address_id: string; p_kind: string }
        Returns: undefined
      }
      set_marketing_consent: { Args: { p_opt_in: boolean }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soft_delete_address: {
        Args: { p_address_id: string }
        Returns: undefined
      }
      submit_public_intake: {
        Args: {
          p_budget_band?: string
          p_consent?: boolean
          p_email?: string
          p_event_date_or_season?: string
          p_event_type?: string
          p_guest_count_band?: string
          p_intake_type: string
          p_location?: string
          p_message?: string
          p_metadata?: Json
          p_name: string
          p_needed_modules?: string[]
          p_phone?: string
          p_source_entity_type?: string
          p_source_label?: string
          p_source_slug?: string
          p_style_notes?: string
        }
        Returns: string
      }
      transition_order_status: {
        Args: {
          p_detail?: string
          p_order_id: string
          p_to_status: Database["public"]["Enums"]["order_status"]
        }
        Returns: Database["public"]["Enums"]["order_status"]
      }
      transition_order_status_operational: {
        Args: {
          p_detail?: string
          p_order_id: string
          p_to_status: Database["public"]["Enums"]["order_status"]
        }
        Returns: Database["public"]["Enums"]["order_status"]
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_customer_profile: {
        Args: { p_name: string; p_phone?: string }
        Returns: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          id: string
          kvkk_consent_at: string | null
          marketing_consent_at: string | null
          name: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      addon_type: "gift_wrap" | "rush" | "extra_revision" | "upgrade" | "other"
      assignment_status: "proposed" | "confirmed" | "completed"
      cart_status: "active" | "converted" | "abandoned" | "expired"
      checkout_status:
        | "open"
        | "pending_payment"
        | "paid"
        | "failed"
        | "expired"
        | "converted"
      client_status: "active" | "past" | "archived"
      consent_type:
        | "kvkk"
        | "distance_sales"
        | "pre_info"
        | "cookie"
        | "marketing"
        | "explicit"
        | "photo_publish"
      consultation_channel: "online" | "phone" | "whatsapp" | "in_person"
      consultation_status:
        | "requested"
        | "confirmed"
        | "completed"
        | "no_show"
        | "cancelled"
      contact_inquiry_type: "general" | "press" | "partnership" | "other"
      contact_status: "new" | "replied" | "closed"
      content_status: "draft" | "published"
      cookie_action: "accept_all" | "reject_optional" | "configure"
      data_request_kind: "export" | "deletion"
      data_request_status:
        | "pending"
        | "in_review"
        | "completed"
        | "rejected"
        | "cancelled"
      deposit_model: "none" | "fixed" | "percentage"
      digital_behavior: "digital_checkout" | "proof_required" | "quote_required"
      digital_delivery_mode: "link" | "download" | "hosted_page"
      digital_offering_type:
        | "wedding_website"
        | "digital_invitation"
        | "rsvp"
        | "qr"
        | "guest_list"
        | "countdown"
        | "location_map"
        | "couple_story"
        | "gallery"
      digital_project_status:
        | "draft"
        | "in_design"
        | "proof_sent"
        | "approved"
        | "delivered"
        | "expired"
      digital_type:
        | "dijital_davetiye"
        | "web_davetiye"
        | "animasyonlu_davetiye"
        | "qr_kart"
        | "dijital_album"
        | "indirilebilir"
      einvoice_status: "not_required" | "pending" | "issued" | "failed"
      faq_category:
        | "process"
        | "products"
        | "digital"
        | "rsvp"
        | "production"
        | "location"
        | "budget"
        | "customization"
        | "language"
        | "memory"
      favorite_item_type:
        | "product"
        | "service_package"
        | "collection"
        | "digital_product"
      fulfillment_status:
        | "not_started"
        | "preparing"
        | "shipped"
        | "delivered"
        | "returned"
      invoice_type: "bireysel" | "kurumsal"
      lead_source_type:
        | "hayalini_tasarla"
        | "quote_request"
        | "product_inquiry"
        | "contact_form"
        | "memory_request"
        | "whatsapp"
        | "city_waitlist"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "appointment"
        | "proposal_sent"
        | "negotiation"
        | "won"
        | "lost"
      legal_doc_key:
        | "kvkk_aydinlatma"
        | "gizlilik"
        | "cerez"
        | "acik_riza"
        | "kullanim_kosullari"
        | "on_bilgilendirme"
        | "mesafeli_satis"
        | "iade_iptal"
        | "teslimat"
        | "kisisellestirilmis_urun"
        | "hizmet_rezervasyon"
        | "satici_bilgileri"
      media_type: "image" | "video" | "document"
      memory_offering_type:
        | "photo"
        | "film"
        | "drone"
        | "reels"
        | "love_story"
        | "family_memory"
        | "event_trailer"
      milestone_status: "pending" | "paid" | "done" | "waived" | "overdue"
      milestone_type:
        | "deposit"
        | "interim_payment"
        | "final_payment"
        | "delivery_step"
        | "approval_step"
      notification_channel: "email" | "sms" | "whatsapp" | "onsite"
      notification_type:
        | "order_update"
        | "proof_ready"
        | "payment"
        | "shipment"
        | "reservation_update"
        | "quote_ready"
        | "support_reply"
        | "digital_delivery"
        | "marketing"
      order_status:
        | "pending_payment"
        | "paid"
        | "in_design"
        | "proof_sent"
        | "revision_requested"
        | "proof_approved"
        | "in_production"
        | "quality_check"
        | "packed"
        | "shipped"
        | "delivered"
        | "completed"
        | "cancelled"
        | "refunded"
      payable_type:
        | "order"
        | "reservation_deposit"
        | "reservation_balance"
        | "quote"
      payment_provider: "iyzico" | "paytr" | "bank_transfer" | "manual"
      payment_status:
        | "pending"
        | "authorized"
        | "paid"
        | "failed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      personalization_field_type:
        | "text"
        | "textarea"
        | "date"
        | "select"
        | "file"
        | "number"
        | "checkbox"
      price_band: "inquiry_only" | "starter" | "premium" | "luxury" | "bespoke"
      price_display: "from_price" | "price_band" | "quote_only"
      price_type: "fixed" | "percentage"
      product_behavior:
        | "cart_enabled"
        | "proof_required_cart"
        | "digital_checkout"
        | "quote_required"
        | "inquiry_only"
        | "reservation_request"
        | "city_dependent_service"
      proof_status: "draft" | "sent" | "approved" | "revision_requested"
      quote_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "declined"
        | "expired"
        | "converted"
      refund_reason:
        | "customer_request"
        | "defect"
        | "cancellation"
        | "duplicate"
        | "goodwill"
        | "other"
      refund_status:
        | "requested"
        | "approved"
        | "processing"
        | "completed"
        | "rejected"
      refund_type: "full" | "partial"
      reservation_status:
        | "requested"
        | "quote_pending"
        | "confirmed"
        | "deposit_paid"
        | "in_planning"
        | "ready"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rescheduled"
        | "no_show"
      review_status: "pending" | "approved" | "rejected" | "hidden"
      review_subject_type:
        | "product"
        | "service_package"
        | "order"
        | "experience"
        | "brand"
      search_entity_type:
        | "product"
        | "service_package"
        | "collection"
        | "experience"
        | "digital_product"
        | "article"
      service_behavior:
        | "quote_required"
        | "reservation_request"
        | "city_dependent_service"
        | "inquiry_only"
      service_category:
        | "organizasyon"
        | "nisan_soz_setup"
        | "dogum_gunu"
        | "baby_shower"
        | "gender_reveal"
        | "dekor_konsept"
        | "muzik_dj"
        | "foto_video"
        | "sehir_hizmeti"
        | "ozel"
      shipment_status:
        | "preparing"
        | "shipped"
        | "in_transit"
        | "delivered"
        | "returned"
      shipping_method_type: "cargo" | "courier" | "pickup"
      staff_role:
        | "superadmin"
        | "admin"
        | "commerce_manager"
        | "product_editor"
        | "order_operations"
        | "service_operations"
        | "proof_designer"
        | "support_agent"
        | "finance_viewer"
        | "content_editor"
        | "content_publisher"
        | "sales_crm"
        | "operations"
      stock_mode: "in_stock" | "made_to_order" | "preorder" | "unavailable"
      support_sender_type: "customer" | "staff"
      support_source: "account" | "order" | "product" | "contact"
      support_status: "open" | "waiting_customer" | "waiting_team" | "closed"
      travel_fee_model: "none" | "fixed" | "per_km" | "quote"
      variant_status: "active" | "inactive"
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
    Enums: {
      addon_type: ["gift_wrap", "rush", "extra_revision", "upgrade", "other"],
      assignment_status: ["proposed", "confirmed", "completed"],
      cart_status: ["active", "converted", "abandoned", "expired"],
      checkout_status: [
        "open",
        "pending_payment",
        "paid",
        "failed",
        "expired",
        "converted",
      ],
      client_status: ["active", "past", "archived"],
      consent_type: [
        "kvkk",
        "distance_sales",
        "pre_info",
        "cookie",
        "marketing",
        "explicit",
        "photo_publish",
      ],
      consultation_channel: ["online", "phone", "whatsapp", "in_person"],
      consultation_status: [
        "requested",
        "confirmed",
        "completed",
        "no_show",
        "cancelled",
      ],
      contact_inquiry_type: ["general", "press", "partnership", "other"],
      contact_status: ["new", "replied", "closed"],
      content_status: ["draft", "published"],
      cookie_action: ["accept_all", "reject_optional", "configure"],
      data_request_kind: ["export", "deletion"],
      data_request_status: [
        "pending",
        "in_review",
        "completed",
        "rejected",
        "cancelled",
      ],
      deposit_model: ["none", "fixed", "percentage"],
      digital_behavior: [
        "digital_checkout",
        "proof_required",
        "quote_required",
      ],
      digital_delivery_mode: ["link", "download", "hosted_page"],
      digital_offering_type: [
        "wedding_website",
        "digital_invitation",
        "rsvp",
        "qr",
        "guest_list",
        "countdown",
        "location_map",
        "couple_story",
        "gallery",
      ],
      digital_project_status: [
        "draft",
        "in_design",
        "proof_sent",
        "approved",
        "delivered",
        "expired",
      ],
      digital_type: [
        "dijital_davetiye",
        "web_davetiye",
        "animasyonlu_davetiye",
        "qr_kart",
        "dijital_album",
        "indirilebilir",
      ],
      einvoice_status: ["not_required", "pending", "issued", "failed"],
      faq_category: [
        "process",
        "products",
        "digital",
        "rsvp",
        "production",
        "location",
        "budget",
        "customization",
        "language",
        "memory",
      ],
      favorite_item_type: [
        "product",
        "service_package",
        "collection",
        "digital_product",
      ],
      fulfillment_status: [
        "not_started",
        "preparing",
        "shipped",
        "delivered",
        "returned",
      ],
      invoice_type: ["bireysel", "kurumsal"],
      lead_source_type: [
        "hayalini_tasarla",
        "quote_request",
        "product_inquiry",
        "contact_form",
        "memory_request",
        "whatsapp",
        "city_waitlist",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "appointment",
        "proposal_sent",
        "negotiation",
        "won",
        "lost",
      ],
      legal_doc_key: [
        "kvkk_aydinlatma",
        "gizlilik",
        "cerez",
        "acik_riza",
        "kullanim_kosullari",
        "on_bilgilendirme",
        "mesafeli_satis",
        "iade_iptal",
        "teslimat",
        "kisisellestirilmis_urun",
        "hizmet_rezervasyon",
        "satici_bilgileri",
      ],
      media_type: ["image", "video", "document"],
      memory_offering_type: [
        "photo",
        "film",
        "drone",
        "reels",
        "love_story",
        "family_memory",
        "event_trailer",
      ],
      milestone_status: ["pending", "paid", "done", "waived", "overdue"],
      milestone_type: [
        "deposit",
        "interim_payment",
        "final_payment",
        "delivery_step",
        "approval_step",
      ],
      notification_channel: ["email", "sms", "whatsapp", "onsite"],
      notification_type: [
        "order_update",
        "proof_ready",
        "payment",
        "shipment",
        "reservation_update",
        "quote_ready",
        "support_reply",
        "digital_delivery",
        "marketing",
      ],
      order_status: [
        "pending_payment",
        "paid",
        "in_design",
        "proof_sent",
        "revision_requested",
        "proof_approved",
        "in_production",
        "quality_check",
        "packed",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
      ],
      payable_type: [
        "order",
        "reservation_deposit",
        "reservation_balance",
        "quote",
      ],
      payment_provider: ["iyzico", "paytr", "bank_transfer", "manual"],
      payment_status: [
        "pending",
        "authorized",
        "paid",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      personalization_field_type: [
        "text",
        "textarea",
        "date",
        "select",
        "file",
        "number",
        "checkbox",
      ],
      price_band: ["inquiry_only", "starter", "premium", "luxury", "bespoke"],
      price_display: ["from_price", "price_band", "quote_only"],
      price_type: ["fixed", "percentage"],
      product_behavior: [
        "cart_enabled",
        "proof_required_cart",
        "digital_checkout",
        "quote_required",
        "inquiry_only",
        "reservation_request",
        "city_dependent_service",
      ],
      proof_status: ["draft", "sent", "approved", "revision_requested"],
      quote_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "declined",
        "expired",
        "converted",
      ],
      refund_reason: [
        "customer_request",
        "defect",
        "cancellation",
        "duplicate",
        "goodwill",
        "other",
      ],
      refund_status: [
        "requested",
        "approved",
        "processing",
        "completed",
        "rejected",
      ],
      refund_type: ["full", "partial"],
      reservation_status: [
        "requested",
        "quote_pending",
        "confirmed",
        "deposit_paid",
        "in_planning",
        "ready",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
        "no_show",
      ],
      review_status: ["pending", "approved", "rejected", "hidden"],
      review_subject_type: [
        "product",
        "service_package",
        "order",
        "experience",
        "brand",
      ],
      search_entity_type: [
        "product",
        "service_package",
        "collection",
        "experience",
        "digital_product",
        "article",
      ],
      service_behavior: [
        "quote_required",
        "reservation_request",
        "city_dependent_service",
        "inquiry_only",
      ],
      service_category: [
        "organizasyon",
        "nisan_soz_setup",
        "dogum_gunu",
        "baby_shower",
        "gender_reveal",
        "dekor_konsept",
        "muzik_dj",
        "foto_video",
        "sehir_hizmeti",
        "ozel",
      ],
      shipment_status: [
        "preparing",
        "shipped",
        "in_transit",
        "delivered",
        "returned",
      ],
      shipping_method_type: ["cargo", "courier", "pickup"],
      staff_role: [
        "superadmin",
        "admin",
        "commerce_manager",
        "product_editor",
        "order_operations",
        "service_operations",
        "proof_designer",
        "support_agent",
        "finance_viewer",
        "content_editor",
        "content_publisher",
        "sales_crm",
        "operations",
      ],
      stock_mode: ["in_stock", "made_to_order", "preorder", "unavailable"],
      support_sender_type: ["customer", "staff"],
      support_source: ["account", "order", "product", "contact"],
      support_status: ["open", "waiting_customer", "waiting_team", "closed"],
      travel_fee_model: ["none", "fixed", "per_km", "quote"],
      variant_status: ["active", "inactive"],
    },
  },
} as const

