import { useState, useCallback } from "react";
import PasswordModal from "../components/PasswordModal";

// Ishlatilishi:
//   const { ask, modal } = usePasswordGuard();
//   ask("Xabar", () => bajariladiganIsh());
//   ... return (<> ... {modal} </>)
export default function usePasswordGuard() {
  const [pending, setPending] = useState(null);

  const close = useCallback(() => setPending(null), []);
  const ask = useCallback((message, action) => setPending({ message, action }), []);

  const modal = pending && (
    <PasswordModal
      message={pending.message}
      onCancel={close}
      onSuccess={() => {
        pending.action();
        close();
      }}
    />
  );

  return { ask, modal };
}
