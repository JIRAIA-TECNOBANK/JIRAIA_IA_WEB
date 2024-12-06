import { FilterField } from "./filter-field.model";

export class GridFilter {
  id: string;
  fields: FilterField[];
  customFields?: boolean;
  maxNumberFields?: number;
}