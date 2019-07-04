function distance(p, q) {
    const dx = p.x - q.x;
    const dy = p.y - q.y;
    return Math.sqrt(dx*dx + dy*dy);
}

module.exports = {
    distance
};
