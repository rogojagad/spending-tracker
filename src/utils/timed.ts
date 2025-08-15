/**
 * Wraps all functions in an object with timing functionality.
 * Each function will log its execution duration using console.time/timeEnd.
 *
 * @param moduleName - The name to use as prefix in timing logs
 * @param methods - Object containing functions to wrap
 * @returns Object with all functions wrapped for timing
 */
export function timed<T extends Record<string, (...args: any[]) => any>>(
  moduleName: string,
  methods: T,
): T {
  const wrappedMethods: Record<string, (...args: any[]) => any> = {};

  for (const [methodName, method] of Object.entries(methods)) {
    wrappedMethods[methodName] = ((...args: any[]) => {
      const label = `${moduleName}.${methodName}`;
      console.time(label);

      try {
        const result = method(...args);

        // Handle both sync and async functions
        if (result && typeof (result as any).then === "function") {
          // Async function - return a promise that logs timing after completion
          return (result as Promise<unknown>)
            .then((value: unknown) => {
              console.timeEnd(label);
              return value;
            })
            .catch((error: unknown) => {
              console.timeEnd(label);
              throw error;
            });
        } else {
          // Sync function - log timing immediately
          console.timeEnd(label);
          return result;
        }
      } catch (error) {
        console.timeEnd(label);
        throw error;
      }
    }) as (...args: any[]) => any;
  }

  return wrappedMethods as T;
}
