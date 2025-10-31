import { BaseService, ServiceResponse } from "./base/BaseService";
import { supabase } from "../config/supabase";

export interface Debt {
  id: string;
  group_id: string;
  debtor_id: string;
  creditor_id: string;
  amount: number;
  currency_code: string;
  reason?: string;
  habit_id?: string;
  check_in_id?: string;
  is_settled: boolean;
  is_archived: boolean;
  created_at: string;
  settled_at?: string;
  notes?: string;
  // Enriched properties from joins
  debtor?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  creditor?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface MemberDebtSummary {
  user_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  total_owed: number; // How much others owe this user
  total_owing: number; // How much this user owes others
  net_balance: number; // total_owed - total_owing
}

class DebtService extends BaseService {
  constructor() {
    super("debts");
  }

  // Get all unsettled debts for a group with debtor/creditor details
  async getGroupDebts(groupId: string): Promise<ServiceResponse<Debt[]>> {
    try {
      const { data, error } = await supabase
        .from("debts")
        .select(
          `
          *,
          debtor:users!debts_debtor_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          ),
          creditor:users!debts_creditor_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("group_id", groupId)
        .eq("is_settled", false)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) {
        return this.createResponse<Debt[]>(null, error);
      }

      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse<Debt[]>(null, error as Error);
    }
  }

  // Get debts involving a specific user in a group
  async getUserDebts(
    groupId: string,
    userId: string
  ): Promise<ServiceResponse<Debt[]>> {
    try {
      const { data, error } = await supabase
        .from("debts")
        .select(
          `
          *,
          debtor:users!debts_debtor_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          ),
          creditor:users!debts_creditor_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("group_id", groupId)
        .eq("is_settled", false)
        .or(`debtor_id.eq.${userId},creditor_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        return this.createResponse<Debt[]>(null, error);
      }

      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse<Debt[]>(null, error as Error);
    }
  }

  // Get debt summaries for all members in a group
  async getGroupDebtSummaries(
    groupId: string
  ): Promise<ServiceResponse<MemberDebtSummary[]>> {
    try {
      // Get all group members
      const { data: members, error: membersError } = await supabase
        .from("group_members")
        .select(
          `
          user_id,
          users:user_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `
        )
        .eq("group_id", groupId)
        .eq("is_active", true);

      if (membersError) {
        return this.createResponse<MemberDebtSummary[]>(null, membersError);
      }

      // Get all unsettled debts for the group
      const { data: debts } = await supabase
        .from("debts")
        .select("debtor_id, creditor_id, amount")
        .eq("group_id", groupId)
        .eq("is_settled", false);

      // Calculate summaries for each member
      const summaries: MemberDebtSummary[] = members.map((m: any) => {
        const userId = m.user_id;
        const user = m.users;

        const totalOwed = debts
          ?.filter((d) => d.creditor_id === userId)
          .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

        const totalOwing = debts
          ?.filter((d) => d.debtor_id === userId)
          .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

        return {
          user_id: userId,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          total_owed: totalOwed,
          total_owing: totalOwing,
          net_balance: totalOwed - totalOwing,
        };
      });

      return this.createResponse(summaries, null);
    } catch (error) {
      return this.createResponse<MemberDebtSummary[]>(null, error as Error);
    }
  }

  // Mark a debt as settled
  async settleDebt(debtId: string): Promise<ServiceResponse<Debt>> {
    try {
      const { data, error } = await supabase
        .from("debts")
        .update({
          is_settled: true,
          settled_at: new Date().toISOString(),
        })
        .eq("id", debtId)
        .select()
        .single();

      if (error) {
        return this.createResponse<Debt>(null, error);
      }

      return this.createResponse(data, null);
    } catch (error) {
      return this.createResponse<Debt>(null, error as Error);
    }
  }
}

// Export singleton instance
export const debtService = new DebtService();
