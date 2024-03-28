import express from 'express';
import * as adminReportController from '../controllers/admin.report.controller'
const router = express.Router();

router.get('/revenu', adminReportController.getChart);
router.post('/revenu', adminReportController.postChart)

export default router;
