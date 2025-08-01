import { AgentLeanType, AgentsModes, ExperimentType } from '@models/AppModels';
import { Box, CircularProgress, Grid, Link } from '@mui/material';
import React, { useState } from 'react';
import { getAgentLean } from '../../../../../DAL/server-requests/agents';
import { SnackbarStatus, useSnackbar } from '../../../../../contexts/SnackbarProvider';
import useEffectAsync from '../../../../../hooks/useEffectAsync';
import { AdressContainer, GridContainerStyled, GridItemStyled, TypographyStyled } from './ExperimentsDetails.s';

interface ExperimentDetailsProps {
    row: ExperimentType;
    experimentAgentDetails: {
        activeAgent: AgentLeanType | null;
        abAgents: { agentA: AgentLeanType; agentB: AgentLeanType } | null;
        multiAgents: { agent: AgentLeanType; dist: number }[] | null;
    };
    setExperimentAgentDetails: (experimentAgentDetails) => void;
}

export const ExperimentDetails: React.FC<ExperimentDetailsProps> = ({
    row,
    experimentAgentDetails,
    setExperimentAgentDetails,
}) => {
    const { openSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(!experimentAgentDetails);

    useEffectAsync(async () => {
        if (
            !experimentAgentDetails ||
            (experimentAgentDetails.activeAgent && experimentAgentDetails.activeAgent._id !== row?.activeAgent) ||
            experimentAgentDetails.abAgents?.agentA?._id !== row?.abAgents?.agentA ||
            experimentAgentDetails.abAgents?.agentB?._id !== row?.abAgents?.agentB ||
            (experimentAgentDetails.multiAgents &&
                JSON.stringify(experimentAgentDetails.multiAgents.map((m) => ({ agent: m.agent._id, dist: m.dist }))) !==
                    JSON.stringify(row?.multiAgents))
        ) {
            setIsLoading(true);
            try {
                if (row.agentsMode === AgentsModes.SINGLE) {
                    const agent = await getAgentLean(row.activeAgent);
                    setExperimentAgentDetails({ activeAgent: agent, abAgents: null, multiAgents: null });
                } else if (row.agentsMode === AgentsModes.AB) {
                    const [agentA, agentB] = await Promise.all([
                        getAgentLean(row.abAgents.agentA),
                        getAgentLean(row.abAgents.agentB),
                    ]);
                    setExperimentAgentDetails({ abAgents: { agentA, agentB }, activeAgent: null, multiAgents: null });
                } else {
                    const agents = await Promise.all(row.multiAgents.map((ma) => getAgentLean(ma.agent)));
                    const mapped = agents.map((agent, idx) => ({ agent, dist: row.multiAgents[idx].dist }));
                    setExperimentAgentDetails({ activeAgent: null, abAgents: null, multiAgents: mapped });
                }
            } catch (error) {
                openSnackbar(
                    `Failed to get ${row.agentsMode === AgentsModes.SINGLE ? 'active agent' : 'agents'}`,
                    SnackbarStatus.ERROR,
                );
            }
            setIsLoading(false);
        }
    }, [row]);

    if (isLoading) {
        return (
            <Box display={'flex'} justifyContent={'center'} width={'100%'} padding={2}>
                <CircularProgress size={32} />;
            </Box>
        );
    }

    return (
        <Box>
            <GridContainerStyled container spacing={2} justifyContent="center" alignItems="center">
                <Grid item>
                    <TypographyStyled variant="subtitle1" color="textSecondary">
                        Mode: <strong>{row.agentsMode}</strong>
                    </TypographyStyled>
                </Grid>
                {row.agentsMode === AgentsModes.SINGLE ? (
                    <Grid item>
                        <TypographyStyled variant="subtitle1" color="textSecondary">
                            Active Agent: <strong>{experimentAgentDetails?.activeAgent?.title}</strong>
                        </TypographyStyled>
                    </Grid>
                ) : row.agentsMode === AgentsModes.AB ? (
                    <GridItemStyled item>
                        <Grid item>
                            <TypographyStyled variant="subtitle1" color="textSecondary">
                                Agent A:
                                <strong>{`${experimentAgentDetails?.abAgents?.agentA.title} (${row.abAgents.distA}%)`}</strong>
                            </TypographyStyled>
                        </Grid>
                        <Grid>
                            <TypographyStyled variant="subtitle1" color="textSecondary">
                                Agent B:
                                <strong>{`${experimentAgentDetails?.abAgents?.agentB.title} (${row.abAgents.distB}%)`}</strong>
                            </TypographyStyled>
                        </Grid>
                    </GridItemStyled>
                ) : (
                    <GridItemStyled item>
                        {experimentAgentDetails?.multiAgents?.map((ma, idx) => (
                            <Grid key={idx} item>
                                <TypographyStyled variant="subtitle1" color="textSecondary">
                                    {ma.agent.title}: <strong>{`${ma.dist}%`}</strong>
                                </TypographyStyled>
                            </Grid>
                        ))}
                    </GridItemStyled>
                )}
            </GridContainerStyled>
            <AdressContainer>
                <TypographyStyled variant="subtitle1" color="textSecondary">
                    Experiment Address:
                    <Link
                        href={`${process.env.REACT_APP_FRONTEND_URL}/e/${row._id.toString()}`}
                        target="_blank"
                        rel="noopener"
                    >
                        <strong> {`${process.env.REACT_APP_FRONTEND_URL}/e/${row._id.toString()}`}</strong>
                    </Link>
                </TypographyStyled>
            </AdressContainer>
        </Box>
    );
};
