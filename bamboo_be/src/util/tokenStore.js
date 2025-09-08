///-------------Lưu trong bộ nhớ (dev)-----------------------

const validRefreshTokens = new Set();

function storeRefreshToken(token) {
    validRefreshTokens.add(token);
}

function revokeRefreshToken(token) {
    validRefreshTokens.delete(token);
}

function hasRefreshToken(token) {
    return validRefreshTokens.has(token);
}

module.exports = {
    storeRefreshToken,
    revokeRefreshToken,
    hasRefreshToken,
};
