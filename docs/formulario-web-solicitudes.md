# Formulario web conectado a solicitudes

## Flujo sin API de pago

1. La paciente entra a la web pública.
2. Abre un tratamiento o promoción, por ejemplo una gift card.
3. Completa un formulario:
   - Nombre.
   - WhatsApp.
   - Correo opcional.
   - Tratamiento o gift card.
   - Profesional preferida, si aplica.
   - Fecha y hora preferida.
   - Comentario.
4. La web envía esos datos al sistema mediante un endpoint seguro.
5. El sistema busca paciente por teléfono:
   - Si existe, vincula la solicitud al `patientId` existente.
   - Si no existe, crea la paciente y luego crea la solicitud.
6. La solicitud queda en el panel interno con estado `Pendiente de pago`.
7. El sistema asigna una fecha de próximo seguimiento para que la posible clienta no se pierda si no reserva.
8. La web abre WhatsApp con un mensaje prellenado para que la paciente envíe el comprobante o coordine el pago.
9. Administración revisa el pago por WhatsApp.
10. Administración entra a `Solicitudes`, presiona `Agendar`, confirma fecha/hora y guarda la cita.

## Seguimiento si no reserva

Si la posible clienta no concreta la reserva, el registro no se elimina. Queda como prospecto dentro de `Solicitudes` y vinculado a su ficha de paciente.

Estados sugeridos:

- `Pendiente de pago`
- `Contactada`
- `No respondió`
- `Seguimiento pendiente`
- `Agendada`
- `Perdida`

La administración puede editar la fecha de próximo seguimiento y usar el botón de WhatsApp manual con un mensaje prellenado. Esto permite recuperar oportunidades desde Instagram, formulario web o carga manual sin depender todavía de una API de WhatsApp.

## Flujo con API de pago después

1. La paciente completa el formulario.
2. El sistema crea solicitud `Pendiente de pago`.
3. El sistema crea link de pago con Transbank, Flow, Mercado Pago u otro proveedor.
4. La paciente paga.
5. El proveedor avisa al sistema por webhook.
6. El sistema marca la solicitud como pagada.
7. Administración puede confirmar la cita, o el sistema puede dejarla confirmada automáticamente si hay horario disponible.

## Endpoint recomendado

Para producción, la web no debe escribir directo en el navegador del panel interno. Debe enviar los datos a backend:

`POST /api/solicitudes`

Payload sugerido:

```json
{
  "name": "Antonia Vargas",
  "phone": "+56 9 7214 9102",
  "email": "antonia@gmail.com",
  "treatmentId": "trt-trilaser",
  "professionalId": "pro-javiera",
  "date": "2026-07-08",
  "time": "12:00",
  "source": "Formulario web",
  "note": "Quiere reservar gift card o evaluación"
}
```

Respuesta sugerida:

```json
{
  "requestId": "req-123",
  "patientId": "pat-123",
  "whatsappUrl": "https://wa.me/569..."
}
```

## Por qué no usar solo WhatsApp

WhatsApp sirve para conversación y comprobante, pero no es suficiente como sistema. La solicitud debe quedar guardada antes de abrir WhatsApp, porque si la paciente no envía el mensaje o cierra la ventana, administración igual tendrá el registro en `Solicitudes`.

## Estado inicial recomendado

- Estado solicitud: `Pendiente de pago`.
- Fecha de próximo seguimiento: 24 a 72 horas después de la solicitud.
- Estado cita: todavía no existe cita final.
- Después de validar pago: administración presiona `Agendar`.
- Al guardar: se crea cita confirmada y vinculada al paciente.
