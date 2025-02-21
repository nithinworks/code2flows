export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          credits: number;
          created_at: string;
          updated_at: string;
          role: "user" | "admin" | "super_admin";
          status: "active" | "banned";
          email_verified: boolean;
          verified_at: string | null;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: "purchase" | "usage";
          created_at: string;
        };
      };
    };
  };
};

export type User = Database["public"]["Tables"]["users"]["Row"];
