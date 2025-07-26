import { AgentType } from "@models/AppModels";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Controller,
  FieldErrors,
  FieldValues,
  UseFieldArrayAppend,
  UseFormSetValue,
} from "react-hook-form";
import { getFormErrorMessage } from "../../../../../utils/commonFunctions";
import DeleteIcon from "@mui/icons-material/Delete";

interface MultiAgentsProps {
  agents: AgentType[];
  control: any;
  setValue: UseFormSetValue<FieldValues>;
  errors: FieldErrors<any>;
  fields?: { id: string }[];
  remove?: (index: number) => void;
  append?: UseFieldArrayAppend<any, "multiAgents">;
}

export const MultiAgents: React.FC<MultiAgentsProps> = ({
  agents,
  control,
  setValue,
  errors,
  fields = [],
  remove,
  append,
}) => {
  const handleDistChange = (index: number, value: number) => {
    setValue(`multiAgents.${index}.dist`, value);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {fields.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            mb: 1,
          }}
        >
          <Typography variant="body2">Agent {index + 1}:</Typography>
          <Controller
            name={`multiAgents.${index}.agent`}
            control={control}
            rules={{ required: "Select an agent" }}
            render={({ field }) => (
              <Select
                {...field}
                displayEmpty
                value={field.value ?? ""} // prevents out-of-range value warning
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="" disabled>
                  Select Agent
                </MenuItem>
                {agents.map((agent) => (
                  <MenuItem key={agent._id} value={agent._id}>
                    {agent.title}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors?.multiAgents?.[index]?.agent && (
            <Typography color="error" fontSize="0.8rem">
              {getFormErrorMessage(errors.multiAgents[index].agent)}
            </Typography>
          )}
          <Controller
            name={`multiAgents.${index}.dist`}
            control={control}
            defaultValue={0}
            rules={{ required: "Distribution is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="%"
                size="small"
                sx={{ width: "60px" }}
                onChange={(e) =>
                  handleDistChange(index, Number(e.target.value))
                }
              />
            )}
          />
          {remove && (
            <IconButton
              onClick={() => remove(index)}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ))}
      {append && (
        <Box>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer", mt: 1 }}
            onClick={() => append?.({ agent: "", dist: 0 })}
          >
            + Add Condition
          </Typography>
        </Box>
      )}
    </Box>
  );
};
