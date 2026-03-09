export type Player = {
  id: string;
  displayName: string;
  submitted: boolean;
  submission?: string;
  joinedAt: string;
};

export type Game = {
  id: string;
  code: string;
  name: string;
  theme?: string;
  hostPlays: boolean;
  hostSessionId: string;
  hostParticipantId?: string;
  createdAt: string;
  submissionsLocked: boolean;
  players: Record<string, Player>;
};
