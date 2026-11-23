import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { convertCurrency, formatCurrencyAmount, normalizeCurrency } from "@/lib/currency";

const MAX_TRANSFER_EUR = 100_000;

/**
 * Institutional Transfer Processor
 * Enforces €100,000 max transfer cap, completes internal own-account transfers,
 * and queues external outbound transfers as `pending` for admin review.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      type,
      fromAccountId,
      toAccountId,
      amount,
      recipientName,
      iban,
      note,
      currency: requestedCurrency,
    } = body;

    const numAmount = parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Please enter a valid positive transfer amount." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Verify Source Account
    const { data: fromAccount, error: fromError } = await adminClient
      .from("accounts")
      .select("*")
      .eq("id", fromAccountId)
      .eq("user_id", user.id)
      .single();

    if (fromError || !fromAccount) {
      return NextResponse.json({ error: "Source account not found." }, { status: 404 });
    }

    const fromCurr = normalizeCurrency(fromAccount.currency);
    const inputCurrency = type === "internal" ? fromCurr : normalizeCurrency(requestedCurrency || fromCurr);
    const amountInEur = convertCurrency(numAmount, inputCurrency, "EUR");

    if (amountInEur > MAX_TRANSFER_EUR) {
      return NextResponse.json(
        { error: `Transfer amount exceeds the maximum limit of ${formatCurrencyAmount(MAX_TRANSFER_EUR, "EUR")} per transaction.` },
        { status: 400 }
      );
    }

    // Debit amount in the source account's currency
    const debitAmount = convertCurrency(numAmount, inputCurrency, fromCurr);

    if (Number(fromAccount.available_balance) < debitAmount) {
      return NextResponse.json({ error: "Insufficient available funds." }, { status: 400 });
    }

    const traceId = crypto.randomUUID();

    if (type === "internal") {
      // INTERNAL TRANSFER LOGIC (Between user's own accounts — Instant)
      const { data: toAccount, error: toError } = await adminClient
        .from("accounts")
        .select("*")
        .eq("id", toAccountId)
        .eq("user_id", user.id)
        .single();

      if (toError || !toAccount) {
        return NextResponse.json({ error: "Destination account not found." }, { status: 404 });
      }

      const toCurr = normalizeCurrency(toAccount.currency);
      const creditedAmount = convertCurrency(debitAmount, fromCurr, toCurr);

      const newFromBalance = Number((Number(fromAccount.balance) - debitAmount).toFixed(2));
      const newFromAvailable = Number((Number(fromAccount.available_balance) - debitAmount).toFixed(2));
      const newToBalance = Number((Number(toAccount.balance) + creditedAmount).toFixed(2));
      const newToAvailable = Number((Number(toAccount.available_balance) + creditedAmount).toFixed(2));

      await adminClient
        .from("accounts")
        .update({ balance: newFromBalance, available_balance: newFromAvailable })
        .eq("id", fromAccountId);

      await adminClient
        .from("accounts")
        .update({ balance: newToBalance, available_balance: newToAvailable })
        .eq("id", toAccountId);

      await adminClient.from("transactions").insert([
        {
          account_id: fromAccountId,
          user_id: user.id,
          transaction_type: "debit",
          category: "transfer",
          description: `Internal Transfer to ${toAccount.account_name}${note ? ` - ${note}` : ""}`,
          amount: debitAmount,
          balance_after: newFromBalance,
          reference: traceId,
          status: "completed",
          counterparty_name: toAccount.account_name,
        },
        {
          account_id: toAccountId,
          user_id: user.id,
          transaction_type: "credit",
          category: "transfer",
          description: `Internal Transfer from ${fromAccount.account_name}${fromCurr !== toCurr ? ` (FX ${fromCurr}→${toCurr})` : ""}${note ? ` - ${note}` : ""}`,
          amount: creditedAmount,
          balance_after: newToBalance,
          reference: traceId,
          status: "completed",
          counterparty_name: fromAccount.account_name,
        },
      ]);

      return NextResponse.json({
        success: true,
        status: "completed",
        traceId,
        amount: debitAmount,
        currency: fromCurr,
      });
    }

    // EXTERNAL OUTBOUND TRANSFER LOGIC (Pending Admin Review)
    if (!recipientName?.trim() || !iban?.trim()) {
      return NextResponse.json(
        { error: "Beneficiary name and IBAN / account identifier are required." },
        { status: 400 }
      );
    }

    const newAvailable = Number((Number(fromAccount.available_balance) - debitAmount).toFixed(2));
    const projectedBalanceAfter = Number((Number(fromAccount.balance) - debitAmount).toFixed(2));

    // Hold funds in available_balance while awaiting admin approval
    const { error: holdError } = await adminClient
      .from("accounts")
      .update({ available_balance: newAvailable })
      .eq("id", fromAccountId);

    if (holdError) throw holdError;

    const tierLabel = amountInEur >= 25_000 ? "SUPERVISOR" : "STANDARD";
    const fxNote = inputCurrency !== fromCurr ? ` [${formatCurrencyAmount(numAmount, inputCurrency)}]` : "";
    const wireLabel = type === "domestic" ? "Domestic Wire" : "International Wire";

    const { error: txInsertError } = await adminClient.from("transactions").insert({
      account_id: fromAccountId,
      user_id: user.id,
      transaction_type: "debit",
      category: "transfer",
      description: `[TIER: ${tierLabel}] ${wireLabel} to ${recipientName.trim()} (${iban.trim()})${fxNote}${note ? ` - ${note.trim()}` : ""}`,
      amount: debitAmount,
      balance_after: projectedBalanceAfter,
      reference: traceId,
      status: "pending",
      counterparty_name: recipientName.trim(),
    });

    if (txInsertError) throw txInsertError;

    return NextResponse.json({
      success: true,
      status: "pending",
      traceId,
      amount: numAmount,
      currency: inputCurrency,
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return NextResponse.json({ error: error.message || "Transfer failed." }, { status: 400 });
  }
}
