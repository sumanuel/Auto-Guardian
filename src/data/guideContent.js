// Textos de la guía de primeros pasos y del centro de ayuda

export const GUIDE_STEPS = {
  vehicle: {
    icon: "car-outline",
    title: "Registra tu vehículo",
    text: "Agrega marca, modelo, año y el kilometraje actual. Con esos datos la app calcula cuándo toca cada mantenimiento. Puedes registrar todos los vehículos que quieras y ponerles una foto.",
    action: "Agregar vehículo",
  },
  schedule: {
    icon: "calendar-outline",
    title: "Programa un mantenimiento",
    text: "Elige el tipo (cambio de aceite, frenos, llantas…) y define cuándo toca: por fecha, por kilometraje o ambos. Te avisamos 3 días antes y el mismo día del vencimiento.",
    action: "Programar mantenimiento",
  },
  complete: {
    icon: "checkmark-circle-outline",
    title: "Marca un mantenimiento como realizado",
    text: "En el Historial, abre la pestaña Programados y toca el check de un mantenimiento cuando lo hagas. Puedes dejar programado el siguiente con un solo toque y, con el lápiz, anotar cuánto costó.",
    action: "Ir al historial",
  },
  spending: {
    icon: "cash-outline",
    title: "Registra un gasto o una reparación",
    text: "Combustible, peajes, lavado o una visita al taller. Puedes detallar ítem por ítem con cantidad y costo unitario, y la app suma el total por ti.",
    action: "Agregar gasto",
  },
  documents: {
    icon: "document-text-outline",
    title: "Guarda un documento",
    text: "Seguro, licencia, revisión técnica… Registra su fecha de vencimiento y la app te avisa antes de que caduque.",
    action: "Agregar documento",
  },
  stats: {
    icon: "stats-chart-outline",
    title: "Revisa tu inversión",
    text: "En la pestaña MRO ves cuánto has gastado en mantenimientos, reparaciones y otros gastos, por vehículo y filtrando por fechas.",
    action: "Ver inversión",
  },
};

export const HELP_TOPICS = [
  {
    title: "Vehículos",
    body: [
      "Desde Inicio toca «Nuevo» para agregar un vehículo. Puedes editarlo o eliminarlo desde su detalle.",
      "Mantén actualizado el kilometraje: toca «Actualizar kilometraje» en el detalle del vehículo. Las alertas por kilometraje dependen de ese dato.",
      "Si eliminas un vehículo también se eliminan sus mantenimientos, gastos, reparaciones y documentos. La app te pide confirmación antes.",
    ],
  },
  {
    title: "Programar mantenimientos",
    body: [
      "En el detalle del vehículo toca «Programar mantenimiento». Elige un tipo sugerido o escribe uno propio.",
      "Puedes controlar el mantenimiento por fecha, por kilometraje o por ambos. Por fecha, defines cada cuántos días o meses se repite.",
      "En los textos verás «Faltan 5 días» cuando está por llegar, «Es hoy» el día indicado y «Debió hacerse hace 3 días» cuando ya se pasó. Por kilometraje verás «Faltan 1.500 km» o «Te pasaste por 500 km».",
    ],
  },
  {
    title: "Historial: programados y realizados",
    body: [
      "El Historial tiene dos pestañas: Programados (pendientes) y Realizados.",
      "Cada mantenimiento programado tiene tres botones: editar (lápiz), marcar como realizado (check) y eliminar (papelera).",
      "Al tocar el check te pregunta si quieres programar el próximo mantenimiento; si lo marcas, se calcula con los mismos días o kilómetros. Para anotar el costo, edita el mantenimiento con el lápiz.",
    ],
  },
  {
    title: "Alertas y notificaciones",
    body: [
      "La campana de Inicio resume los mantenimientos vencidos, los urgentes y los documentos por vencer. Tócala para ver el detalle.",
      "Recibes un recordatorio 3 días antes de cada mantenimiento por fecha y otro el mismo día, a las 9:00 a. m.",
      "En Más > Configuración > Notificaciones administras los avisos. Si no te llegan, revisa que la app tenga permiso de notificaciones en los ajustes del teléfono.",
    ],
  },
  {
    title: "Reparaciones y gastos",
    body: [
      "En la pestaña MRO abre un vehículo y usa el botón + para agregar una reparación (con taller) o un gasto («Otros»).",
      "«Detalle por ítems»: agrega cada ítem con nombre, cantidad y costo unitario. El subtotal es cantidad × costo y el total se calcula solo; cuando hay ítems, el costo no se escribe a mano.",
      "Para corregir un registro toca el lápiz de su tarjeta; para borrarlo, la papelera. Los cambios actualizan el total invertido al instante.",
    ],
  },
  {
    title: "Inversión (MRO)",
    body: [
      "MRO muestra el total invertido por vehículo y cuántos mantenimientos, reparaciones y otros gastos tiene cada uno.",
      "Al abrir un vehículo ves el desglose por categoría y las listas de cada tipo. Con «Filtrar fechas» analizas solo un período.",
      "Los mantenimientos cuentan en la inversión cuando están realizados y tienen costo; si no aparece, edítalo y escribe cuánto costó.",
    ],
  },
  {
    title: "Documentos",
    body: [
      "En la pestaña Documentos guarda los papeles de cada vehículo con su fecha de vencimiento: seguro, licencia, revisión técnica, etc.",
      "Los tipos de documento se administran en Más > Configuración > Tipos de documentos, donde puedes crear los tuyos.",
      "Los documentos por vencer aparecen en las alertas de Inicio.",
    ],
  },
  {
    title: "Tipos de mantenimiento",
    body: [
      "En Más > Configuración > Tipos de mantenimientos puedes crear, editar y reordenar los tipos. Mantén presionado un tipo y arrástralo para cambiar su orden.",
      "Un tipo que ya está en uso no se puede eliminar.",
    ],
  },
  {
    title: "Moneda y decimales",
    body: [
      "En Más > Configuración > Moneda eliges el símbolo ($ o €) y cuántos decimales usar en los montos (de 0 a 3). Algunos países, como Portugal, usan 3.",
      "Esto cambia solo cómo se muestran y calculan los montos; los valores ya guardados no se modifican.",
    ],
  },
  {
    title: "Respaldo de tus datos",
    body: [
      "En Más > Configuración > Gestión de datos puedes exportar un respaldo con todos tus vehículos, mantenimientos, gastos, reparaciones, documentos y fotos de los vehículos.",
      "La app también crea un respaldo automático cada semana y conserva los últimos 5.",
      "Para pasar tus datos a otro teléfono, exporta el respaldo, guárdalo en Drive o envíalo por correo, y usa «Importar datos» en el teléfono nuevo. Importar reemplaza los datos actuales.",
    ],
  },
  {
    title: "Bloqueo con huella o PIN",
    body: [
      "En Más > Configuración activa «Bloqueo con huella o PIN» para pedir la identificación del teléfono al abrir la app.",
      "Se vuelve a pedir si sales de la app más de un minuto. Debes tener una huella o un PIN configurado en el teléfono.",
    ],
  },
  {
    title: "Tips y guías",
    body: [
      "En Más > Tips & Guías encuentras consejos de cuidado, recomendaciones por tipo de mantenimiento y explicaciones sobre los componentes de tu auto.",
    ],
  },
];
