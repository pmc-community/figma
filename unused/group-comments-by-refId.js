const buildHierarchy = (items) => {
    // Group items by refId
    const groupedByRef = _.groupBy(items, "refId");

    // Find root node for a given item, avoiding infinite loops
    const findRoot = (item, visited = new Set()) => {
        let current = item;
        while (current && current.id !== current.refId && !visited.has(current.id)) {
            visited.add(current.id);
            current = items.find(i => i.id === current.refId);
        }
        return current;
    };

    // Build hierarchy recursively with date sorting
    const buildTree = (parentId, visitedIds = new Set()) => {
        // Avoid infinite loops by ensuring we don't process the same item again
        if (visitedIds.has(parentId)) return [];
        visitedIds.add(parentId);

        return _(groupedByRef[parentId] || [])
            .orderBy(["date"], ["desc"])
            .map(item => ({
                ...item,
                root: findRoot(item, visitedIds),
                children: buildTree(item.id, visitedIds) // Pass visitedIds to avoid infinite loops
            }))
            .value();
    };

    // Construct result object, ensuring root nodes without children are included
    const hierarchy = {};
    items.forEach(item => {
        if (!hierarchy[item.id]) {
            // Ensure uniqueness by using uniqBy to remove duplicates based on `id`
            hierarchy[item.id] = _.uniqBy([item, ...buildTree(item.id)], 'id');
        }
    });

    return { hierarchy };
};
