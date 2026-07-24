import { NextRequest, NextResponse } from "next/server";
import { getAllMeals } from "@/lib/queries/meals";
import { getAllDrinks } from "@/lib/queries/drinks";
import { getAllWeighIns } from "@/lib/queries/weighIns";
import { getAllExercises } from "@/lib/queries/exercises";
import { buildExportCsv } from "@/lib/export-csv";

// The one Route Handler in this app -- everything else is Server Components/Actions, but a
// file download needs a real Content-Disposition response, which a Server Action can't hand
// back directly. Scoped to the active account the same way every other query is (rule: a
// collaborator viewing a shared account exports that account's data, not their own).
export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") === "csv" ? "csv" : "json";

  const [meals, drinks, weighIns, exercises] = await Promise.all([
    getAllMeals(),
    getAllDrinks(),
    getAllWeighIns(),
    getAllExercises(),
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `health-tracker-export-${stamp}.${format}`;

  if (format === "csv") {
    return new NextResponse(buildExportCsv({ meals, drinks, weighIns, exercises }), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const json = JSON.stringify(
    { exported_at: new Date().toISOString(), meals, drinks, weighIns, exercises },
    null,
    2,
  );
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
