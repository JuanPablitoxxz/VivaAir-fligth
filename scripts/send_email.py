#!/usr/bin/env python3
"""
Script para enviar correos electrónicos de VivaAir
Requiere: pip install smtplib (incluido) o usar un servicio como SendGrid
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuración SMTP (ajustar según el servicio de email)
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')

def send_email(to_email, subject, body_html, body_text=None):
    """Envía un correo electrónico"""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_USER
        msg['To'] = to_email

        if body_text:
            msg.attach(MIMEText(body_text, 'plain'))
        msg.attach(MIMEText(body_html, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"Email enviado a {to_email}")
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False

def send_airline_request_email(company_name, company_email):
    """Envía email cuando una empresa solicita ingresar"""
    subject = f"Solicitud de Aerolínea - {company_name}"
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #3da9fc;">VivaAir - Nueva Solicitud de Aerolínea</h2>
        <p>Hola,</p>
        <p>La empresa <strong>{company_name}</strong> ha solicitado ingresar a la plataforma VivaAir.</p>
        <p>Correo de contacto: {company_email}</p>
        <p>Un analista revisará la solicitud y se contactará con ustedes pronto.</p>
        <p>Saludos,<br>Equipo VivaAir</p>
      </body>
    </html>
    """
    
    return send_email(company_email, subject, html)

def send_airline_approval_email(company_name, company_email, admin_email='admin@vivaair.co'):
    """Envía email cuando se aprueba una aerolínea"""
    subject = f"Aprobación de Aerolínea - {company_name}"
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #3da9fc;">¡Felicidades! Tu solicitud ha sido aprobada</h2>
        <p>Estimados representantes de <strong>{company_name}</strong>,</p>
        <p>Nos complace informarles que su solicitud para vender vuelos en VivaAir ha sido <strong>APROBADA</strong>.</p>
        <p>Ya pueden comenzar a gestionar sus vuelos desde el panel de administración.</p>
        <p>Saludos cordiales,<br>Equipo VivaAir</p>
      </body>
    </html>
    """
    
    # Enviar a empresa
    send_email(company_email, subject, html)
    
    # Notificar al admin
    admin_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #3da9fc;">Aerolínea Aprobada</h2>
        <p>La aerolínea <strong>{company_name}</strong> ha sido aprobada exitosamente.</p>
        <p>Email: {company_email}</p>
      </body>
    </html>
    """
    
    return send_email(admin_email, f"Aerolínea Aprobada - {company_name}", admin_html)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        action = sys.argv[1]
        if action == "request":
            send_airline_request_email(sys.argv[2], sys.argv[3])
        elif action == "approval":
            send_airline_approval_email(sys.argv[2], sys.argv[3])

