import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
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
    const { transactionId, reason } = (await req.json()) as {
      transactionId?: string;
      reason?: string;
    };

    if (!transactionId) {
      return NextResponse.json({ error: "transactionId is required." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: tx, error: txError } = await adminClient
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (txError || !tx) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    const record = tx as {
      id: string;
      user_id: string;
      account_id: string;
      transaction_type: "credit" | "debit";
      category: string;
      amount: number;
      status: string;
      description: string;
      reference: string;
    };

    if (record.status !== "completed" || record.category === "system_audit") {
      return NextResponse.json(
        { error: "Only completed financial transactions can be reversed." },
        { status: 400 }
      );
    }

    const { data: account, error: accError } = await adminClient
      .from("accounts")
      .select("id, balance, available_balance")
      .eq("id", record.account_id)
      .single();

    if (accError || !account) {
      return NextResponse.json({ error: "Linked account not found." }, { status: 404 });
    }

    const acc = account as { id: string; balance: number; available_balance: number };
    const delta = record.transaction_type === "credit" ? -Number(record.amount) : Number(record.amount);
    const nextBalance = Number(acc.balance) + delta;
    const nextAvailable = Number(acc.available_balance) + delta;

    const { error: accUpdateError } = await adminClient
      .from("accounts")
      .update({ balance: nextBalance, available_balance: nextAvailable })
      .eq("id", acc.id);

    if (accUpdateError) throw accUpdateError;

    const { error: markReversedError } = await adminClient
      .from("transactions")
      .update({ status: "reversed" })
      .eq("id", record.id);

    if (markReversedError) throw markReversedError;

    const offsetType = record.transaction_type === "credit" ? "debit" : "credit";
    const reversalNote = reason?.trim() || "Administrative reversal protocol";

    await adminClient.from("transactions").insert([
      {
        user_id: record.user_id,
        account_id: acc.id,
        transaction_type: offsetType,
        category: "transfer",
        description: `Reversal of ${record.reference}: ${reversalNote}`,
        amount: Number(record.amount),
        balance_after: nextBalance,
        status: "completed",
        reference: `REV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      },
      {
        user_id: record.user_id,
        account_id: acc.id,
        transaction_type: "debit",
        category: "system_audit",
        description: `[REVERSAL_PROTOCOL] Transaction ${record.id} (${record.reference}) reversed by ${user.email}. Reason: ${reversalNote}. Balance updated to ${nextBalance}.`,
        amount: 0,
        balance_after: 0,
        status: "completed",
        reference: `audit-${crypto.randomUUID()}`,
      },
    ]);

    return NextResponse.json({ success: true, newBalance: nextBalance });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reversal failed." },
      { status: 500 }
    );
  }
}
