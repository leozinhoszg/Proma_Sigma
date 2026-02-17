/**
 * Constroi filtro where para isolamento por setor.
 * Admins (isAdmin) nao sao filtrados e veem todos os setores.
 * @param {Object} req - Express request com req.user
 * @returns {Object} - Clausula where do Sequelize, ex: { setor_id: 3 }
 */
function buildSetorFilter(req) {
    if (req.user.isAdmin) {
        return {};
    }
    if (!req.user.setor_id) {
        return { setor_id: null };
    }
    return { setor_id: req.user.setor_id };
}

module.exports = { buildSetorFilter };
