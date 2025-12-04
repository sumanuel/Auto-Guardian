import { useState, useCallback } from "react";

/**
 * Hook para usar el CustomDialog
 *
 * Uso:
 * const { DialogComponent, showDialog } = useDialog();
 *
 * showDialog({
 *   title: "Éxito",
 *   message: "Operación completada",
 *   type: "success"
 * });
 */

export const useDialog = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(null);

  const showDialog = useCallback((dialogConfig) => {
    setConfig(dialogConfig);
    setVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
    setTimeout(() => setConfig(null), 300); // Limpiar después de la animación
  }, []);

  const DialogComponent = ({ children }) => {
    const CustomDialog = require("../components/common/CustomDialog").default;
    return (
      <>
        {children}
        <CustomDialog visible={visible} onClose={hideDialog} config={config} />
      </>
    );
  };

  return { DialogComponent, showDialog, hideDialog };
};
