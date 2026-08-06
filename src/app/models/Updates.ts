export interface ChangeDetail {
  type: string;
  details: string[];
}

export interface UpdateData {
  date: string;
  author: string;
  items: ChangeDetail[];
}
