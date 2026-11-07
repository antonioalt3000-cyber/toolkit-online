# Un solo giro di sonde RCPT, ben spaziate. Niente DATA: nessuna email viene inviata.
# La sonda si auto-avvelena se rapida (greylisting Porkbun): un 450 e' INCONCLUSIVO,
# mai "rotto". Solo 550/554 prova l'assenza di una regola di inoltro.
import smtplib, time, sys

TARGETS = [
    "support@complipilot.dev",
    "contact@fixmyweb.dev",
    "privacy@fixmyweb.dev",
    "support@paymentrescue.dev",
    "hello@parseflow.dev",
    "hello@captureapi.dev",
    "privacy@captureapi.dev",
    "hello@getcardforge.dev",
    "hello@emailguard.dev",
    "hello@headershield.dev",
    "hello@gethooklab.dev",
    "hello@seoscope.dev",
    # controllo interno: senza catch-all questo DEVE essere rifiutato.
    "zzqa-nonexistent-9x7@seoscope.dev",
]

for i, addr in enumerate(TARGETS):
    if i:
        time.sleep(12)
    try:
        s = smtplib.SMTP("fwd1.porkbun.com", 25, timeout=20)
        s.ehlo("toolkitonline.vip")
        s.mail("postmaster@toolkitonline.vip")
        code, msg = s.rcpt(addr)
        try:
            s.rset(); s.quit()
        except Exception:
            pass
        print(f"{addr:34s} {code} {msg.decode(errors='replace')[:90]}", flush=True)
    except Exception as e:
        print(f"{addr:34s} ERR {type(e).__name__}: {e}", flush=True)
