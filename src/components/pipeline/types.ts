export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  assigned_agent_id: string | null;
  notes: string | null;
  tags: string[] | null;
  move_date: string | null;
  origin_address: string | null;
  destination_address: string | null;
  estimated_weight: number | null;
  estimated_value: number | null;
}

export interface Deal {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string | null;
  stage: string;
  deal_value: number | null;
  actual_revenue: number | null;
  carrier_id: string | null;
  carrier_name: string | null;
  assigned_agent_id: string | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  loss_reason: string | null;
  leads?: Lead | null;
}

export interface Activity {
  id: string;
  created_at: string;
  deal_id: string | null;
  lead_id: string | null;
  agent_id: string | null;
  type: string;
  subject: string | null;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  is_done: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  stage_key: string;
  display_order: number;
  color: string;
  is_default: boolean;
}
