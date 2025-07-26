import { Request, Response } from "express";
import { dataAggregationService } from "../services/dataAggregation.service";
import { requestHandler } from "../utils/requestHandler";

class DataAggregationController {
  // JSON version
  getExperimentData = requestHandler(async (req: Request, res: Response) => {
    const experimentId = req.query.experimentId as string;
    const data = await dataAggregationService.getExperimentData(experimentId);
    res.status(200).json({ data });
  });

  // Excel download
  getExperimentExcel = requestHandler(async (req: Request, res: Response) => {
    const experimentId = req.query.experimentId as string;
    const workbook =
      await dataAggregationService.createExperimentDataExcel(experimentId);
    res
      .status(200)
      .setHeader(
        "Content-Disposition",
        `attachment; filename="experiment-${experimentId}.xlsx"`
      )
      .setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    await workbook.xlsx.write(res);
    res.end();
  });
}

export const dataAggregationController = new DataAggregationController();
