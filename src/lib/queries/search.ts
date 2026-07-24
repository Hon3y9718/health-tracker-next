// Builds a safe PostgREST `or=(col.ilike."%term%",...)` filter string. Two escaping layers:
// SQL LIKE wildcards (%, _) are escaped so a literal "%" in someone's search doesn't act as
// a wildcard, and the value is double-quoted so a literal comma or parenthesis in the search
// text can't break PostgREST's or-filter parsing.
export function orIlike(columns: string[], term: string): string {
  const likeEscaped = term.replace(/[%_]/g, "\\$&");
  const quoted = likeEscaped.replace(/"/g, '\\"');
  return columns.map((col) => `${col}.ilike."%${quoted}%"`).join(",");
}
