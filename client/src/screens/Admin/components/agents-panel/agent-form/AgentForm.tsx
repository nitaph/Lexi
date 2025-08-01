import { agentsOptions, defaultSettings, defaultSliderSettings, initialSlidersEnabled } from '@DAL/constants';
import { saveAgent, updateAgent } from '@DAL/server-requests/agents';
import { ChipsInput } from '@components/common/ChipsInput';
import { SnackbarStatus, useSnackbar } from '@contexts/SnackbarProvider';
import { AgentType } from '@models/AppModels';
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
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { getExperimentsByAgent } from '../../../../../DAL/server-requests/experiments';
import { updateUsersAgent } from '../../../../../DAL/server-requests/users';
import { WarningMessage } from '../../../../../components/common/WarningMessasge';
import { MainContainer, SaveButton } from './AgentForm.s';

interface AgentFormProps {
    editAgent: any;
    agents: AgentType[];
    setAgents: (any) => void;
    closeDialog: () => void;
    isEditMode: boolean;
}

const AgentForm: React.FC<AgentFormProps> = ({
    editAgent,
    agents,
    setAgents,
    closeDialog,
    isEditMode = false,
}) => {
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [experimentsToUpdate, setExperimentsToUpdate] = useState([]);
    const [updateUsersAgentMsg, setUpdateUsersAgentMsg] = useState(false);
    const formTitle = useMemo(() => (!isEditMode ? 'New Agent' : 'Edit Agent'), []);
    const [confirmExperimentUpdateMsg, setConfirmExperimentUpdateMsg] = useState(false);

    const { openSnackbar } = useSnackbar();
    const [slidersEnabled, setSlidersEnabled] = useState<any>(
        isEditMode
            ? {
                  temperatureEnabled: editAgent.temperature !== null,
                  maxTokensEnabled: editAgent.maxTokens !== null,
                  topPEnabled: editAgent.topP !== null,
                  frequencyPenaltyEnabled: editAgent.frequencyPenalty !== null,
                  presencePenaltyEnabled: editAgent.presencePenalty !== null,
              }
            : initialSlidersEnabled,
    );

    const [agent, setAgent] = useState<any>(editAgent ? editAgent : defaultSettings);
    const updateAgentInList = (updatedAgent: AgentType) => {
        const updatedSettings = agents.map((agent: AgentType) =>
            agent._id === updatedAgent._id ? updatedAgent : agent,
        );
        setAgents(updatedSettings);
    };

    const validateAgent = (): boolean => {
        let message = '';
        if (!agent.title) message = 'Title is required.';
        else if (!agent.model) message = 'Agent selection is required.';
        else if (!agent.firstChatSentence) message = 'First Chat Sentence is required.';
        else if (!agent.systemStarterPrompt) message = 'System Starter Prompt is required.';

        setValidationMessage(message);
        return !message;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setAgent({ ...agent, [name]: value });
    };

    const handleConfirmUpdate = async () => {
        if (!validateAgent()) return;

        setIsSaveLoading(true);
        try {
            await updateAgent(agent);
            updateAgentInList(agent);
            openSnackbar('Agent Updated !', SnackbarStatus.SUCCESS);
            setIsSaveLoading(false);
            setUpdateUsersAgentMsg(true);
            setConfirmExperimentUpdateMsg(false);
        } catch (error) {
            openSnackbar('Agent Update Failed', SnackbarStatus.ERROR);
            setIsSaveLoading(false);
        }
    };

    const handleConfirmUsersUpdate = async () => {
        setIsSaveLoading(true);
        try {
            await updateUsersAgent(agent);
            openSnackbar('Users Agent Updated !', SnackbarStatus.SUCCESS);
            setIsSaveLoading(false);
            setUpdateUsersAgentMsg(false);
            closeDialog();
        } catch (error) {
            openSnackbar('Users Update Failed', SnackbarStatus.ERROR);
            setIsSaveLoading(false);
        }
    };

    const handleUpdate = async () => {
        const experiments = await getExperimentsByAgent(agent._id);
        if (experiments.length) {
            setExperimentsToUpdate(experiments);
            setConfirmExperimentUpdateMsg(true);
            setIsSaveLoading(false);
            return;
        }
        await updateAgent(agent);
        updateAgentInList(agent);
        openSnackbar('Agent Updated !', SnackbarStatus.SUCCESS);
        closeDialog();
    };

    const handleSave = async () => {
        if (!validateAgent()) return;

        setIsSaveLoading(true);
        try {
            if (!isEditMode) {
                const savedAgent = await saveAgent(agent);
                setAgents([...agents, savedAgent]);
                openSnackbar('Agent Saved !', SnackbarStatus.SUCCESS);
                closeDialog();
            } else {
                await handleUpdate();
            }
            setIsSaveLoading(false);
        } catch (error) {
            openSnackbar('Agent Saving Failed', SnackbarStatus.ERROR);
            setIsSaveLoading(false);
        }
    };

    const handleSliderChange = (newValue: number | number[], field: string) => {
        setAgent({ ...agent, [field]: newValue });
    };

    const renderSlider = (
        field: string,
        name: string,
        min: number,
        max: number,
        step: number,
        enabled: boolean,
    ) => (
        <FormControl fullWidth margin="normal">
            <Typography gutterBottom>{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>
            <Box display="flex" alignItems="center" gap={1}>
                <Checkbox
                    checked={enabled}
                    onChange={(e) => {
                        handleSliderChange(e.target.checked ? defaultSliderSettings[field] : null, field);
                        setSlidersEnabled({
                            ...slidersEnabled,
                            [`${field}Enabled`]: e.target.checked,
                        });
                    }}
                    name={`${field}Enabled`}
                />
                <Slider
                    value={enabled && agent[field]}
                    onChange={(e, newValue) => handleSliderChange(newValue, field)}
                    min={min}
                    max={max}
                    step={step}
                    valueLabelDisplay="auto"
                    name={name}
                    disabled={!enabled}
                />
            </Box>
        </FormControl>
    );

    return (
        <MainContainer maxWidth="md" style={{ paddingBottom: '32px' }}>
            <Typography variant="h4" gutterBottom margin="normal">
                {formTitle}
            </Typography>
            <TextField
                fullWidth
                required
                label="Title"
                name="title"
                value={agent.title}
                onChange={handleChange}
                size="small"
                margin="normal"
            />
            <TextField
                maxRows={3}
                rows={3}
                multiline
                fullWidth
                label="Summary"
                name="summary"
                value={agent.summary}
                onChange={handleChange}
                size="small"
                margin="normal"
            />
            <FormControl fullWidth margin="normal" size="small" required>
                <InputLabel id="agent-select-label">Model</InputLabel>
                <Select
                    labelId="agent-select-label"
                    value={agent.model}
                    onChange={handleChange}
                    label="Model"
                    name="model"
                >
                    {agentsOptions.map((agent) => (
                        <MenuItem key={agent} value={agent}>
                            {agent}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                fullWidth
                required
                multiline
                maxRows={4}
                rows={4}
                label="First Chat Sentence"
                name="firstChatSentence"
                value={agent.firstChatSentence}
                onChange={handleChange}
                size="small"
                margin="normal"
            />
            <TextField
                fullWidth
                required
                multiline
                maxRows={8}
                rows={8}
                label="System Starter Prompt"
                name="systemStarterPrompt"
                value={agent.systemStarterPrompt}
                onChange={handleChange}
                size="small"
                margin="normal"
            />
            <TextField
                fullWidth
                label="Before User Sentence Prompt"
                name="beforeUserSentencePrompt"
                value={agent.beforeUserSentencePrompt}
                onChange={handleChange}
                size="small"
                margin="normal"
            />
            <TextField
                fullWidth
                label="After User Sentence Prompt"
                name="afterUserSentencePrompt"
                value={agent.afterUserSentencePrompt}
                onChange={handleChange}
                size="small"
                margin="normal"
            />
            {renderSlider('temperature', 'temperature', 0, 2, 0.01, slidersEnabled.temperatureEnabled)}
            {renderSlider('maxTokens', 'max tokens', 1, 4096, 1, slidersEnabled.maxTokensEnabled)}
            {renderSlider('topP', 'top p', 0, 1, 0.01, slidersEnabled.topPEnabled)}
            {renderSlider(
                'frequencyPenalty',
                'frequency penalty',
                0,
                2,
                0.01,
                slidersEnabled.frequencyPenaltyEnabled,
            )}
            {renderSlider(
                'presencePenalty',
                'presence_penalty',
                0,
                2,
                0.01,
                slidersEnabled.presencePenaltyEnabled,
            )}
            <ChipsInput
                list={agent.stopSequences}
                setList={(stops) => setAgent({ ...agent, stopSequences: stops })}
                id={'stop'}
                label={'Stop Sequences'}
            />
            <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="conversation-strategy-label">Conversation Strategy</InputLabel>
                <Select
                    labelId="conversation-strategy-label"
                    value={agent.conversationStrategy}
                    label="Conversation Strategy"
                    name="conversationStrategy"
                    onChange={handleChange}
                >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="mirroring">Mirroring</MenuItem>
                    <MenuItem value="complementing">Complementing</MenuItem>
                </Select>
            </FormControl>
            {confirmExperimentUpdateMsg ? (
                <WarningMessage
                    handleYes={handleConfirmUpdate}
                    handleNO={() => setConfirmExperimentUpdateMsg(false)}
                >
                    This agent is attached to the following experiments:
                    {experimentsToUpdate.map((experiment, index) => (
                        <Typography
                            key={experiment._id}
                            component="span"
                            display="inline"
                            fontWeight="bold"
                            style={{ marginRight: index < experimentsToUpdate.length - 1 && '8px' }}
                        >
                            {experiment.title}
                            {index < experimentsToUpdate.length - 1 ? ',' : ''}
                        </Typography>
                    ))}
                    . Are you sure you want to update the agent?
                </WarningMessage>
            ) : updateUsersAgentMsg ? (
                <WarningMessage
                    handleYes={handleConfirmUsersUpdate}
                    handleNO={() => {
                        closeDialog();
                        openSnackbar('Agent Saved !', SnackbarStatus.SUCCESS);
                    }}
                >
                    Do you want to update the agent also for users in the experiments that have already been
                    attached to the agent?
                </WarningMessage>
            ) : (
                <SaveButton variant="contained" color="primary" onClick={handleSave} style={{ marginBottom: 0 }}>
                    {isSaveLoading ? <CircularProgress size={28} sx={{ color: 'white' }} /> : 'Save Agent'}
                </SaveButton>
            )}
            {validationMessage && <Typography color="error">{validationMessage}</Typography>}
        </MainContainer>
    );
};

export default AgentForm;
