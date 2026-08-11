export interface PhotoRecord {
  id: string;
  compositeImageUrl: string;
  frameId: string | null;
  createdAt: string;
  frame?: { name: string; category: string };
  deletedAt?: string | null;
}
