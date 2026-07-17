export interface FieldModel {
  name: string;
  type: string;

  primary?: boolean;
  nullable?: boolean;
  unique?: boolean;
  required?: boolean;

  default?: unknown;
  length?: number;
  relation?: string;
  enum?: string[];
  documentation?: string;
}
