import { useState } from "react";
import type { ActionState } from "../interfaces/actionState.interface";


export function useActionState<T>(
  action: (state: ActionState<T> | undefined, formData: FormData) => Promise<any>,
  initialState: ActionState<T>
) {
  const [state] = useState<ActionState<T>>(initialState); // ya no usamos setState
  const [isPending, setIsPending] = useState(false);

  const submitAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsPending(true);
    try {
      await action(state, formData);
    } finally {
      setIsPending(false);
    }
  };

  return [state, submitAction, isPending] as const;
}
