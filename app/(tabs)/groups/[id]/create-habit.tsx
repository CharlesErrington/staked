import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  habitService,
  type HabitTemplate,
  type CreateHabitTemplatePayload,
} from "../../../services/HabitService";
import { groupService } from "../../../services/GroupService";

type ModeType = "create" | "select";
type FrequencyType = "daily" | "weekly";

const DAYS_OF_WEEK = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export default function CreateHabitScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [mode, setMode] = useState<ModeType>("create");
  const [frequency, setFrequency] = useState<FrequencyType>("daily");
  const [templates, setTemplates] = useState<HabitTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [groupCurrency, setGroupCurrency] = useState<string>("USD");

  // Form state for creating new habit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadlineTime: "23:59",
    deadlineDay: 1, // Monday by default
    proofRequired: false,
    stakeAmount: "",
    skipsAllowed: "",
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGroupCurrency();
    loadHabitTemplates();
  }, []);

  const loadGroupCurrency = async () => {
    if (!groupId) return;
    const { data } = await groupService.getGroupById(groupId);
    if (data) {
      setGroupCurrency(data.currency_code);
    }
  };

  const loadHabitTemplates = async () => {
    setLoadingTemplates(true);
    const { data, error } = await habitService.getUserHabitTemplates();
    if (data && !error) {
      setTemplates(data);
    }
    setLoadingTemplates(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === "create") {
      if (!formData.name.trim()) {
        newErrors.name = "Habit name is required";
      }
      if (!formData.deadlineTime) {
        newErrors.deadlineTime = "Check-in deadline is required";
      }
    } else {
      if (!selectedTemplate) {
        newErrors.template = "Please select a habit template";
      }
    }

    // Common validations
    const stakeAmount = parseFloat(formData.stakeAmount);
    if (!formData.stakeAmount || isNaN(stakeAmount) || stakeAmount < 1) {
      newErrors.stakeAmount = "Stake must be at least 1";
    }
    if (stakeAmount % 1 !== 0) {
      newErrors.stakeAmount = "Stake must be a whole number";
    }

    const skipsAllowed = parseInt(formData.skipsAllowed);
    if (formData.skipsAllowed === "" || isNaN(skipsAllowed)) {
      newErrors.skipsAllowed = "Skips allowed is required";
    }
    const maxSkips = frequency === "daily" ? 5 : 3;
    if (skipsAllowed < 0 || skipsAllowed > maxSkips) {
      newErrors.skipsAllowed = `Skips must be between 0 and ${maxSkips}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!groupId) {
      Alert.alert("Error", "Group ID is missing");
      return;
    }

    setLoading(true);
    try {
      const stakeAmount = parseFloat(formData.stakeAmount);
      const skipsAllowed = parseInt(formData.skipsAllowed);

      if (mode === "create") {
        // Create new habit with template
        const templatePayload: CreateHabitTemplatePayload = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          frequency,
          deadline_time: formData.deadlineTime + ":00", // Convert HH:MM to HH:MM:SS
          deadline_day: frequency === "weekly" ? formData.deadlineDay : undefined,
          proof_required: formData.proofRequired,
        };

        const { data, error } = await habitService.createHabitWithTemplate(
          templatePayload,
          groupId,
          stakeAmount,
          skipsAllowed
        );

        if (error) {
          Alert.alert("Error", "Failed to create habit. Please try again.");
          console.error("Create habit error:", error);
        } else if (data) {
          Alert.alert("Success", "Habit created successfully!");
          router.back();
        }
      } else {
        // Create habit from existing template
        if (!selectedTemplate) {
          Alert.alert("Error", "Please select a habit template");
          return;
        }

        const { data, error } = await habitService.createHabit({
          habit_template_id: selectedTemplate.id,
          group_id: groupId,
          stake_amount: stakeAmount,
          skips_allowed: skipsAllowed,
        });

        if (error) {
          Alert.alert("Error", "Failed to add habit to group. Please try again.");
          console.error("Add habit error:", error);
        } else if (data) {
          Alert.alert("Success", "Habit added to group successfully!");
          router.back();
        }
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderModeSelector = () => (
    <View className="flex-row gap-3 mb-6">
      <TouchableOpacity
        onPress={() => setMode("create")}
        className={`flex-1 py-3 px-4 rounded-lg border-2 ${
          mode === "create"
            ? "bg-green-50 border-green-500"
            : "bg-white border-gray-200"
        }`}
      >
        <Text
          className={`text-center font-semibold ${
            mode === "create" ? "text-green-700" : "text-text-secondary"
          }`}
        >
          Create New Habit
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode("select")}
        className={`flex-1 py-3 px-4 rounded-lg border-2 ${
          mode === "select"
            ? "bg-green-50 border-green-500"
            : "bg-white border-gray-200"
        }`}
      >
        <Text
          className={`text-center font-semibold ${
            mode === "select" ? "text-green-700" : "text-text-secondary"
          }`}
        >
          Select Existing Habit
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFrequencySelector = () => (
    <View className="mb-6">
      <Text className="text-sm font-medium text-text-primary mb-2">
        Frequency*
      </Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => setFrequency("daily")}
          className={`flex-1 py-3 px-4 rounded-lg border-2 ${
            frequency === "daily"
              ? "bg-green-50 border-green-500"
              : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              frequency === "daily" ? "text-green-700" : "text-text-secondary"
            }`}
          >
            Daily
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFrequency("weekly")}
          className={`flex-1 py-3 px-4 rounded-lg border-2 ${
            frequency === "weekly"
              ? "bg-green-50 border-green-500"
              : "bg-white border-gray-200"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              frequency === "weekly" ? "text-green-700" : "text-text-secondary"
            }`}
          >
            Weekly
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProofToggle = () => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-medium text-text-primary mb-1">
            Require Photo Proof
          </Text>
          <Text className="text-xs text-text-secondary">
            Members must upload a photo when checking in
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            setFormData({ ...formData, proofRequired: !formData.proofRequired })
          }
          className={`w-14 h-8 rounded-full p-1 ${
            formData.proofRequired ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <View
            className={`w-6 h-6 rounded-full bg-white ${
              formData.proofRequired ? "ml-auto" : "ml-0"
            }`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCreateForm = () => (
    <>
      <Input
        label="Habit Name"
        placeholder="e.g., Morning Run"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        autoCapitalize="words"
        maxLength={50}
        error={errors.name}
        required
      />

      <Input
        label="Description (Optional)"
        placeholder="Add more details about this habit..."
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline
        numberOfLines={3}
        maxLength={200}
      />

      {renderFrequencySelector()}

      <View className="mb-6">
        <Text className="text-sm font-medium text-text-primary mb-2">
          Check-in Deadline*
        </Text>
        {frequency === "weekly" && (
          <View className="mb-3">
            <Text className="text-xs text-text-secondary mb-2">Day of Week</Text>
            <View className="flex-row flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  onPress={() =>
                    setFormData({ ...formData, deadlineDay: day.value })
                  }
                  className={`px-3 py-2 rounded-lg border ${
                    formData.deadlineDay === day.value
                      ? "bg-calm-blue-500 border-calm-blue-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      formData.deadlineDay === day.value
                        ? "text-white"
                        : "text-text-secondary"
                    }`}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <Input
          placeholder="e.g., 20:00"
          value={formData.deadlineTime}
          onChangeText={(text) => setFormData({ ...formData, deadlineTime: text })}
          helper={`Time in 24-hour format (HH:MM). ${
            frequency === "weekly"
              ? `Deadline: ${DAYS_OF_WEEK.find((d) => d.value === formData.deadlineDay)?.label} at ${formData.deadlineTime}`
              : `Deadline: Daily at ${formData.deadlineTime}`
          }`}
          error={errors.deadlineTime}
          keyboardType="default"
          maxLength={5}
        />
      </View>

      {renderProofToggle()}
    </>
  );

  const renderSelectForm = () => (
    <>
      {errors.template && (
        <View className="mb-4 p-3 bg-red-50 rounded-lg">
          <Text className="text-red-600 text-sm">⚠ {errors.template}</Text>
        </View>
      )}

      {loadingTemplates ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#90B2AC" />
          <Text className="text-text-secondary mt-2">Loading your habits...</Text>
        </View>
      ) : templates.length === 0 ? (
        <View className="py-8 px-4 bg-gray-50 rounded-lg mb-6">
          <Text className="text-text-secondary text-center">
            You haven't created any habits yet. Switch to "Create New Habit" to get
            started!
          </Text>
        </View>
      ) : (
        <View className="mb-6">
          <Text className="text-sm font-medium text-text-primary mb-3">
            Select a Habit Template
          </Text>
          <ScrollView className="max-h-80" nestedScrollEnabled>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => {
                  setSelectedTemplate(template);
                  setFrequency(template.frequency);
                }}
                className={`mb-3 p-4 rounded-lg border-2 ${
                  selectedTemplate?.id === template.id
                    ? "bg-green-50 border-green-500"
                    : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-text-primary mb-1">
                      {template.name}
                    </Text>
                    {template.description && (
                      <Text className="text-sm text-text-secondary mb-2">
                        {template.description}
                      </Text>
                    )}
                    <View className="flex-row flex-wrap gap-2">
                      <View className="bg-gray-100 px-2 py-1 rounded">
                        <Text className="text-xs text-text-secondary">
                          {template.frequency === "daily" ? "📅 Daily" : "📆 Weekly"}
                        </Text>
                      </View>
                      <View className="bg-gray-100 px-2 py-1 rounded">
                        <Text className="text-xs text-text-secondary">
                          ⏰{" "}
                          {template.frequency === "weekly"
                            ? `${DAYS_OF_WEEK.find((d) => d.value === template.deadline_day)?.label} ${template.deadline_time.slice(0, 5)}`
                            : template.deadline_time.slice(0, 5)}
                        </Text>
                      </View>
                      {template.proof_required && (
                        <View className="bg-gray-100 px-2 py-1 rounded">
                          <Text className="text-xs text-text-secondary">
                            📸 Proof Required
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {selectedTemplate?.id === template.id && (
                    <Text className="text-2xl ml-2">✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );

  const maxSkips = frequency === "daily" ? 5 : 3;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="p-4">
            {/* Header */}
            <View className="mb-6">
              <TouchableOpacity onPress={() => router.back()} className="mb-2">
                <Text className="text-calm-blue-500 font-medium">← Back</Text>
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-text-primary mb-2">
                Add a Habit
              </Text>
              <Text className="text-text-secondary">
                Create a new habit or select from your existing ones
              </Text>
            </View>

            {/* Mode Selector */}
            {renderModeSelector()}

            {/* Form */}
            {mode === "create" ? renderCreateForm() : renderSelectForm()}

            {/* Common Fields (Stake & Skips) */}
            <View className="pt-4 border-t border-gray-200">
              <Text className="text-sm font-medium text-text-primary mb-4">
                Group-Specific Settings
              </Text>

              <Input
                label="Stake Amount"
                placeholder="e.g., 10"
                value={formData.stakeAmount}
                onChangeText={(text) =>
                  setFormData({ ...formData, stakeAmount: text })
                }
                keyboardType="number-pad"
                leftIcon={<Text className="text-text-secondary">{groupCurrency}</Text>}
                helper="Amount you'll stake for this habit (whole numbers only)"
                error={errors.stakeAmount}
                required
              />

              <Input
                label="Skips Allowed"
                placeholder={`0-${maxSkips}`}
                value={formData.skipsAllowed}
                onChangeText={(text) =>
                  setFormData({ ...formData, skipsAllowed: text })
                }
                keyboardType="number-pad"
                helper={`Number of times you can skip this habit per ${frequency === "daily" ? "week" : "month"}`}
                error={errors.skipsAllowed}
                required
              />
            </View>

            {/* Submit Button */}
            <View className="mt-6 mb-4">
              <Button
                variant="primary"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                {mode === "create" ? "Create Habit" : "Add to Group"}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
