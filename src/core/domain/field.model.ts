export interface FieldModel {
  name: string;
  type: string;

  nullable?: boolean;
  unique?: boolean;
  required?: boolean;
  default?: unknown;
  length?: number;
  relation?: string;
  enum?: string[];
  documentation?: string;
}
