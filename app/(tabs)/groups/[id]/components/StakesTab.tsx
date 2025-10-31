import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { debtService } from "../../../../services/DebtService";
import { authService } from "../../../../services/AuthService";
import type { Debt, MemberDebtSummary } from "../../../../services/DebtService";

interface StakesTabProps {
  groupId: string;
}

type ViewType = 'overview' | string; // 'overview' or user_id

export default function StakesTab({ groupId }: StakesTabProps) {
  const [selectedView, setSelectedView] = useState<ViewType>('overview');
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [summaries, setSummaries] = useState<MemberDebtSummary[]>([]);
  const [allDebts, setAllDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeTab();
  }, [groupId]);

  useEffect(() => {
    if (selectedView !== 'overview') {
      fetchUserDebts(selectedView);
    }
  }, [selectedView]);

  const initializeTab = async () => {
    setLoading(true);

    // Get current user
    const { data: session } = await authService.getSession();
    if (session?.user) {
      setCurrentUserId(session.user.id);
      setSelectedView(session.user.id); // Start with current user view
    }

    // Fetch debt summaries
    const { data: summariesData } = await debtService.getGroupDebtSummaries(groupId);
    if (summariesData) {
      // Sort: current user first, then by net balance descending
      const sorted = summariesData.sort((a, b) => {
        if (a.user_id === session?.user.id) return -1;
        if (b.user_id === session?.user.id) return 1;
        return b.net_balance - a.net_balance;
      });
      setSummaries(sorted);
    }

    // Fetch all debts for overview
    const { data: debtsData } = await debtService.getGroupDebts(groupId);
    if (debtsData) {
      setAllDebts(debtsData);
    }

    setLoading(false);
  };

  const fetchUserDebts = async (userId: string) => {
    const { data } = await debtService.getUserDebts(groupId, userId);
    // The debts are already fetched in allDebts, we'll filter them for display
  };

  const handleSettleDebt = async (debtId: string) => {
    Alert.alert(
      "Settle Debt",
      "Mark this debt as paid?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark as Paid",
          onPress: async () => {
            const { error } = await debtService.settleDebt(debtId);
            if (error) {
              Alert.alert("Error", "Failed to settle debt");
            } else {
              Alert.alert("Success", "Debt marked as paid");
              initializeTab(); // Refresh
            }
          }
        }
      ]
    );
  };

  const canSettleDebt = (debt: Debt): boolean => {
    // Only debtor or creditor can settle
    return debt.debtor_id === currentUserId || debt.creditor_id === currentUserId;
  };

  const getDebtsForUser = (userId: string): Debt[] => {
    return allDebts.filter(d => d.debtor_id === userId || d.creditor_id === userId);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#90B2AC" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Sub-navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-shrink-0 border-b border-gray-200"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {/* Overview */}
        <TouchableOpacity
          onPress={() => setSelectedView('overview')}
          className={`mr-3 px-4 py-2 rounded-full ${
            selectedView === 'overview' ? 'bg-orange-500' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`font-medium ${
              selectedView === 'overview' ? 'text-white' : 'text-text-primary'
            }`}
          >
            Overview
          </Text>
        </TouchableOpacity>

        {/* Members */}
        {summaries.map((summary) => (
          <TouchableOpacity
            key={summary.user_id}
            onPress={() => setSelectedView(summary.user_id)}
            className={`mr-3 px-4 py-2 rounded-full ${
              selectedView === summary.user_id ? 'bg-orange-500' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedView === summary.user_id ? 'text-white' : 'text-text-primary'
              }`}
            >
              {summary.username}
              {summary.user_id === currentUserId && ' (You)'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4">
        {selectedView === 'overview' ? (
          <OverviewView
            summaries={summaries}
            debts={allDebts}
            onSettleDebt={handleSettleDebt}
            canSettleDebt={canSettleDebt}
          />
        ) : (
          <MemberView
            member={summaries.find(s => s.user_id === selectedView)!}
            debts={getDebtsForUser(selectedView)}
            currentUserId={currentUserId}
            onSettleDebt={handleSettleDebt}
            canSettleDebt={canSettleDebt}
          />
        )}
      </ScrollView>
    </View>
  );
}

// Overview View Component
function OverviewView({
  summaries,
  debts,
  onSettleDebt,
  canSettleDebt
}: {
  summaries: MemberDebtSummary[];
  debts: Debt[];
  onSettleDebt: (id: string) => void;
  canSettleDebt: (debt: Debt) => boolean;
}) {
  return (
    <View>
      {/* Summary Table */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-text-primary mb-3">
          Member Balances
        </Text>
        <View className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <View className="flex-row bg-gray-50 px-4 py-3 border-b border-gray-200">
            <Text className="flex-1 text-xs font-semibold text-text-secondary uppercase">
              Member
            </Text>
            <Text className="w-20 text-xs font-semibold text-text-secondary uppercase text-right">
              Balance
            </Text>
          </View>

          {/* Rows */}
          {summaries.map((summary) => (
            <View
              key={summary.user_id}
              className="flex-row px-4 py-3 border-b border-gray-100"
            >
              <Text className="flex-1 text-sm text-text-primary">
                {summary.username}
              </Text>
              <Text
                className={`w-20 text-sm font-semibold text-right ${
                  summary.net_balance > 0
                    ? 'text-green-600'
                    : summary.net_balance < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                ${Math.abs(summary.net_balance).toFixed(2)}
                {summary.net_balance > 0 ? ' ↑' : summary.net_balance < 0 ? ' ↓' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* All Debts */}
      <View>
        <Text className="text-lg font-bold text-text-primary mb-3">
          Unsettled Debts ({debts.length})
        </Text>

        {debts.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-text-secondary">No unsettled debts</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {debts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onSettle={() => onSettleDebt(debt.id)}
                canSettle={canSettleDebt(debt)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// Member View Component
function MemberView({
  member,
  debts,
  currentUserId,
  onSettleDebt,
  canSettleDebt
}: {
  member: MemberDebtSummary;
  debts: Debt[];
  currentUserId: string;
  onSettleDebt: (id: string) => void;
  canSettleDebt: (debt: Debt) => boolean;
}) {
  const debtsOwed = debts.filter(d => d.creditor_id === member.user_id);
  const debtsOwing = debts.filter(d => d.debtor_id === member.user_id);

  return (
    <View>
      {/* Member Summary */}
      <View className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
        <Text className="text-xl font-bold text-text-primary mb-2">
          {member.username}
          {member.user_id === currentUserId && ' (You)'}
        </Text>

        <View className="flex-row justify-between mt-2">
          <View>
            <Text className="text-xs text-text-secondary">Owed to them</Text>
            <Text className="text-lg font-bold text-green-600">
              ${member.total_owed.toFixed(2)}
            </Text>
          </View>

          <View>
            <Text className="text-xs text-text-secondary">They owe</Text>
            <Text className="text-lg font-bold text-red-600">
              ${member.total_owing.toFixed(2)}
            </Text>
          </View>

          <View>
            <Text className="text-xs text-text-secondary">Net Balance</Text>
            <Text
              className={`text-lg font-bold ${
                member.net_balance > 0
                  ? 'text-green-600'
                  : member.net_balance < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              ${Math.abs(member.net_balance).toFixed(2)}
              {member.net_balance > 0 ? ' ↑' : member.net_balance < 0 ? ' ↓' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Debts Owed to Them */}
      {debtsOwed.length > 0 && (
        <View className="mb-6">
          <Text className="text-base font-bold text-text-primary mb-3">
            Owed to {member.username} ({debtsOwed.length})
          </Text>
          <View className="space-y-3">
            {debtsOwed.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onSettle={() => onSettleDebt(debt.id)}
                canSettle={canSettleDebt(debt)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Debts They Owe */}
      {debtsOwing.length > 0 && (
        <View>
          <Text className="text-base font-bold text-text-primary mb-3">
            {member.username} owes ({debtsOwing.length})
          </Text>
          <View className="space-y-3">
            {debtsOwing.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onSettle={() => onSettleDebt(debt.id)}
                canSettle={canSettleDebt(debt)}
              />
            ))}
          </View>
        </View>
      )}

      {debts.length === 0 && (
        <View className="py-8 items-center">
          <Text className="text-text-secondary">No debts</Text>
        </View>
      )}
    </View>
  );
}

// Debt Card Component
function DebtCard({
  debt,
  onSettle,
  canSettle
}: {
  debt: Debt;
  onSettle: () => void;
  canSettle: boolean;
}) {
  return (
    <View className="p-4 bg-white rounded-lg border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-sm text-text-primary">
            <Text className="font-semibold">{debt.debtor?.username}</Text>
            {' owes '}
            <Text className="font-semibold">{debt.creditor?.username}</Text>
          </Text>

          {debt.reason && (
            <Text className="text-xs text-text-secondary mt-1">
              {debt.reason}
            </Text>
          )}

          <Text className="text-xs text-text-secondary mt-1">
            {new Date(debt.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text className="text-lg font-bold text-orange-600 ml-2">
          ${debt.amount.toFixed(2)}
        </Text>
      </View>

      {canSettle && (
        <TouchableOpacity
          onPress={onSettle}
          className="mt-3 py-2 px-4 bg-green-500 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-sm">
            Mark as Paid
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
