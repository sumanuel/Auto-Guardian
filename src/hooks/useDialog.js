import { useCallback, useState } from "react";

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
    // Convertir el formato antiguo al nuevo formato de botones
    const config = { ...dialogConfig };

    if (config.onConfirm && config.confirmText) {
      config.buttons = [
        {
          text: config.cancelText || "Cancelar",
          style: "cancel",
          onPress: config.onCancel || (() => {}),
        },
        {
          text: config.confirmText,
          style: "destructive",
          onPress: config.onConfirm,
        },
      ];
      delete config.onConfirm;
      delete config.confirmText;
      delete config.onCancel;
      delete config.cancelText;
    } else if (!config.buttons) {
      config.buttons = [{ text: "OK", onPress: () => {} }];
    }

    setConfig(config);
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
