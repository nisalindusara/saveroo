// Database types generated from supabase/migrations by `pnpm db:types`. Do not edit by hand.
// Used through @saveroo/shared by the API (and later the web app) for typed queries.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"diff": Json | null,"entity_id": string | null,"entity_type": string,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"diff"?: Json | null,"entity_id"?: string | null,"entity_type": string,"id"?: string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"diff"?: Json | null,"entity_id"?: string | null,"entity_type"?: string,"id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"brands": {
                  Row: {
                    "created_at": string,"id": string,"logo_url": string | null,"name": string,"slug": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"logo_url"?: string | null,"name": string,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"logo_url"?: string | null,"name"?: string,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"card_products": {
                  Row: {
                    "card_type": Database["public"]['Enums']["card_type"],"created_at": string,"id": string,"name": string,"network": Database["public"]['Enums']["card_network"],"provider_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "card_type": Database["public"]['Enums']["card_type"],"created_at"?: string,"id"?: string,"name": string,"network": Database["public"]['Enums']["card_network"],"provider_id": string,"updated_at"?: string
                  }
                  Update: {
                    "card_type"?: Database["public"]['Enums']["card_type"],"created_at"?: string,"id"?: string,"name"?: string,"network"?: Database["public"]['Enums']["card_network"],"provider_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "card_products_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "created_at": string,"icon": string | null,"id": string,"name": string,"parent_id": string | null,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"icon"?: string | null,"id"?: string,"name": string,"parent_id"?: string | null,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"icon"?: string | null,"id"?: string,"name"?: string,"parent_id"?: string | null,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"consents": {
                  Row: {
                    "created_at": string,"granted": boolean,"granted_at": string,"id": string,"kind": Database["public"]['Enums']["consent_kind"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"granted": boolean,"granted_at"?: string,"id"?: string,"kind": Database["public"]['Enums']["consent_kind"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"granted"?: boolean,"granted_at"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["consent_kind"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "consents_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"coupon_codes": {
                  Row: {
                    "code": string,"created_at": string,"deal_id": string,"id": string,"kind": Database["public"]['Enums']["coupon_kind"],"updated_at": string,"usage_limit": number | null,"used_count": number,"valid_from": string | null,"valid_to": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"deal_id": string,"id"?: string,"kind"?: Database["public"]['Enums']["coupon_kind"],"updated_at"?: string,"usage_limit"?: number | null,"used_count"?: number,"valid_from"?: string | null,"valid_to"?: string | null
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"deal_id"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["coupon_kind"],"updated_at"?: string,"usage_limit"?: number | null,"used_count"?: number,"valid_from"?: string | null,"valid_to"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "coupon_codes_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_branches": {
                  Row: {
                    "branch_id": string,"created_at": string,"deal_id": string,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "branch_id": string,"created_at"?: string,"deal_id": string,"id"?: string
                  }
                  Update: {
                    "branch_id"?: string,"created_at"?: string,"deal_id"?: string,"id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_branches_branch_id_fkey"
      columns: ["branch_id"]
isOneToOne: false
      referencedRelation: "merchant_branches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deal_branches_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_eligibility": {
                  Row: {
                    "card_product_id": string | null,"card_type": Database["public"]['Enums']["card_type"] | null,"created_at": string,"deal_id": string,"id": string,"note": string | null,"provider_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "card_product_id"?: string | null,"card_type"?: Database["public"]['Enums']["card_type"] | null,"created_at"?: string,"deal_id": string,"id"?: string,"note"?: string | null,"provider_id": string
                  }
                  Update: {
                    "card_product_id"?: string | null,"card_type"?: Database["public"]['Enums']["card_type"] | null,"created_at"?: string,"deal_id"?: string,"id"?: string,"note"?: string | null,"provider_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_eligibility_card_product_id_fkey"
      columns: ["card_product_id"]
isOneToOne: false
      referencedRelation: "card_products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deal_eligibility_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deal_eligibility_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_schedules": {
                  Row: {
                    "blackout_dates": (string)[],"created_at": string,"days_of_week": (number)[],"deal_id": string,"end_time": string | null,"id": string,"note": string | null,"start_time": string | null,"updated_at": string,"valid_from": string | null,"valid_to": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "blackout_dates"?: (string)[],"created_at"?: string,"days_of_week"?: (number)[],"deal_id": string,"end_time"?: string | null,"id"?: string,"note"?: string | null,"start_time"?: string | null,"updated_at"?: string,"valid_from"?: string | null,"valid_to"?: string | null
                  }
                  Update: {
                    "blackout_dates"?: (string)[],"created_at"?: string,"days_of_week"?: (number)[],"deal_id"?: string,"end_time"?: string | null,"id"?: string,"note"?: string | null,"start_time"?: string | null,"updated_at"?: string,"valid_from"?: string | null,"valid_to"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_schedules_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    }
                  ]
                },"deals": {
                  Row: {
                    "affiliate_url": string | null,"brand_id": string | null,"category_id": string | null,"channel": Database["public"]['Enums']["deal_channel"],"created_at": string,"created_by": string | null,"deal_price_lkr": number | null,"deal_type": Database["public"]['Enums']["deal_type"],"description": string | null,"discount_amount_lkr": number | null,"discount_percent": number | null,"ends_at": string | null,"featured_until": string | null,"how_to_redeem": string | null,"id": string,"image_ratio": number | null,"image_url": string | null,"is_featured": boolean,"last_checked_at": string | null,"max_saving_lkr": number | null,"merchant_id": string,"min_spend_lkr": number | null,"notified_at": string | null,"origin": Database["public"]['Enums']["deal_origin"],"original_price_lkr": number | null,"proof_image_url": string | null,"recheck_due_at": string | null,"search": unknown,"slug": string,"source_url": string | null,"starts_at": string,"status": Database["public"]['Enums']["deal_status"],"terms": string | null,"title": string,"updated_at": string,"verification": Database["public"]['Enums']["deal_verification"],"view_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "affiliate_url"?: string | null,"brand_id"?: string | null,"category_id"?: string | null,"channel"?: Database["public"]['Enums']["deal_channel"],"created_at"?: string,"created_by"?: string | null,"deal_price_lkr"?: number | null,"deal_type": Database["public"]['Enums']["deal_type"],"description"?: string | null,"discount_amount_lkr"?: number | null,"discount_percent"?: number | null,"ends_at"?: string | null,"featured_until"?: string | null,"how_to_redeem"?: string | null,"id"?: string,"image_ratio"?: number | null,"image_url"?: string | null,"is_featured"?: boolean,"last_checked_at"?: string | null,"max_saving_lkr"?: number | null,"merchant_id": string,"min_spend_lkr"?: number | null,"notified_at"?: string | null,"origin"?: Database["public"]['Enums']["deal_origin"],"original_price_lkr"?: number | null,"proof_image_url"?: string | null,"recheck_due_at"?: string | null,"search"?: never,"slug": string,"source_url"?: string | null,"starts_at"?: string,"status"?: Database["public"]['Enums']["deal_status"],"terms"?: string | null,"title": string,"updated_at"?: string,"verification"?: Database["public"]['Enums']["deal_verification"],"view_count"?: number
                  }
                  Update: {
                    "affiliate_url"?: string | null,"brand_id"?: string | null,"category_id"?: string | null,"channel"?: Database["public"]['Enums']["deal_channel"],"created_at"?: string,"created_by"?: string | null,"deal_price_lkr"?: number | null,"deal_type"?: Database["public"]['Enums']["deal_type"],"description"?: string | null,"discount_amount_lkr"?: number | null,"discount_percent"?: number | null,"ends_at"?: string | null,"featured_until"?: string | null,"how_to_redeem"?: string | null,"id"?: string,"image_ratio"?: number | null,"image_url"?: string | null,"is_featured"?: boolean,"last_checked_at"?: string | null,"max_saving_lkr"?: number | null,"merchant_id"?: string,"min_spend_lkr"?: number | null,"notified_at"?: string | null,"origin"?: Database["public"]['Enums']["deal_origin"],"original_price_lkr"?: number | null,"proof_image_url"?: string | null,"recheck_due_at"?: string | null,"search"?: never,"slug"?: string,"source_url"?: string | null,"starts_at"?: string,"status"?: Database["public"]['Enums']["deal_status"],"terms"?: string | null,"title"?: string,"updated_at"?: string,"verification"?: Database["public"]['Enums']["deal_verification"],"view_count"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "deals_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deals_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deals_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deals_merchant_id_fkey"
      columns: ["merchant_id"]
isOneToOne: false
      referencedRelation: "merchants"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "anonymous_id": string | null,"app_version": string | null,"created_at": string,"entity_id": string | null,"entity_type": string | null,"id": number,"name": string,"platform": Database["public"]['Enums']["app_platform"],"props": NonNullable<Json>,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "anonymous_id"?: string | null,"app_version"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string | null,"id"?: never,"name": string,"platform": Database["public"]['Enums']["app_platform"],"props"?: NonNullable<Json>,"user_id"?: string | null
                  }
                  Update: {
                    "anonymous_id"?: string | null,"app_version"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string | null,"id"?: never,"name"?: string,"platform"?: Database["public"]['Enums']["app_platform"],"props"?: NonNullable<Json>,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"feature_flags": {
                  Row: {
                    "created_at": string,"enabled": boolean,"id": string,"key": string,"rollout_percent": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"enabled"?: boolean,"id"?: string,"key": string,"rollout_percent"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"enabled"?: boolean,"id"?: string,"key"?: string,"rollout_percent"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"follows": {
                  Row: {
                    "created_at": string,"id": string,"keyword": string | null,"target_id": string | null,"target_type": Database["public"]['Enums']["follow_target"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"keyword"?: string | null,"target_id"?: string | null,"target_type": Database["public"]['Enums']["follow_target"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"keyword"?: string | null,"target_id"?: string | null,"target_type"?: Database["public"]['Enums']["follow_target"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "follows_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"merchant_branches": {
                  Row: {
                    "address": string | null,"city": string | null,"created_at": string,"district": string | null,"id": string,"location": unknown,"merchant_id": string,"name": string,"opening_hours": Json | null,"phone": string | null,"status": Database["public"]['Enums']["merchant_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"city"?: string | null,"created_at"?: string,"district"?: string | null,"id"?: string,"location"?: unknown,"merchant_id": string,"name": string,"opening_hours"?: Json | null,"phone"?: string | null,"status"?: Database["public"]['Enums']["merchant_status"],"updated_at"?: string
                  }
                  Update: {
                    "address"?: string | null,"city"?: string | null,"created_at"?: string,"district"?: string | null,"id"?: string,"location"?: unknown,"merchant_id"?: string,"name"?: string,"opening_hours"?: Json | null,"phone"?: string | null,"status"?: Database["public"]['Enums']["merchant_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "merchant_branches_merchant_id_fkey"
      columns: ["merchant_id"]
isOneToOne: false
      referencedRelation: "merchants"
      referencedColumns: ["id"]
    }
                  ]
                },"merchants": {
                  Row: {
                    "cover_url": string | null,"created_at": string,"description": string | null,"domains": (string)[],"has_physical_stores": boolean,"id": string,"is_online": boolean,"is_verified": boolean,"logo_url": string | null,"name": string,"phone": string | null,"primary_category_id": string | null,"slug": string,"status": Database["public"]['Enums']["merchant_status"],"updated_at": string,"website_url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "cover_url"?: string | null,"created_at"?: string,"description"?: string | null,"domains"?: (string)[],"has_physical_stores"?: boolean,"id"?: string,"is_online"?: boolean,"is_verified"?: boolean,"logo_url"?: string | null,"name": string,"phone"?: string | null,"primary_category_id"?: string | null,"slug": string,"status"?: Database["public"]['Enums']["merchant_status"],"updated_at"?: string,"website_url"?: string | null
                  }
                  Update: {
                    "cover_url"?: string | null,"created_at"?: string,"description"?: string | null,"domains"?: (string)[],"has_physical_stores"?: boolean,"id"?: string,"is_online"?: boolean,"is_verified"?: boolean,"logo_url"?: string | null,"name"?: string,"phone"?: string | null,"primary_category_id"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["merchant_status"],"updated_at"?: string,"website_url"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "merchants_primary_category_id_fkey"
      columns: ["primary_category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_deliveries": {
                  Row: {
                    "channel": Database["public"]['Enums']["notification_channel"],"created_at": string,"error": string | null,"id": string,"notification_id": string,"sent_at": string | null,"status": Database["public"]['Enums']["delivery_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "channel": Database["public"]['Enums']["notification_channel"],"created_at"?: string,"error"?: string | null,"id"?: string,"notification_id": string,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["delivery_status"]
                  }
                  Update: {
                    "channel"?: Database["public"]['Enums']["notification_channel"],"created_at"?: string,"error"?: string | null,"id"?: string,"notification_id"?: string,"sent_at"?: string | null,"status"?: Database["public"]['Enums']["delivery_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_deliveries_notification_id_fkey"
      columns: ["notification_id"]
isOneToOne: false
      referencedRelation: "notifications"
      referencedColumns: ["id"]
    }
                  ]
                },"notification_preferences": {
                  Row: {
                    "created_at": string,"daily_cap": number,"digest": Database["public"]['Enums']["digest_frequency"],"email": boolean,"inapp": boolean,"push": boolean,"quiet_end": string | null,"quiet_start": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"daily_cap"?: number,"digest"?: Database["public"]['Enums']["digest_frequency"],"email"?: boolean,"inapp"?: boolean,"push"?: boolean,"quiet_end"?: string | null,"quiet_start"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"daily_cap"?: number,"digest"?: Database["public"]['Enums']["digest_frequency"],"email"?: boolean,"inapp"?: boolean,"push"?: boolean,"quiet_end"?: string | null,"quiet_start"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notification_preferences_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "body": string | null,"created_at": string,"data": NonNullable<Json>,"deal_id": string | null,"id": string,"read_at": string | null,"title": string,"type": Database["public"]['Enums']["notification_type"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string | null,"created_at"?: string,"data"?: NonNullable<Json>,"deal_id"?: string | null,"id"?: string,"read_at"?: string | null,"title": string,"type": Database["public"]['Enums']["notification_type"],"user_id": string
                  }
                  Update: {
                    "body"?: string | null,"created_at"?: string,"data"?: NonNullable<Json>,"deal_id"?: string | null,"id"?: string,"read_at"?: string | null,"title"?: string,"type"?: Database["public"]['Enums']["notification_type"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"display_name": string | null,"district": string | null,"id": string,"language": string,"onboarding_done": boolean,"points": number,"role": Database["public"]['Enums']["user_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"display_name"?: string | null,"district"?: string | null,"id": string,"language"?: string,"onboarding_done"?: boolean,"points"?: number,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"display_name"?: string | null,"district"?: string | null,"id"?: string,"language"?: string,"onboarding_done"?: boolean,"points"?: number,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"providers": {
                  Row: {
                    "created_at": string,"id": string,"logo_url": string | null,"name": string,"slug": string,"type": Database["public"]['Enums']["provider_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"logo_url"?: string | null,"name": string,"slug": string,"type": Database["public"]['Enums']["provider_type"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"logo_url"?: string | null,"name"?: string,"slug"?: string,"type"?: Database["public"]['Enums']["provider_type"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"push_tokens": {
                  Row: {
                    "created_at": string,"id": string,"last_seen_at": string,"platform": Database["public"]['Enums']["app_platform"],"token": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"last_seen_at"?: string,"platform": Database["public"]['Enums']["app_platform"],"token": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"last_seen_at"?: string,"platform"?: Database["public"]['Enums']["app_platform"],"token"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "push_tokens_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"reminders": {
                  Row: {
                    "created_at": string,"deal_id": string,"id": string,"kind": Database["public"]['Enums']["reminder_kind"],"remind_at": string,"sent_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deal_id": string,"id"?: string,"kind": Database["public"]['Enums']["reminder_kind"],"remind_at": string,"sent_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"deal_id"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["reminder_kind"],"remind_at"?: string,"sent_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reminders_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reminders_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"saved_deals": {
                  Row: {
                    "created_at": string,"deal_id": string,"id": string,"remind_before_expiry": boolean,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deal_id": string,"id"?: string,"remind_before_expiry"?: boolean,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"deal_id"?: string,"id"?: string,"remind_before_expiry"?: boolean,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "saved_deals_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "saved_deals_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"store_requests": {
                  Row: {
                    "created_at": string,"id": string,"url_or_domain": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"url_or_domain": string,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"url_or_domain"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "store_requests_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_wallet": {
                  Row: {
                    "card_product_id": string | null,"created_at": string,"id": string,"provider_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "card_product_id"?: string | null,"created_at"?: string,"id"?: string,"provider_id": string,"user_id": string
                  }
                  Update: {
                    "card_product_id"?: string | null,"created_at"?: string,"id"?: string,"provider_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_wallet_card_product_id_fkey"
      columns: ["card_product_id"]
isOneToOne: false
      referencedRelation: "card_products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_wallet_provider_id_fkey"
      columns: ["provider_id"]
isOneToOne: false
      referencedRelation: "providers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_wallet_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "admin_find_duplicate_deals":
{ Args: { "p_exclude_id"?: string,"p_merchant_id": string,"p_title": string }; Returns: {
              "id": string,"similarity": number,"slug": string,"status": Database["public"]['Enums']["deal_status"],"title": string
            }[]
                           },
"admin_import_deals":
{ Args: { "p_actor": string,"p_items": Json }; Returns: (string)[]
                           },
"admin_mark_deal_checked":
{ Args: { "p_actor": string,"p_deal_id": string,"p_recheck_days"?: number }; Returns: undefined
                           },
"admin_save_deal":
{ Args: { "p_actor": string,"p_branch_ids": (string)[],"p_coupons": Json,"p_deal": Json,"p_eligibility": Json,"p_schedules": Json }; Returns: string
                           },
"admin_save_merchant":
{ Args: { "p_actor": string,"p_branches": Json,"p_merchant": Json }; Returns: string
                           },
"admin_set_deal_status":
{ Args: { "p_actor": string,"p_deal_id": string,"p_status": Database["public"]['Enums']["deal_status"] }; Returns: undefined
                           },
"deal_card":
{ Args: { "p_deal": Omit<Database["public"]['Tables']["deals"]['Row'], Database["public"]['Tables']["deals"]['ComputedFields']>,"p_merchant": Omit<Database["public"]['Tables']["merchants"]['Row'], Database["public"]['Tables']["merchants"]['ComputedFields']> }; Returns: Json
                           },
"deal_snapshot":
{ Args: { "p_deal_id": string }; Returns: Json
                           },
"expire_deals":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"is_public_deal":
{ Args: { "p_deal_id": string }; Returns: boolean
                           },
"make_slug":
{ Args: { "p_exclude"?: string,"p_table": string,"p_text": string }; Returns: string
                           },
"merchant_snapshot":
{ Args: { "p_merchant_id": string }; Returns: Json
                           },
"public_deal":
{ Args: { "p_slug": string }; Returns: Json
                           },
"public_feed":
{ Args: { "p_after_id"?: string,"p_after_ts"?: string,"p_category_slug"?: string,"p_limit"?: number,"p_merchant_slug"?: string }; Returns: {
              "card": Json,"sort_id": string,"sort_ts": string
            }[]
                           },
"public_home":
{ Args: { "p_dow": number,"p_limit"?: number }; Returns: Json
                           },
"public_merchant":
{ Args: { "p_slug": string }; Returns: Json
                           },
"public_search_deals":
{ Args: { "p_limit"?: number,"p_offset"?: number,"p_q": string }; Returns: {
              "card": Json,"score": number
            }[]
                           },
"public_search_merchants":
{ Args: { "p_limit"?: number,"p_q": string }; Returns: {
              "merchant": Json,"score": number
            }[]
                           },
"public_sitemap":
{ Args: Record<PropertyKey, never>; Returns: Json
                           }
          }
          Enums: {
            "app_platform": "web"|"android"|"ios"|"extension","card_network": "visa"|"mastercard"|"amex"|"unionpay"|"local"|"none","card_type": "credit"|"debit"|"prepaid"|"loyalty"|"other","consent_kind": "notifications"|"location"|"analytics"|"marketing","coupon_kind": "copy"|"show_qr"|"auto_apply","deal_channel": "in_store"|"online"|"both","deal_origin": "admin"|"community"|"merchant","deal_status": "draft"|"pending"|"live"|"paused"|"expired"|"rejected","deal_type": "percent_off"|"amount_off"|"bogo"|"freebie"|"cashback"|"coupon_code"|"price_drop"|"bundle"|"other","deal_verification": "verified"|"community"|"unverified","delivery_status": "queued"|"sent"|"failed"|"skipped","digest_frequency": "instant"|"daily"|"weekly","follow_target": "merchant"|"brand"|"category"|"keyword"|"product","merchant_status": "active"|"hidden","notification_channel": "inapp"|"push"|"email"|"whatsapp","notification_type": "new_deal"|"reminder"|"expiring"|"system","provider_type": "bank"|"telco"|"wallet"|"loyalty"|"network","reminder_kind": "valid_day"|"expiry","user_role": "user"|"moderator"|"admin"
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
  "public": {
          Enums: {
            "app_platform": ["web", "android", "ios", "extension"],"card_network": ["visa", "mastercard", "amex", "unionpay", "local", "none"],"card_type": ["credit", "debit", "prepaid", "loyalty", "other"],"consent_kind": ["notifications", "location", "analytics", "marketing"],"coupon_kind": ["copy", "show_qr", "auto_apply"],"deal_channel": ["in_store", "online", "both"],"deal_origin": ["admin", "community", "merchant"],"deal_status": ["draft", "pending", "live", "paused", "expired", "rejected"],"deal_type": ["percent_off", "amount_off", "bogo", "freebie", "cashback", "coupon_code", "price_drop", "bundle", "other"],"deal_verification": ["verified", "community", "unverified"],"delivery_status": ["queued", "sent", "failed", "skipped"],"digest_frequency": ["instant", "daily", "weekly"],"follow_target": ["merchant", "brand", "category", "keyword", "product"],"merchant_status": ["active", "hidden"],"notification_channel": ["inapp", "push", "email", "whatsapp"],"notification_type": ["new_deal", "reminder", "expiring", "system"],"provider_type": ["bank", "telco", "wallet", "loyalty", "network"],"reminder_kind": ["valid_day", "expiry"],"user_role": ["user", "moderator", "admin"]
          }
        }
} as const
