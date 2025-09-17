"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiResponse = isApiResponse;
exports.isPaginatedResponse = isPaginatedResponse;
exports.isUserEvent = isUserEvent;
exports.isSystemEvent = isSystemEvent;
exports.toApiResponse = toApiResponse;
exports.toPaginatedResponse = toPaginatedResponse;
exports.mergeObjects = mergeObjects;
exports.deepMerge = deepMerge;
exports.groupBy = groupBy;
exports.uniqueBy = uniqueBy;
exports.sortBy = sortBy;
function isApiResponse(obj) {
    return obj && typeof obj === 'object' && 'success' in obj && 'timestamp' in obj;
}
function isPaginatedResponse(obj) {
    return isApiResponse(obj) && 'pagination' in obj;
}
function isUserEvent(obj) {
    return obj && typeof obj === 'object' && 'type' in obj && obj.type.startsWith('user.');
}
function isSystemEvent(obj) {
    return obj && typeof obj === 'object' && 'type' in obj && obj.type.startsWith('system.');
}
function toApiResponse(data, success = true) {
    return {
        success,
        data: success ? data : undefined,
        error: success ? undefined : data?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
    };
}
function toPaginatedResponse(data, pagination, total) {
    const totalPages = Math.ceil(total / pagination.limit);
    return {
        ...toApiResponse(data),
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages,
            hasNext: pagination.page < totalPages,
            hasPrev: pagination.page > 1
        }
    };
}
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function mergeObjects(target, source) {
    return { ...target, ...source };
}
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' &&
                source[key] !== null &&
                !Array.isArray(source[key]) &&
                typeof target[key] === 'object' &&
                target[key] !== null &&
                !Array.isArray(target[key])) {
                result[key] = deepMerge(target[key], source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
    }
    return result;
}
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}
function uniqueBy(array, key) {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}
function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal)
            return order === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return order === 'asc' ? 1 : -1;
        return 0;
    });
}
exports.default = {
    toApiResponse,
    toPaginatedResponse,
    mergeObjects,
    deepMerge,
    groupBy,
    uniqueBy,
    sortBy,
    isApiResponse,
    isPaginatedResponse,
    isUserEvent,
    isSystemEvent
};
//# sourceMappingURL=advancedTypes.js.map