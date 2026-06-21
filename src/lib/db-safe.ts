/** Retourne une valeur de repli si la base est indisponible (ex. build local sans Docker). */
export async function withDbFallback<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch {
    return fallback;
  }
}
