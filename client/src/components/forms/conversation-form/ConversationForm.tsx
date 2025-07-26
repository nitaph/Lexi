import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Grid, IconButton, useMediaQuery } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { updateConversationMetadata } from "../../../DAL/server-requests/conversations";
import { submitPersonalityScores } from "@DAL/server-requests/personality";
import { aggregateBigFiveScores } from "@utils/aggregateBigFiveScores";
import theme from "../../../Theme";
import { Pages } from "../../../app/App";
import { useConversationId } from "../../../hooks/useConversationId";
import { useExperimentId } from "../../../hooks/useExperimentId";
import Question from "../../questions/Question";
import { FitButton } from "../CommonFormStyles.s";
import {
  ConversationFormButtonContainer,
  ConversationFormContainer,
  ConversationFormFieldTitle,
  ConversationFormTitle,
} from "./ConversationForm.s";
import { PersonalityScores } from "@utils/PersonalityScores";

interface FinalRegisterFormProps {
  form: any;
  isPreConversation: boolean;
  handleDone: (scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }) => void;
}

// Each key is the question number (1-based), value is { trait, direction }
const scoringMap: Record<
  number,
  { trait: keyof PersonalityScores; reverse: boolean }
> = {
  1: { trait: "extraversion", reverse: false },
  2: { trait: "agreeableness", reverse: true },
  3: { trait: "conscientiousness", reverse: false },
  4: { trait: "neuroticism", reverse: true },
  5: { trait: "openness", reverse: false },
  6: { trait: "extraversion", reverse: true },
  7: { trait: "agreeableness", reverse: false },
  8: { trait: "conscientiousness", reverse: true },
  9: { trait: "neuroticism", reverse: false },
  10: { trait: "openness", reverse: true },
  11: { trait: "extraversion", reverse: false },
  12: { trait: "agreeableness", reverse: true },
  13: { trait: "conscientiousness", reverse: false },
  14: { trait: "neuroticism", reverse: true },
  15: { trait: "openness", reverse: false },
  16: { trait: "extraversion", reverse: true },
  17: { trait: "agreeableness", reverse: false },
  18: { trait: "conscientiousness", reverse: true },
  19: { trait: "neuroticism", reverse: false },
  20: { trait: "openness", reverse: true },
  21: { trait: "extraversion", reverse: false },
  22: { trait: "agreeableness", reverse: true },
  23: { trait: "conscientiousness", reverse: false },
  24: { trait: "neuroticism", reverse: true },
  25: { trait: "openness", reverse: false },
  26: { trait: "extraversion", reverse: true },
  27: { trait: "agreeableness", reverse: false },
  28: { trait: "conscientiousness", reverse: true },
  29: { trait: "neuroticism", reverse: true },
  30: { trait: "openness", reverse: true },
  31: { trait: "extraversion", reverse: false },
  32: { trait: "agreeableness", reverse: true },
  33: { trait: "conscientiousness", reverse: false },
  34: { trait: "neuroticism", reverse: true },
  35: { trait: "openness", reverse: false },
  36: { trait: "extraversion", reverse: true },
  37: { trait: "agreeableness", reverse: false },
  38: { trait: "conscientiousness", reverse: true },
  39: { trait: "neuroticism", reverse: true },
  40: { trait: "openness", reverse: false },
  41: { trait: "extraversion", reverse: false },
  42: { trait: "agreeableness", reverse: false },
  43: { trait: "conscientiousness", reverse: false },
  44: { trait: "neuroticism", reverse: true },
  45: { trait: "openness", reverse: false },
  46: { trait: "extraversion", reverse: true },
  47: { trait: "agreeableness", reverse: false },
  48: { trait: "conscientiousness", reverse: false },
  49: { trait: "neuroticism", reverse: true },
  50: { trait: "openness", reverse: false },
};

export const ConversationForm: React.FC<FinalRegisterFormProps> = ({
  form,
  isPreConversation,
  handleDone,
}) => {
  const conversationId = useConversationId();
  const experimentId = useExperimentId();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData: Record<string, string | number>) => {
    try {
      console.log("📝 Submitted form data:", formData);

      // Convert all values to numbers
      const numericFormData: Record<string, number> = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, Number(value)])
      );

      const traitScores = aggregateBigFiveScores(numericFormData);

      console.log("✅ Big Five trait scores:", traitScores);

      await updateConversationMetadata(
        conversationId,
        formData,
        isPreConversation
      );
      handleDone(traitScores);
    } catch (err) {
      console.error("❌ Failed to process or save survey data:", err);
    }
  };

  return (
    <ConversationFormContainer
      isMobile={isMobile}
      style={{
        paddingLeft: isMobile ? "4px" : "4vw",
        paddingRight: isMobile ? "4px" : "4vw",
      }}
    >
      {isPreConversation && (
        <Box style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            onClick={() =>
              navigate(
                `${Pages.EXPERIMENT.replace(":experimentId", experimentId)}`
              )
            }
          >
            <ArrowBackIcon />
          </IconButton>
          <ConversationFormFieldTitle>Go Back Home</ConversationFormFieldTitle>
        </Box>
      )}
      <ConversationFormTitle variant="h4" gutterBottom style={{ margin: 0 }}>
        {form.title}
      </ConversationFormTitle>
      <ConversationFormTitle
        variant="subtitle1"
        gutterBottom
        style={{ margin: 0, marginBottom: "16px" }}
      >
        {form.instructions}
      </ConversationFormTitle>
      {form &&
        form?.questions.map((question, index) => (
          <Grid item xs={12} key={index}>
            <Question
              type={question.type}
              props={question.props}
              errors={errors}
              register={register}
              getValues={getValues}
              setValue={setValue}
              control={control}
            />
          </Grid>
        ))}

      <ConversationFormButtonContainer>
        <FitButton
          variant="contained"
          color="primary"
          onClick={handleSubmit(onSubmit)}
        >
          Continue
        </FitButton>
      </ConversationFormButtonContainer>
    </ConversationFormContainer>
  );
};
