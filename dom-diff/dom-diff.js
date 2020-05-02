const patch = new Map
    .set("remove", 0)
    .set("replace", 0)
    .set("text", 0)
    .set("props", 0)
    .set("insert", 0)
    .set("reorder", 0)

function diff(oldNode, newOld) {
    let index = 0;
    const patch = {};
    dftWalk(oldNode, newOld, index, patches);
    return patch;
}