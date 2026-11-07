export const STAGE_PATH = {
  individual: "/",
  equipo: "/team_differences",
  doble: "/double_counts",
  gerente: "/manager_counts",
};

export const INVENTORY_STAGES = [
  {
    id: "individual",
    label: "Individual",
    detail: "Los registros nuevos quedan como individual. Mis registros de inventario se ve azul, o verde si alguien cuenta para otra persona. Las demás vistas de inventario quedan desactivadas.",
    confirm: "Los registros nuevos van a decir individual. Solo se podrá entrar a Mis registros de inventario, en azul o en verde según la asignación.",
  },
  {
    id: "equipo",
    label: "Diferencias en equipo",
    detail: "Los registros nuevos quedan como equipo. Antes, cada persona vuelve a contar para sí misma. Mis registros de inventario y Asignados y Contadores quedan desactivados. Se abre Diferencias en equipo, en rojo. Esa vista sigue mostrando las diferencias de los conteos individuales. En el drawer solo se agregan y se borran los conteos de equipo.",
    confirm: "Primero cada persona vuelve a contar para sí misma. Los conteos individuales se quedan. Los registros nuevos van a decir equipo y solo se podrá entrar a Diferencias en equipo, en rojo.",
  },
  {
    id: "doble",
    label: "Doble",
    detail: "Los registros nuevos quedan como doble. Antes, cada persona vuelve a contar para sí misma. Se abre Conteos dobles, en blanco y negro, y Asignados y Contadores queda desactivado.",
    confirm: "Primero cada persona vuelve a contar para sí misma. Los registros nuevos van a decir doble. Asignados y Contadores queda desactivado y solo se podrá entrar a Conteos dobles, en blanco y negro.",
  },
  {
    id: "gerente",
    label: "Gerente",
    detail: "Los registros nuevos quedan como gerente. Antes, cada persona vuelve a contar para sí misma. Se abre Conteos gerentes, en blanco y negro, y Asignados y Contadores queda desactivado.",
    confirm: "Primero cada persona vuelve a contar para sí misma. Los registros nuevos van a decir gerente. Asignados y Contadores queda desactivado y solo se podrá entrar a Conteos gerentes, en blanco y negro.",
  },
];

export function stageById(id) {
  return INVENTORY_STAGES.find((item) => item.id === id) || INVENTORY_STAGES[0];
}

export function stageTone(stage) {
  if (stage === "equipo") return "difference";
  if (stage === "doble" || stage === "gerente") return "mono";
  return "primary";
}
