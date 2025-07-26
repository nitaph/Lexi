import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AgentType } from "@models/AppModels";

const assignedAgentSlice = createSlice({
  name: "assignedAgent",
  initialState: null as AgentType | null,
  reducers: {
    setAssignedAgent: (state, action: PayloadAction<AgentType>) => {
      console.log("Redux: setAssignedAgent called with:", action.payload);
      console.log(
        "Redux: Assigned agent systemStarterPrompt:",
        action.payload.systemStarterPrompt
      );
      return action.payload;
    },
    clearAssignedAgent: () => {
      console.log("Redux: clearAssignedAgent called");
      return null;
    },
  },
});

export const { setAssignedAgent, clearAssignedAgent } =
  assignedAgentSlice.actions;
export default assignedAgentSlice.reducer;
