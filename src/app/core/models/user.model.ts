export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  google_id?: string;
}

export interface AuthResponse {
  user: User;
  profile: any;
  chats: any[];
  progression: any;
  token: string;
}
