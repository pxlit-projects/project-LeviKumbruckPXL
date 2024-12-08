export interface Post {
    id?: string
    title: string;
    content: string;
    redactor: string;
    createdDate?: string;
    reviewComment?: string;
    commentIds?: number[];
  }
  