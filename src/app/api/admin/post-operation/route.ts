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
    const body = (await req.json()) as {
      operation?: "interest" | "fee";
      accountId?: string;
      amount?: number;
      description?: string;
    };

    const { operation, accountId, amount, description } = body;
    if (!operation || !["interest", "fee"].includes(operation)) {
      return NextResponse.json({ error: "Invalid operation type." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    if (operation === "interest" && !accountId) {
      // Batch monthly interest disbursement across all active accounts with interest_rate > 0 and positive balance
      const { data: accounts, error } = await adminClient
        .from("accounts")
        .select("*")
        .eq("status", "active")
        .gt("interest_rate", 0)
        .gt("balance", 0);

      if (error) throw error;

      let creditedCount = 0;
      let totalCredited = 0;

      for (const rawAcc of accounts || []) {
        const acc = rawAcc as {
          id: string;
          user_id: string;
          account_name: string;
          balance: number;
          available_balance: number;
          interest_rate: number;
        };
        const monthlyInterest = Number(
          (((Number(acc.balance) * Number(acc.interest_rate)) / 100) / 12).toFixed(2)
        );
        if (monthlyInterest <= 0) continue;

        const nextBalance = Number((Number(acc.balance) + monthlyInterest).toFixed(2));
        const nextAvail = Number((Number(acc.available_balance) + monthlyInterest).toFixed(2));

        await adminClient
          .from("accounts")
          .update({ balance: nextBalance, available_balance: nextAvail })
          .eq("id", acc.id);

        await adminClient.from("transactions").insert([
          {
            user_id: acc.user_id,
            account_id: acc.id,
            transaction_type: "credit",
            category: "income",
            description: `Monthly Interest Yield (${acc.interest_rate}% APY) — ${acc.account_name}`,
            amount: monthlyInterest,
            balance_after: nextBalance,
            status: "completed",
            reference: `INT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          },
          {
            user_id: acc.user_id,
            account_id: acc.id,
            transaction_type: "debit",
            category: "system_audit",
            description: `[INTEREST_ENGINE] Posted CHF ${monthlyInterest.toFixed(2)} interest to ${acc.account_name} by ${user.email}.`,
            amount: 0,
            balance_after: 0,
            status: "completed",
            reference: `audit-${crypto.randomUUID()}`,
          },
        ]);

        creditedCount += 1;
        totalCredited += monthlyInterest;
      }

      return NextResponse.json({ success: true, creditedCount, totalCredited });
    }

    // Single-account interest credit or fee debit
    const numericAmount = Number(amount);
    if (!accountId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Valid accountId and positive amount are required." },
        { status: 400 }
      );
    }

    const { data: targetAcc, error: targetError } = await adminClient
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .single();

    if (targetError || !targetAcc) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const acc = targetAcc as {
      id: string;
      user_id: string;
      account_name: string;
      balance: number;
      available_balance: number;
    };

    const isInterest = operation === "interest";
    const nextBalance = Number(
      (isInterest ? Number(acc.balance) + numericAmount : Number(acc.balance) - numericAmount).toFixed(2)
    );
    const nextAvail = Number(
      (isInterest
        ? Number(acc.available_balance) + numericAmount
        : Number(acc.available_balance) - numericAmount
      ).toFixed(2)
    );

    if (!isInterest && nextBalance < 0) {
      return NextResponse.json(
        { error: "Fee exceeds current account balance." },
        { status: 400 }
      );
    }

    const { error: updErr } = await adminClient
      .from("accounts")
      .update({ balance: nextBalance, available_balance: nextAvail })
      .eq("id", acc.id);

    if (updErr) throw updErr;

    const narration =
      description?.trim() ||
      (isInterest
        ? `Institutional Interest Credit — ${acc.account_name}`
        : `Institutional Custody & Service Fee — ${acc.account_name}`);

    await adminClient.from("transactions").insert([
      {
        user_id: acc.user_id,
        account_id: acc.id,
        transaction_type: isInterest ? "credit" : "debit",
        category: isInterest ? "income" : "other",
        description: narration,
        amount: numericAmount,
        balance_after: nextBalance,
        status: "completed",
        reference: `${isInterest ? "INT" : "FEE"}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      },
      {
        user_id: acc.user_id,
        account_id: acc.id,
        transaction_type: "debit",
        category: "system_audit",
        description: `[${isInterest ? "INTEREST_ENGINE" : "FEE_ASSESSMENT"}] CHF ${numericAmount.toFixed(2)} ${isInterest ? "credited to" : "assessed on"} ${acc.account_name} by ${user.email}.`,
        amount: 0,
        balance_after: 0,
        status: "completed",
        reference: `audit-${crypto.randomUUID()}`,
      },
    ]);

    return NextResponse.json({ success: true, newBalance: nextBalance });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operation failed." },
      { status: 500 }
    );
  }
}
