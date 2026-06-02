import logging
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
    emails_sent: int = 0
    errors: list[str] = field(default_factory=list)


def get_business_name():
    return getattr(settings, "ALTERNATIVE_TIME_BUSINESS_NAME", "Alternative Time")


def get_birthday_recipient_email():
    return getattr(settings, "BIRTHDAY_NOTIFICATION_TO_EMAILS", [])


def build_client_contact_summary(client):
    contact_parts = []
    if client.instagram_handle:
        contact_parts.append(client.instagram_handle)
    if client.phone:
        contact_parts.append(client.phone)
    return {
        "name": client.name,
        "contact_parts": contact_parts,
    }


def build_birthday_context(clients, today):
    return {
        "business_name": get_business_name(),
        "clients": [build_client_contact_summary(client) for client in clients],
        "today": today,
        "today_display": date_format(today, "j \\d\\e F \\d\\e Y"),
    }


def send_templated_email(subject, to_emails, template_base, context):
    text_body = render_to_string(f"{template_base}.txt", context)
    html_body = render_to_string(f"{template_base}.html", context)
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=to_emails,
    )
    message.attach_alternative(html_body, "text/html")
    return message.send()


def get_clients_with_birthdays(today=None):
    today = today or timezone.localdate()
    return (
        Client.objects.filter(
            is_active=True,
            birth_date__isnull=False,
            birth_date__month=today.month,
            birth_date__day=today.day,
        )
        .order_by("name")
    )


def send_birthday_notifications(today=None):
    today = today or timezone.localdate()
    result = BirthdayNotificationResult()
    clients = list(get_clients_with_birthdays(today))
    result.birthdays_found = len(clients)

    if not clients:
        logger.info(
            "Birthday notifications finished: 0 emails sent, 0 birthdays found, 0 errors."
        )
        return result

    recipient_emails = get_birthday_recipient_email()
    if not recipient_emails:
        error = "BIRTHDAY_NOTIFICATION_TO_EMAILS is not configured."
        result.errors.append(error)
        logger.error(
            "Birthday notification skipped: %s birthdays found but no recipient emails configured.",
            result.birthdays_found,
        )
        return result

    try:
        context = build_birthday_context(clients, today)
        result.emails_sent = send_templated_email(
            subject=BIRTHDAY_EMAIL_SUBJECT,
            to_emails=recipient_emails,
            template_base="clients/emails/birthday_notification",
            context=context,
        )
    except Exception as exc:
        result.errors.append(str(exc))
        logger.exception("Error sending birthday notification email.")
        return result

    logger.info(
        "Birthday notification sent to %s recipients for %s clients.",
        len(recipient_emails),
        result.birthdays_found,
    )

    logger.info(
        "Birthday notifications finished: %s emails sent, %s birthdays found, %s errors.",
        result.emails_sent,
        result.birthdays_found,
        len(result.errors),
    )
    return result
