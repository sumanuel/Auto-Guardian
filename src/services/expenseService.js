import db from "./database";

// Obtener todos los gastos de un vehículo
export const getExpensesByVehicle = (vehicleId) => {
  try {
    const expenses = db.getAllSync(
      "SELECT * FROM expenses WHERE vehicleId = ? ORDER BY date DESC",
      [vehicleId]
    );
    return expenses;
  } catch (error) {
    console.error("Error obteniendo gastos:", error);
    return [];
  }
};

// Obtener todos los gastos
export const getAllExpenses = () => {
  try {
    const expenses = db.getAllSync("SELECT * FROM expenses ORDER BY date DESC");
    return expenses;
  } catch (error) {
    console.error("Error obteniendo todos los gastos:", error);
    return [];
  }
};

// Crear nuevo gasto
export const createExpense = (expenseData) => {
  try {
    const result = db.runSync(
      `INSERT INTO expenses (vehicleId, description, category, date, cost, notes, photo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        expenseData.vehicleId,
        expenseData.description,
        expenseData.category || null,
        expenseData.date,
        expenseData.cost,
        expenseData.notes || null,
        expenseData.photo || null,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error creando gasto:", error);
    throw error;
  }
};

// Actualizar gasto
export const updateExpense = (id, expenseData) => {
  try {
    db.runSync(
      `UPDATE expenses 
       SET description = ?, category = ?, date = ?, cost = ?, notes = ?, photo = ?
       WHERE id = ?`,
      [
        expenseData.description,
        expenseData.category || null,
        expenseData.date,
        expenseData.cost,
        expenseData.notes || null,
        expenseData.photo || null,
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error("Error actualizando gasto:", error);
    throw error;
  }
};

// Eliminar gasto
export const deleteExpense = (id) => {
  try {
    db.runSync("DELETE FROM expenses WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error eliminando gasto:", error);
    throw error;
  }
};

// Obtener gasto por ID
export const getExpenseById = (id) => {
  try {
    const expense = db.getFirstSync("SELECT * FROM expenses WHERE id = ?", [
      id,
    ]);
    return expense;
  } catch (error) {
    console.error("Error obteniendo gasto por ID:", error);
    return null;
  }
};

// Obtener total de gastos por vehículo
export const getTotalExpensesByVehicle = (vehicleId) => {
  try {
    const result = db.getFirstSync(
      "SELECT SUM(cost) as total FROM expenses WHERE vehicleId = ?",
      [vehicleId]
    );
    return result?.total || 0;
  } catch (error) {
    console.error("Error obteniendo total de gastos:", error);
    return 0;
  }
};

// Obtener gastos agrupados por categoría
export const getExpensesByCategory = (vehicleId) => {
  try {
    const expenses = db.getAllSync(
      `SELECT category, SUM(cost) as total, COUNT(*) as count 
       FROM expenses 
       WHERE vehicleId = ? 
       GROUP BY category 
       ORDER BY total DESC`,
      [vehicleId]
    );
    return expenses;
  } catch (error) {
    console.error("Error obteniendo gastos por categoría:", error);
    return [];
  }
};
