from .models import AccountBalance, FinanceEntry


def recalculate_account_balance(account):
    income_total = sum(
        entry.amount
        for entry in FinanceEntry.objects.filter(
            account=account,
            entry_type=FinanceEntry.TYPE_INCOME,
            is_deleted=False,
        )
    )
    expense_total = sum(
        entry.amount
        for entry in FinanceEntry.objects.filter(
            account=account,
            entry_type=FinanceEntry.TYPE_EXPENSE,
            is_deleted=False,
        )
    )
    balance, _ = AccountBalance.objects.get_or_create(account=account)
    balance.balance = income_total - expense_total
    balance.save(update_fields=["balance", "updated_at"])
    return balance
