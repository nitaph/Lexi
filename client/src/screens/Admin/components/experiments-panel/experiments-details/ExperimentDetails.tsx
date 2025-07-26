import { AgentLeanType, AgentsModes, ExperimentType } from "@models/AppModels";
import { Box, CircularProgress, Grid, Link } from "@mui/material";
import React, { useState } from "react";
import { getAgentLean } from "../../../../../DAL/server-requests/agents";
import {
  SnackbarStatus,
  useSnackbar,
} from "../../../../../contexts/SnackbarProvider";
import useEffectAsync from "../../../../../hooks/useEffectAsync";
import {
  AdressContainer,
  GridContainerStyled,
  GridItemStyled,
  TypographyStyled,
} from "./ExperimentsDetails.s";

interface ExperimentDetailsProps {
  row: ExperimentType;
  experimentAgentDetails: {
    activeAgent: AgentLeanType | null;
    multiAgents: AgentLeanType[] | null;
  };
  setExperimentAgentDetails: (experimentAgentDetails: {
    activeAgent: AgentLeanType | null;
    multiAgents: AgentLeanType[] | null;
  }) => void;
}

export const ExperimentDetails: React.FC<ExperimentDetailsProps> = ({
  row,
  experimentAgentDetails,
  setExperimentAgentDetails,
}) => {
  const { openSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(!experimentAgentDetails);

  useEffectAsync(async () => {
    setIsLoading(true);
    try {
      if (row.agentsMode === AgentsModes.SINGLE) {
        if (!row.activeAgent) {
          console.warn("No activeAgent ID found for experiment:", row._id);
          return;
        }
        const agent = await getAgentLean(row.activeAgent);
        setExperimentAgentDetails({ activeAgent: agent, multiAgents: null });
      } else if (row.agentsMode === AgentsModes.MULTI) {
        if (!row.multiAgents || row.multiAgents.length === 0) {
          console.warn("Missing multiAgents for experiment:", row._id);
          return;
        }

        const agents = await Promise.all(
          row.multiAgents.map((entry) => getAgentLean(entry.agent))
        );

        setExperimentAgentDetails({
          activeAgent: null,
          multiAgents: agents,
        });
      }
    } catch (error) {
      openSnackbar("Failed to fetch agent details", SnackbarStatus.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [row]);

  if (isLoading) {
    return (
      <Box
        display={"flex"}
        justifyContent={"center"}
        width={"100%"}
        padding={2}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (
    row.agentsMode === AgentsModes.MULTI &&
    (!row.multiAgents || row.multiAgents.length === 0)
  ) {
    return (
      <TypographyStyled color="error">
        Error: Missing agent distribution data.
      </TypographyStyled>
    );
  }

  return (
    <Box>
      <GridContainerStyled
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <Grid item>
          <TypographyStyled variant="subtitle1" color="textSecondary">
            Mode: <strong>{row.agentsMode}</strong>
          </TypographyStyled>
        </Grid>

        {row.agentsMode === AgentsModes.SINGLE ? (
          <Grid item>
            <TypographyStyled variant="subtitle1" color="textSecondary">
              Active Agent:{" "}
              <strong>
                {experimentAgentDetails?.activeAgent?.title ?? "N/A"}
              </strong>
            </TypographyStyled>
          </Grid>
        ) : (
          <GridItemStyled item>
            {row.multiAgents?.map((entry, index) => {
              const agentTitle =
                experimentAgentDetails?.multiAgents?.[index]?.title ?? "N/A";
              return (
                <Grid item key={entry.agent}>
                  <TypographyStyled variant="subtitle1" color="textSecondary">
                    Agent {String.fromCharCode(65 + index)}:{" "}
                    <strong>
                      {agentTitle} ({entry.dist ?? 0}%)
                    </strong>
                  </TypographyStyled>
                </Grid>
              );
            })}
          </GridItemStyled>
        )}
      </GridContainerStyled>

      <AdressContainer>
        <TypographyStyled variant="subtitle1" color="textSecondary">
          Experiment Address:
          <Link
            href={`${
              process.env.REACT_APP_FRONTEND_URL
            }/e/${row._id.toString()}`}
            target="_blank"
            rel="noopener"
          >
            <strong>
              {" "}
              {`${process.env.REACT_APP_FRONTEND_URL}/e/${row._id.toString()}`}
            </strong>
          </Link>
        </TypographyStyled>
      </AdressContainer>
    </Box>
  );
};
