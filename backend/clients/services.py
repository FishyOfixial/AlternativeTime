import logging
from collections import defaultdict
from dataclasses import dataclass, field

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.formats import date_format
from django.utils import timezone

from .models import Client

logger = logging.getLogger(__name__)

BIRTHDAY_EMAIL_SUBJECT = "🎂 Cumpleaños de clientes hoy"


@dataclass
class BirthdayNotificationResult:
    birthdays_found: int = 0
    owners_notified: int = 0
    emails_sent: int = 0
    errors: list[str] = field(default_factory=list)


def get_owner_display_name(owner):
    full_name = owner.get_full_name().strip()
    return full_name or owner.username


def get_business_name(owner):
    return getattr(settings, "ALTERNATIVE_TIME_BUSINESS_NAME", "Alternative Time")


def build_birthday_context(owner, clients, today):
    return {
        "owner_name": get_owner_display_name(owner),
        "business_name": get_business_name(owner),
        "clients": clients,
        "today": today,
        "today_display": date_format(today, "j \\d\\e F \\d\\e Y"),
    }


def send_templated_email(subject, to_email, template_base, context):
    text_body = render_to_string(f"{template_base}.txt", context)
    html_body = render_to_string(f"{template_base}.html", context)
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    message.attach_alternative(html_body, "text/html")
    return message.send()


def get_clients_with_birthdays(today=None):
    today = today or timezone.localdate()
    return (
        Client.objects.select_related("created_by")
        .filter(
            is_active=True,
            birth_date__isnull=False,
            birth_date__month=today.month,
            birth_date__day=today.day,
        )
        .order_by("created_by_id", "name")
    )


def send_birthday_notifications(today=None):
    today = today or timezone.localdate()
    result = BirthdayNotificationResult()
    clients_by_owner = defaultdict(list)
    clients = get_clients_with_birthdays(today)

    for client in clients:
        result.birthdays_found += 1
        owner = client.created_by
        if owner is None:
            logger.warning(
                "Skipping birthday notification for client %s without owner.",
                client.id,
            )
            continue
        clients_by_owner[owner].append(client)

    for owner, owner_clients in clients_by_owner.items():
        if not owner.email:
            logger.warning(
                "Skipping birthday notification for owner %s without email.",
                owner.id,
            )
            continue

        try:
            context = build_birthday_context(owner, owner_clients, today)
            sent_count = send_templated_email(
                subject=BIRTHDAY_EMAIL_SUBJECT,
                to_email=owner.email,
                template_base="clients/emails/birthday_notification",
                context=context,
            )
        except Exception as exc:
            error = f"Owner {owner.id}: {exc}"
            result.errors.append(error)
            logger.exception(
                "Error sending birthday notification to owner %s.",
                owner.id,
            )
            continue

        result.owners_notified += 1
        result.emails_sent += sent_count
        logger.info(
            "Birthday notification sent to owner %s for %s clients.",
            owner.id,
            len(owner_clients),
        )

    logger.info(
        "Birthday notifications finished: %s emails sent, %s birthdays found, %s errors.",
        result.emails_sent,
        result.birthdays_found,
        len(result.errors),
    )
    return result
