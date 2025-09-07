import { useState } from 'react';

export interface ActionState<T> {
  formData?: T;
  errors?: Partial<Record<keyof T, string>>;
}

export function useActionState<T>(
  action: (state: ActionState<T> | undefined, formData: FormData) => Promise<any>,
  initialState: ActionState<T>
) {
  const [state, setState] = useState<ActionState<T>>(initialState);
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
