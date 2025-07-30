import {
  AbAgentsType,
  AgentType,
  FormType,
  MultiAgentsType,
} from "@models/AppModels";

export const defaultSliderSettings = {
  temperature: 1,
  maxTokens: 256,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
} as const;

export const agentsOptions = [
  "gpt-3.5-turbo",
  "gpt-4-1106-preview",
  "gpt-4o",
  "gpt-4o-mini",
] as const;

export const defaultSettings: AgentType = {
  _id: "",
  title: "",
  summary: "",
  systemStarterPrompt: "",
  beforeUserSentencePrompt: "",
  afterUserSentencePrompt: "",
  firstChatSentence: "",
  model: agentsOptions[0],
  temperature: null,
  maxTokens: null,
  topP: null,
  frequencyPenalty: null,
  presencePenalty: null,
  stopSequences: [],
  conversationStrategy: "none",
};

export const defaultAbAgents: AbAgentsType = {
  agentA: null,
  distA: 50,
  agentB: null,
  distB: 50,
} as const;

export const defaultMultiAgents: MultiAgentsType = [];

export const defaultExperiment = {
  title: "",
  description: "",
  agentsMode: "Single",
  activeAgent: null,
  abAgents: null,
  multiAgents: defaultMultiAgents,
  isActive: true,
  maxMessages: undefined,
  maxConversations: undefined,
  maxParticipants: undefined,
  displaySettings: {
    welcomeHeader: "Welcome",
    welcomeContent:
      "You are about to take part in a research experiment hosted by Copenhagen Business School (CBS). To begin, you will complete a short survey that helps us personalize your experience. It should take around 20–25 minutes to finish. There are no right or wrong answers—just respond honestly. Your answers are confidential and used only for academic research. When you are ready, click Start Survey to begin",
  },
  experimentForms: {
    registration: null,
    preConversation: null,
    postConversation: null,
  },
  experimentFeatures: {
    userAnnotation: false,
    streamMessage: false,
  },
} as const;

export const initialSlidersEnabled = {
  temperatureEnabled: false,
  maxTokensEnabled: false,
  topPEnabled: false,
  frequencyPenaltyEnabled: false,
  presencePenaltyEnabled: false,
} as const;

export const ApiPaths = {
  CONVERSATIONS_PATH: "conversations",
  USERS_PATH: "users",
  DATA_AGGREGATION_PATH: "dataAggregation",
  AGENTS_PATH: "agents",
  EXPERIMENTS_PATH: "experiments",
  FORMS_PATH: "forms",
} as const;

export const AdminSections = {
  AGENTS: "agents",
  EXPERIMENTS: "experiments",
  FORMS: "forms",
  DATA: "data",
  SETTINGS: "settings",
} as const;

export const defaultQuestionProps = {
  "binary-radio-selector": {
    fieldKey: "",
    label: "Example For a binary question:",
    required: true,
  },
  "scale-radio": {
    fieldKey: "",
    label: "Choose on the scale:",
    left: "Left Option",
    right: "Right Option",
    range: 5,
    required: true,
    numbered: false,
  },
  "selection-text-input": {
    fieldKey: "",
    label: "Select an option",
    required: true,
    selectionOptions: [{ label: "Option 1", value: "option1" }],
  },
  "number-input": {
    fieldKey: "",
    label: "Insert a number",
    min: 0,
    max: 100,
    defaultValue: null,
    required: true,
  },
  "radio-selection": {
    fieldKey: "",
    label: "Select one of the following options:",
    required: true,
    selectionOptions: [{ label: "Option 1", value: "option1" }],
  },
};

export const defaultForm: FormType = {
  name: "Untitled",
  title: "",
  instructions: "",
  questions: [
    {
      type: "selection-text-input",
      props: defaultQuestionProps["selection-text-input"],
    },
  ],
};
