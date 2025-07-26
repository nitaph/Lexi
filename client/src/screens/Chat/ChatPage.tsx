// src/screens/Chat/ChatPage.tsx

import {
  getConversation,
  updateUserAnnotation,
} from "@DAL/server-requests/conversations";
import FinishConversationDialog from "@components/common/FinishConversationDialog";
import LoadingPage from "@components/common/LoadingPage";
import { SnackbarStatus, useSnackbar } from "@contexts/SnackbarProvider";
import { useConversationId } from "@hooks/useConversationId";
import useEffectAsync from "@hooks/useEffectAsync";
import { Dialog, Grid, useMediaQuery } from "@mui/material";
import theme from "@root/Theme";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitPersonalityScores } from "@DAL/server-requests/personality";
import { useAppDispatch, useAppSelector } from "@DAL/redux/store";
import { ConversationForm } from "../../components/forms/conversation-form/ConversationForm";
import { useExperimentId } from "../../hooks/useExperimentId";
import { UserAnnotation, AgentType } from "../../models/AppModels";
import {
  MainContainer,
  MessageListContainer,
  SectionContainer,
  SectionInnerContainer,
} from "./ChatPage.s";
import MessageList from "./components/MessageList";
import InputBox from "./components/input-box/InputBox";
import { createAgentFromPersonality } from "@utils/createAgentFromPersonality";
import { setAssignedAgent } from "@DAL/redux/reducers/assignedAgentReducer";
import { SidebarChat } from "./components/side-bar-chat/SideBarChat";
import {
  getExperimentById,
  getExperimentCoversationForms,
  getExperimentFeatures,
} from "@DAL/server-requests/experiments";
import { getAgentById } from "@DAL/server-requests/agents";

interface MultiAgentWithData {
  agent: AgentType;
  dist: number;
}

interface ChatPageProps {
  isFinishDialogOpen: boolean;
  setIsFinishDialogOpen: (open: boolean) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({
  isFinishDialogOpen,
  setIsFinishDialogOpen,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const messagesRef = useRef<HTMLDivElement>(null);
  const { openSnackbar } = useSnackbar();

  const [messages, setMessages] = useState([]);
  const [conversationForms, setConversationForms] = useState({
    preConversation: null,
    postConversation: null,
  });
  const [messageFontSize, setMessageFontSize] = useState<"sm" | "lg">("lg");
  const [surveyOpen, setIsSurveyOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [experimentFeatures, setExperimentFeatures] = useState(null);
  const [multiAgents, setMultiAgents] = useState<MultiAgentWithData[]>([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const conversationId = useConversationId();
  const experimentId = useExperimentId();

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffectAsync(async () => {
    const preConversationFormAnsweredKey = `preConversationFormAnswered-${conversationId}`;
    const alreadyAnswered = sessionStorage.getItem(
      preConversationFormAnsweredKey
    );

    try {
      const [conversation, forms, features, experiment] = await Promise.all([
        getConversation(conversationId),
        getExperimentCoversationForms(experimentId),
        getExperimentFeatures(experimentId),
        getExperimentById(experimentId), // fetch full experiment
      ]);

      // Fetch full agent objects for multiAgents
      const multiAgentsWithData: MultiAgentWithData[] = await Promise.all(
        (experiment.multiAgents || []).map(async (ma) => {
          const agentObj = await getAgentById(ma.agent);
          return { agent: agentObj, dist: ma.dist };
        })
      );

      if (!alreadyAnswered && forms.preConversation) {
        setIsSurveyOpen(true);
      }

      setConversationForms(forms);
      setExperimentFeatures(features);
      setMultiAgents(multiAgentsWithData);

      console.log(
        "MultiAgents loaded from experiment:",
        experiment.multiAgents
      );

      setMessages(conversation.length ? conversation : []);
      setIsPageLoading(false);
    } catch (err) {
      openSnackbar("Failed to load conversation", SnackbarStatus.ERROR);
      navigate(-1);
    }
  }, [conversationId, experimentId]);

  // Get active user ID from Redux or fallback to localStorage
  const userId =
    useAppSelector((state) => state.activeUser?._id) ||
    localStorage.getItem("userId");

  // Assigned agent comes from Redux (set after survey submission)
  const assignedAgent = useAppSelector((state) => state.assignedAgent);

  const handlePreConversationSurveyDone = async (scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }) => {
    const preConversationFormAnsweredKey = `preConversationFormAnswered-${conversationId}`;

    try {
      if (!userId) throw new Error("No active user ID found.");
      if (!multiAgents || multiAgents.length === 0) {
        throw new Error("Experiment does not use multiAgents.");
      }

      // Select a random agent from multiAgents
      const assigned =
        multiAgents[Math.floor(Math.random() * multiAgents.length)];
      const assignedAgent = assigned.agent;

      // DEBUG logs
      console.log("Assigned agent received:", assignedAgent);
      console.log("Personality strategy:", assignedAgent.personalityStrategy);

      const strategy = assignedAgent.personalityStrategy || "none";

      // Prepare payload for backend
      const payload = {
        userId,
        experimentId,
        assignedAgentId: assignedAgent._id,
        ...scores,
      };

      console.log("📦 Submitting personality scores:", payload);
      await submitPersonalityScores(payload);

      console.log("Assigned agent received:", assignedAgent);
      console.log("Personality strategy:", assignedAgent.personalityStrategy);
      console.log(
        "Base systemStarterPrompt:",
        assignedAgent.systemStarterPrompt
      );

      // Build final agent based on strategy
      let finalAgent: AgentType;
      if (strategy === "mirroring" || strategy === "complementing") {
        finalAgent = await createAgentFromPersonality(
          assignedAgent,
          scores,
          strategy
        );
        console.log("🧠 Final personalized agent:", finalAgent);
        console.log(
          "Final agent systemStarterPrompt:",
          finalAgent.systemStarterPrompt
        );
      } else {
        finalAgent = assignedAgent;
        console.log("🧊 Baseline agent (no traits injected):", finalAgent);
        console.log(
          "Baseline systemStarterPrompt:",
          finalAgent.systemStarterPrompt
        );
      }

      console.log("Dispatching final assigned agent to Redux:", finalAgent);

      // Dispatch final agent and close survey
      dispatch(setAssignedAgent(finalAgent));
      sessionStorage.setItem(preConversationFormAnsweredKey, "true");
      setIsSurveyOpen(false);
    } catch (error) {
      console.error("🔥 Error in handlePreConversationSurveyDone:", error);
      openSnackbar("Failed to submit personality scores", SnackbarStatus.ERROR);
    }
  };

  const handleUpdateUserAnnotation = async (
    messageId: string,
    userAnnotation: UserAnnotation
  ) => {
    try {
      await updateUserAnnotation(messageId, userAnnotation);
      setMessages(
        messages.map((message) =>
          message._id === messageId ? { ...message, userAnnotation } : message
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  return isPageLoading ? (
    <LoadingPage />
  ) : (
    <MainContainer container>
      {!isMobile && (
        <Grid
          item
          xs={2}
          sm={2}
          md={2}
          lg={2}
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <SidebarChat
            setIsOpen={setIsFinishDialogOpen}
            setMessageFontSize={setMessageFontSize}
            messageFontSize={messageFontSize}
          />
        </Grid>
      )}
      <Grid item xs={12} sm={10} md={10} lg={10}>
        <SectionContainer>
          <SectionInnerContainer container direction="column">
            <MessageListContainer ref={messagesRef} item>
              <MessageList
                isMobile={isMobile}
                messages={messages}
                isMessageLoading={isMessageLoading}
                size={messageFontSize}
                handleUpdateUserAnnotation={handleUpdateUserAnnotation}
                experimentHasUserAnnotation={experimentFeatures?.userAnnotation}
              />
            </MessageListContainer>
            <Grid item display={"flex"} justifyContent={"center"}>
              <InputBox
                isMobile={isMobile}
                messages={messages}
                setMessages={setMessages}
                conversationId={conversationId}
                setIsMessageLoading={setIsMessageLoading}
                fontSize={messageFontSize}
                isStreamMessage={experimentFeatures?.streamMessage}
                agent={assignedAgent}
                userId={userId}
              />
            </Grid>
          </SectionInnerContainer>
        </SectionContainer>
      </Grid>

      {/* Post-conversation survey modal */}
      {isFinishDialogOpen && (
        <FinishConversationDialog
          open={isFinishDialogOpen}
          setIsOpen={setIsFinishDialogOpen}
          questionnaireLink={
            "https://docs.google.com/forms/u/0/?tgif=d&ec=asw-forms-hero-goto"
          }
          form={conversationForms.postConversation}
        />
      )}

      {/* Pre-conversation personality survey modal */}
      <Dialog
        open={surveyOpen}
        maxWidth={"lg"}
        fullScreen={isMobile}
        PaperProps={{
          style: {
            maxHeight: isMobile ? "none" : "70vh",
            overflow: "auto",
          },
        }}
      >
        <ConversationForm
          form={conversationForms.preConversation}
          isPreConversation={true}
          handleDone={handlePreConversationSurveyDone}
        />
      </Dialog>
    </MainContainer>
  );
};

export default ChatPage;
