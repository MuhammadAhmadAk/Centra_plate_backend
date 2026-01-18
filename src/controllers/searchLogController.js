const searchLogModel = require('../models/searchLogModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get all search logs
const getAllSearchLogs = async (req, res) => {
    try {
        const { page, limit, userId, startDate, endDate, query } = req.query;

        const filters = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            userId: userId ? parseInt(userId) : null,
            startDate,
            endDate,
            query
        };

        const result = await searchLogModel.getAllSearchLogs(filters);
        return sendSuccess(res, 200, 'Search logs retrieved successfully', result);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching search logs', err);
    }
};

// Get single search log
const getSearchLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await searchLogModel.getSearchLogById(id);

        if (!log) {
            return sendError(res, 404, 'Search log not found');
        }

        return sendSuccess(res, 200, 'Search log retrieved successfully', log);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching search log', err);
    }
};

// Delete search log
const deleteSearchLog = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await searchLogModel.deleteSearchLog(id);

        if (!deleted) {
            return sendError(res, 404, 'Search log not found');
        }

        return sendSuccess(res, 200, 'Search log deleted successfully', null);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error deleting search log', err);
    }
};

// Get search statistics
const getSearchStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filters = {
            startDate,
            endDate
        };

        const stats = await searchLogModel.getSearchStats(filters);
        return sendSuccess(res, 200, 'Search statistics retrieved successfully', stats);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching statistics', err);
    }
};

module.exports = {
    getAllSearchLogs,
    getSearchLogById,
    deleteSearchLog,
    getSearchStats
};
