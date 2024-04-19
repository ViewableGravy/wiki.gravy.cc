export const conditional = <T>({ condition, error }: { condition: (value: NoInfer<T>) => boolean, error?: string }) => {
  return (data: T) => {
    if (!condition(data)) {
      throw new Error(error ?? "Something went wrong")
    }

    return data;
  }
}