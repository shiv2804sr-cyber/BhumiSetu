import { Router } from "express";
import authRouter from "./auth";
import projectsRouter from "./projects";
import parcelsRouter from "./parcels";
import compensationRouter from "./compensation";
import rnrRouter from "./rnr";
import documentsRouter from "./documents";
import awardsRouter from "./awards";
import grievancesRouter from "./grievances";
import alertsRouter from "./alerts";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";
import workflowsRouter from "./workflows";
import auditRouter from "./audit";
import integrationsRouter from "./integrations";

const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/projects", projectsRouter);
apiV1Router.use("/parcels", parcelsRouter);
apiV1Router.use("/compensation", compensationRouter);
apiV1Router.use("/rnr", rnrRouter);
apiV1Router.use("/documents", documentsRouter);
apiV1Router.use("/awards", awardsRouter);
apiV1Router.use("/grievances", grievancesRouter);
apiV1Router.use("/alerts", alertsRouter);
apiV1Router.use("/dashboard", dashboardRouter);
apiV1Router.use("/reports", reportsRouter);
apiV1Router.use("/workflows", workflowsRouter);
apiV1Router.use("/audit", auditRouter);
apiV1Router.use("/integrations", integrationsRouter);

export default apiV1Router;
