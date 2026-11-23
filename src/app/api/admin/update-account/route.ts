import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_STATUSES = new Set(["active", "frozen", "closed"]);

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    !callerProfile ||
    !["admin", "supervisor", "executive"].includes((callerProfile as { role: string }).role)
  ) {
    return NextResponse.json({ error: "Forbidden: Institutional role required." }, { status: 403 });
  }

  try {
    const body = (await req.json()) as { accountId?: string; status?: string };
    const { accountId, status } = body;

    if (!accountId || !status || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Valid accountId and status ('active' | 'frozen' | 'closed') are required." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { data: account, error: fetchError } = await adminClient
      .from("accounts")
      .select("id, user_id, account_name, account_number, status")
      .eq("id", accountId)
      .single();

    if (fetchError || !account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const { error: updateError } = await adminClient
      .from("accounts")
      .update({ status: status as "active" | "frozen" | "closed" })
      .eq("id", accountId);

    if (updateError) {
      throw updateError;
    }

    await adminClient.from("transactions").insert({
      user_id: (account as { user_id: string }).user_id,
      account_id: accountId,
      transaction_type: "debit",
      category: "system_audit",
      description: `[ACCOUNT_CONTROL] ${(account as { account_name: string }).account_name} (${(account as { account_number: string }).account_number}) status changed from ${(account as { status: string }).status} to ${status} by ${user.email}.`,
      amount: 0,
      balance_after: 0,
      status: "completed",
      reference: `audit-${crypto.randomUUID()}`,
    });

    return NextResponse.json({ success: true, accountId, status });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update account." },
      { status: 500 }
    );
  }
}
