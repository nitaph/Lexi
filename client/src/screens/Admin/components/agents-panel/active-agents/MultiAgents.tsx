import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AgentType } from '@models/AppModels';
import {
    Box,
    Button,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    Typography,
    TextField,
} from '@mui/material';
import { Controller, FieldErrors, useFieldArray } from 'react-hook-form';
import { getFormErrorMessage } from '../../../../../utils/commonFunctions';

interface MultiAgentsFormData {
    multiAgents: { agent: string; dist: number }[];
}

interface MultiAgentsProps {
    agents: AgentType[];
    control: any;
    register: any;
    watch: any;
    errors: FieldErrors<MultiAgentsFormData>;
}

const MultiAgents: React.FC<MultiAgentsProps> = ({ agents, control, register, watch, errors }) => {
    const { fields, append, remove } = useFieldArray<{
        multiAgents: { agent: string; dist: number }[];
    }>({
        control,
        name: 'multiAgents',
    });

    const total = watch('multiAgents')?.reduce((sum, item) => sum + Number(item.dist || 0), 0) || 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {fields.map((field, index) => (
                <FormControl
                    key={field.id}
                    margin="dense"
                    size="small"
                    sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}
                >
                    <Typography>{`Agent ${index + 1}:`}</Typography>
                    <Controller
                        name={`multiAgents.${index}.agent`}
                        control={control}
                        defaultValue={field.agent || (agents[0]?._id || '')}
                        rules={{ required: 'Agent is required.' }}
                        render={({ field }) => (
                            <Select {...field} size="small" style={{ minWidth: '100px' }}>
                                {agents.map((agent) => (
                                    <MenuItem key={agent._id} value={agent._id}>
                                        {agent.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                    {errors.multiAgents?.[index]?.agent && (
                        <Typography color="error">
                            {getFormErrorMessage(errors.multiAgents[index].agent)}
                        </Typography>
                    )}
                    <TextField
                        type="number"
                        size="small"
                        sx={{ width: '60px' }}
                        defaultValue={field.dist || 0}
                        {...register(`multiAgents.${index}.dist`, { required: 'Distribution is required.' })}
                    />
                    {fields.length > 1 && (
                        <IconButton onClick={() => remove(index)} size="small">
                            <DeleteIcon />
                        </IconButton>
                    )}
                </FormControl>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => append({ agent: agents[0]?._id || '', dist: 0 })}
                    startIcon={<AddIcon />}
                >
                    Add Agent
                </Button>
                <Typography color={total === 100 ? 'inherit' : 'error'}>{`Total: ${total}%`}</Typography>
            </Box>
            {total !== 100 && (
                <Typography color="error">Total distribution must equal 100%</Typography>
            )}
        </Box>
    );
};

export default MultiAgents;
