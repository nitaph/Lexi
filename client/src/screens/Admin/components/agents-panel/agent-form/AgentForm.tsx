// AgentForm.tsx

import {
  agentsOptions,
  defaultSettings,
  defaultSliderSettings,
  initialSlidersEnabled,
} from "@DAL/constants";
import { saveAgent, updateAgent } from "@DAL/server-requests/agents";
import { fetchPersonalityScores } from "@DAL/server-requests/personality";
import { ChipsInput } from "@components/common/ChipsInput";
import { SnackbarStatus, useSnackbar } from "@contexts/SnackbarProvider";
import { AgentType } from "@models/AppModels";
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { getExperimentsByAgent } from "@DAL/server-requests/experiments";
import { updateUsersAgent } from "@DAL/server-requests/users";
import { WarningMessage } from "@components/common/WarningMessasge";
import { MainContainer, SaveButton } from "./AgentForm.s";

interface AgentFormProps {
  editAgent: AgentType | null;
  agents: AgentType[];
  setAgents: (agents: AgentType[]) => void;
  closeDialog: () => void;
  isEditMode: boolean;
}

const AgentForm: React.FC<AgentFormProps> = ({
  editAgent,
  agents,
  setAgents,
  closeDialog,
  isEditMode,
}) => {
  const { openSnackbar } = useSnackbar();
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [experimentsToUpdate, setExperimentsToUpdate] = useState([]);
  const [updateUsersAgentMsg, setUpdateUsersAgentMsg] = useState(false);
  const [confirmExperimentUpdateMsg, setConfirmExperimentUpdateMsg] =
    useState(false);

  const formTitle = useMemo(
    () => (isEditMode ? "Edit Agent" : "New Agent"),
    []
  );

  const [slidersEnabled, setSlidersEnabled] = useState(
    isEditMode
      ? {
          temperatureEnabled: editAgent?.temperature !== null,
          maxTokensEnabled: editAgent?.maxTokens !== null,
          topPEnabled: editAgent?.topP !== null,
          frequencyPenaltyEnabled: editAgent?.frequencyPenalty !== null,
          presencePenaltyEnabled: editAgent?.presencePenalty !== null,
        }
      : initialSlidersEnabled
  );

  const [agent, setAgent] = useState<any>(
    editAgent
      ? {
          ...editAgent,
          personalityStrategy: editAgent.personalityStrategy || "none",
        }
      : { ...defaultSettings, personalityStrategy: "none" }
  );

  const validateAgent = (): boolean => {
    let message = "";
    if (!agent.title) message = "Title is required.";
    else if (!agent.model) message = "Model is required.";
    else if (!agent.firstChatSentence)
      message = "First chat sentence is required.";
    else if (!agent.systemStarterPrompt)
      message = "System starter prompt is required.";
    setValidationMessage(message);
    return !message;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setAgent({ ...agent, [name]: value });
  };

  const updateAgentInList = (updated: AgentType) => {
    const newList = agents.map((a) => (a._id === updated._id ? updated : a));
    setAgents(newList);
  };

  const handleConfirmUpdate = async () => {
    if (!validateAgent()) return;
    try {
      await updateAgent(agent);
      updateAgentInList(agent);
      openSnackbar("Agent Updated!", SnackbarStatus.SUCCESS);
      setUpdateUsersAgentMsg(true);
      setConfirmExperimentUpdateMsg(false);
    } catch {
      openSnackbar("Agent update failed", SnackbarStatus.ERROR);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleConfirmUsersUpdate = async () => {
    try {
      await updateUsersAgent(agent);
      openSnackbar("Users' agent updated", SnackbarStatus.SUCCESS);
      closeDialog();
    } catch {
      openSnackbar("Failed to update users", SnackbarStatus.ERROR);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateAgent()) return;
    setIsSaveLoading(true);

    try {
      let agentToSave = {
        ...agent,
        personalityStrategy: agent.personalityStrategy || "none",
      };

      console.log("💾 Agent to save:", agentToSave);

      // Inject personality traits only if needed
      if (agent.personalityStrategy !== "none") {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.warn(
            "No user ID found in local storage. Skipping personality injection."
          );
        } else {
          try {
            const scores = await fetchPersonalityScores(userId);
            const { createAgentFromPersonality } = await import(
              "@utils/createAgentFromPersonality"
            );
            agentToSave = await createAgentFromPersonality(
              agent,
              scores,
              agent.personalityStrategy
            );
          } catch (err) {
            console.warn(
              "No personality scores found for this user. Skipping personality injection."
            );
          }
        }
      }

      const saved = await saveAgent(agentToSave);
      setAgents([...agents, saved]);
      openSnackbar("Agent saved!", SnackbarStatus.SUCCESS);
      closeDialog();
    } catch (err) {
      console.error("Error saving agent:", err);
      openSnackbar("Failed to save agent", SnackbarStatus.ERROR);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const renderSlider = (
    field: string,
    label: string,
    min: number,
    max: number,
    step: number,
    enabled: boolean
  ) => {
    const sliderValue = enabled
      ? typeof agent[field] === "number"
        ? agent[field]
        : min
      : min;

    return (
      <FormControl fullWidth margin="normal">
        <Typography gutterBottom>{label}</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            checked={enabled}
            onChange={(e) => {
              setAgent({
                ...agent,
                [field]: e.target.checked ? defaultSliderSettings[field] : null,
              });
              setSlidersEnabled({
                ...slidersEnabled,
                [`${field}Enabled`]: e.target.checked,
              });
            }}
          />
          <Slider
            value={sliderValue}
            onChange={(_, val) =>
              setAgent({
                ...agent,
                [field]: typeof val === "number" ? val : min,
              })
            }
            disabled={!enabled}
            min={min}
            max={max}
            step={step}
            valueLabelDisplay="auto"
          />
        </Box>
      </FormControl>
    );
  };

  return (
    <MainContainer maxWidth="md" style={{ paddingBottom: "32px" }}>
      <Typography variant="h4" gutterBottom>
        {formTitle}
      </Typography>

      <TextField
        fullWidth
        required
        label="Title"
        name="title"
        value={agent.title}
        onChange={handleChange}
        margin="normal"
        size="small"
      />
      <TextField
        fullWidth
        label="Summary"
        name="summary"
        value={agent.summary}
        onChange={handleChange}
        margin="normal"
        size="small"
        multiline
        rows={2}
      />
      <FormControl fullWidth margin="normal" size="small" required>
        <InputLabel id="model-label">Model</InputLabel>
        <Select
          labelId="model-label"
          name="model"
          value={agent.model}
          onChange={handleChange}
        >
          {agentsOptions.map((model) => (
            <MenuItem key={model} value={model}>
              {model}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Personality Strategy */}
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel id="strategy-label">Personality Strategy</InputLabel>
        <Select
          labelId="strategy-label"
          name="personalityStrategy"
          value={agent.personalityStrategy || "none"}
          onChange={handleChange}
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="mirroring">Mirroring</MenuItem>
          <MenuItem value="complementing">Complementing</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        required
        label="First Chat Sentence"
        name="firstChatSentence"
        value={agent.firstChatSentence}
        onChange={handleChange}
        margin="normal"
        size="small"
        multiline
        rows={2}
      />
      <TextField
        fullWidth
        required
        label="System Starter Prompt"
        name="systemStarterPrompt"
        value={agent.systemStarterPrompt}
        onChange={handleChange}
        margin="normal"
        size="small"
        multiline
        rows={6}
      />
      <TextField
        fullWidth
        label="Before User Sentence Prompt"
        name="beforeUserSentencePrompt"
        value={agent.beforeUserSentencePrompt}
        onChange={handleChange}
        margin="normal"
        size="small"
      />
      <TextField
        fullWidth
        label="After User Sentence Prompt"
        name="afterUserSentencePrompt"
        value={agent.afterUserSentencePrompt}
        onChange={handleChange}
        margin="normal"
        size="small"
      />

      {renderSlider(
        "temperature",
        "Temperature",
        0,
        2,
        0.01,
        slidersEnabled.temperatureEnabled
      )}
      {renderSlider(
        "maxTokens",
        "Max Tokens",
        1,
        4096,
        1,
        slidersEnabled.maxTokensEnabled
      )}
      {renderSlider("topP", "Top P", 0, 1, 0.01, slidersEnabled.topPEnabled)}
      {renderSlider(
        "frequencyPenalty",
        "Frequency Penalty",
        0,
        2,
        0.01,
        slidersEnabled.frequencyPenaltyEnabled
      )}
      {renderSlider(
        "presencePenalty",
        "Presence Penalty",
        0,
        2,
        0.01,
        slidersEnabled.presencePenaltyEnabled
      )}

      <ChipsInput
        list={agent.stopSequences}
        setList={(stops) => setAgent({ ...agent, stopSequences: stops })}
        id="stop"
        label="Stop Sequences"
      />

      {confirmExperimentUpdateMsg ? (
        <WarningMessage
          handleYes={handleConfirmUpdate}
          handleNO={() => setConfirmExperimentUpdateMsg(false)}
        >
          This agent is attached to the following experiments:
          {experimentsToUpdate.map((e, i) => (
            <Typography component="span" key={e._id}>
              <b>{e.title}</b>
              {i < experimentsToUpdate.length - 1 ? ", " : ""}
            </Typography>
          ))}
          . Are you sure you want to update the agent?
        </WarningMessage>
      ) : updateUsersAgentMsg ? (
        <WarningMessage
          handleYes={handleConfirmUsersUpdate}
          handleNO={() => {
            closeDialog();
            openSnackbar("Agent Saved !", SnackbarStatus.SUCCESS);
          }}
        >
          Do you want to also update this agent for users in already-attached
          experiments?
        </WarningMessage>
      ) : (
        <SaveButton variant="contained" color="primary" onClick={handleSave}>
          {isSaveLoading ? (
            <CircularProgress size={28} sx={{ color: "white" }} />
          ) : (
            "Save Agent"
          )}
        </SaveButton>
      )}

      {validationMessage && (
        <Typography color="error" marginTop={1}>
          {validationMessage}
        </Typography>
      )}
    </MainContainer>
  );
};

export default AgentForm;
