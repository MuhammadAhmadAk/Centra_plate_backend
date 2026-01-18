const reportModel = require('../models/reportModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { Parser } = require('json2csv');

// Helper function to convert data to CSV
const convertToCSV = (data, fields) => {
    try {
        const parser = new Parser({ fields });
        return parser.parse(data);
    } catch (err) {
        throw new Error('Error converting to CSV: ' + err.message);
    }
};

// Export users
const exportUsers = async (req, res) => {
    try {
        const { format = 'csv', filters = {}, fields = [] } = req.body;

        const data = await reportModel.exportUsers(filters, fields);

        if (format === 'csv') {
            const csv = convertToCSV(data, fields.length > 0 ? fields : Object.keys(data[0] || {}));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="users_export_${Date.now()}.csv"`);
            return res.send(csv);
        }

        // For JSON format or if CSV fails
        return sendSuccess(res, 200, 'Users data exported successfully', data);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error exporting users', err);
    }
};

// Export vehicles
const exportVehicles = async (req, res) => {
    try {
        const { format = 'csv', filters = {}, fields = [] } = req.body;

        const data = await reportModel.exportVehicles(filters, fields);

        if (format === 'csv') {
            const csv = convertToCSV(data, fields.length > 0 ? fields : Object.keys(data[0] || {}));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="vehicles_export_${Date.now()}.csv"`);
            return res.send(csv);
        }

        return sendSuccess(res, 200, 'Vehicles data exported successfully', data);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error exporting vehicles', err);
    }
};

// Export search logs
const exportSearchLogs = async (req, res) => {
    try {
        const { format = 'csv', filters = {}, fields = [] } = req.body;

        const data = await reportModel.exportSearchLogs(filters, fields);

        if (format === 'csv') {
            const csv = convertToCSV(data, fields.length > 0 ? fields : Object.keys(data[0] || {}));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="logs_export_${Date.now()}.csv"`);
            return res.send(csv);
        }

        return sendSuccess(res, 200, 'Search logs data exported successfully', data);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error exporting search logs', err);
    }
};

module.exports = {
    exportUsers,
    exportVehicles,
    exportSearchLogs
};
