export interface FormField {
  id: string;
  form_id: string;
  type: string;
  label: string;
  placeholder?: string | null;
  required: boolean;
  options?: unknown;
  position: number;
  settings?: unknown;
  created_at?: string;
}

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  settings: {
    backgroundColor: string;
    fontFamily: string;
    primaryColor: string;
  };
  created_at: string;
  updated_at: string;
}
