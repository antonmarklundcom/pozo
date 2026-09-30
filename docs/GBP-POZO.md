# Google Business Profile: paquete para Pozo.com.py

Todo el texto sale de lo que el sitio ya afirma (`site.config.mjs`, páginas de servicio). Nada de precios,
plazos, garantías, reseñas ni "24/7". Antes de publicar, el dueño confirma los datos marcados con **[confirmar]**.
Reglas de GBP: nombre real del negocio (sin palabras clave añadidas), sin incentivos por reseñas, fotos solo
reales (nunca ilustraciones de IA ni de stock).

## 1. Datos base (NAP, idénticos en GBP, sitio y directorios)

| Campo | Valor |
|---|---|
| Nombre | Pozo.com.py **[confirmar que es el nombre comercial real]** |
| Teléfono | +595 992 279 599 (WhatsApp: 595992279599) |
| Sitio web | `https://pozo.com.py/?utm_source=google&utm_medium=organic&utm_campaign=gbp` |
| Tipo | Negocio con área de servicio: ocultar la dirección si no se atiende público en un local **[confirmar dirección y si hay local]** |
| Horario | Lun a Sáb 07:00–19:00. Domingo: solo urgencias de desagüe (texto del sitio). Cargar el domingo como horario especial solo si el operador lo confirma como real |
| Áreas de servicio | Asunción, San Lorenzo, Luque, Lambaré, Fernando de la Mora, Mariano Roque Alonso, Capiatá, Ñemby, Villa Elisa, Limpio (`COVERAGE_CITIES`) **[confirmar]** |
| Mensajes | Activar WhatsApp como canal de contacto; respuesta a los mensajes solo cuando el operador la pueda cumplir |

## 2. Categorías

Los nombres de categoría están en inglés en Google. Verificá que existan en el desplegable al cargarlas.

- **Principal (decisión del dueño):** el servicio que más ingresos deja. Recomendado, si el desagüe es el
  ingreso principal: `Septic system service`. Si lo es la perforación: `Water well drilling contractor`.
- **Secundarias (solo servicios realmente prestados):** `Water well drilling contractor`, `Septic system service`,
  `Sewage disposal service`, `Water treatment service`. No agregar categorías de servicios sin confirmar
  (limpieza de pozo artesiano, bombas, destape de cañerías están pendientes de confirmación, ver `OWNER-TODO.md`).

## 3. Servicios (sección "Servicios" del perfil)

| Servicio | Descripción corta (≤ 300 caracteres) |
|---|---|
| Pozos artesianos | Perforación de pozos artesianos: entubado, filtro, bomba y tablero según el alcance. La profundidad y el costo se definen tras revisar el terreno. |
| Precio de pozo artesiano | Cotización por metro según profundidad, tipo de suelo y componentes. Se cotiza con los datos del terreno, sin precios fijos. |
| Pozos ciegos | Consultas por construcción, revisión y mantenimiento de pozos ciegos. |
| Desagüe de pozo ciego | Desagüe con camión atmosférico de 8 m³ (capacidad informada por el operador). Se coordina según acceso, distancia a la tapa y volumen. |
| Pozo ciego lleno | Atención de pozos llenos con olor, drenaje lento o rebalse. Urgencias de desagüe también los domingos, sujetas a disponibilidad. |
| Pozos sépticos y biodigestores | Orientación sobre cámara séptica y biodigestor según suelo, espacio y cantidad de usuarios. |
| Tratamiento de agua de pozo | Consulta sobre sarro, hierro, color u olor en el agua del pozo. La potabilidad se confirma con análisis. |

## 4. Descripción (máx. 750 caracteres)

```
Pozo.com.py atiende pozos artesianos y pozos ciegos en Asunción y Gran Asunción. Perforación de pozos artesianos con entubado, filtro, bomba y tablero según el alcance, desagüe de pozos ciegos con camión atmosférico de 8 m³, atención de pozos llenos o con rebalse, consultas por cámaras sépticas y biodigestores, y tratamiento del agua de pozo. Cubrimos Asunción, San Lorenzo, Luque, Lambaré, Fernando de la Mora, Mariano Roque Alonso, Capiatá, Ñemby, Villa Elisa y Limpio. Atendemos de lunes a sábado de 07:00 a 19:00, y coordinamos urgencias de desagüe también los domingos, según disponibilidad. Escribinos por WhatsApp con tu ciudad, barrio y una foto del acceso o del terreno, y te orientamos con los datos de tu caso.
```

Longitud: 723 caracteres (límite de Google: 750).

## 5. Doce publicaciones semanales

Una por semana, con foto real cuando exista (ver sección 8), botón "Llamar" o "WhatsApp", sin precios ni plazos.
Enlace del botón con UTM `utm_campaign=gbp`. Todas salen de contenido del sitio.

1. **Presentación:** quiénes somos y qué hacemos (perforación, desagüe, séptico, agua) y cómo escribirnos por WhatsApp.
2. **Zonas:** las ciudades que cubrimos; invitar a mandar ciudad y barrio.
3. **Desagüe:** cómo coordinamos un desagüe con camión de 8 m³ (acceso, tapa, distancia en pasos).
4. **Foto del acceso:** por qué pedimos una foto del acceso y otra de la tapa (sin abrirla).
5. **Pozo lleno:** señales de un pozo ciego lleno (olor, drenaje lento, rebalse) y qué hacer mientras tanto.
6. **Seguridad:** por qué no conviene vaciar el pozo por cuenta propia (efluentes, gases, riesgo de caída).
7. **Pozo artesiano:** qué datos necesitamos para cotizar (ubicación, uso del agua, pozos vecinos).
8. **Profundidad:** en Gran Asunción se informan típicos 30 a 120 m; no es garantía, depende del punto y la geología.
9. **Séptico:** biodigestor o pozo ciego: se decide según suelo, espacio y usuarios; el biodigestor también necesita mantenimiento.
10. **Agua de pozo:** un filtro no garantiza potabilidad; el análisis de laboratorio la confirma.
11. **Urgencias:** desagües urgentes también los domingos, sujetos a disponibilidad.
12. **Cierre de ciclo:** recordatorio de cómo pedir información (WhatsApp con ciudad, barrio y fotos) y agradecimiento por las consultas.

## 6. Diez preguntas y respuestas (para sembrar en Q&A)

Las respuestas son las FAQ del sitio (`build.mjs`). Publicarlas desde la cuenta del negocio.

1. **¿Atienden los domingos?** Se coordinan urgencias de desagüe también los domingos, sujetas a disponibilidad del equipo y cobertura.
2. **¿Cuánto extrae el camión?** La capacidad informada es de 8 m³. El volumen real a extraer y la cantidad de viajes se confirman según el caso.
3. **¿Cada cuánto se desagota un pozo ciego?** No hay un intervalo único. Depende de capacidad, cantidad de usuarios, infiltración y uso. Un aumento brusco de frecuencia puede indicar saturación o una falla.
4. **¿Puedo vaciar el pozo por mi cuenta?** No es recomendable. Hay exposición a efluentes, gases y riesgo de caída. Se requiere equipo adecuado y manejo seguro.
5. **¿Puedo seguir usando agua mientras espero?** Si hay rebalse o retorno, reducí el uso al mínimo para no agravar la situación. Evitá lavar, ducharte o descargar agua innecesariamente.
6. **¿Qué profundidad puede necesitar un pozo artesiano?** En Gran Asunción se informan como típicos 30 a 120 m, pero no es una garantía. La geología y el punto de perforación determinan el resultado.
7. **¿La bomba está incluida?** Se cotiza como componente separado o dentro de un alcance integral, según la propuesta del operador. La potencia depende de profundidad, caudal y uso.
8. **¿Cuánto tarda la perforación?** No damos un plazo fijo sin conocer acceso, profundidad y tipo de suelo. El operador confirma una estimación después de revisar los datos del terreno.
9. **¿Un biodigestor necesita mantenimiento?** Sí. La frecuencia y el procedimiento dependen del modelo, la carga y las indicaciones técnicas del fabricante.
10. **¿Un filtro vuelve potable el agua?** No necesariamente. La potabilidad se confirma mediante análisis y depende de que el tratamiento sea adecuado y esté mantenido.

## 7. Reseñas

Pedir la reseña a **cada** cliente atendido, dentro de 24–48 h, por WhatsApp, con el enlace directo
(`https://search.google.com/local/writereview?placeid=<PLACE_ID>`, el Place ID sale del perfil una vez verificado).
Sin regalos, descuentos ni sorteos a cambio. Ritmo parejo: 2–4 al mes.

Texto para pedirla (se guarda como respuesta rápida `/resena`):

> Hola ___, gracias por confiar en Pozo.com.py. Si te quedó conforme con el trabajo, nos ayuda mucho que
> cuentes tu experiencia en Google (lleva un minuto): ___ (enlace). Si algo no quedó bien, escribinos por
> acá y lo vemos. ¡Gracias!

Responder **todas** las reseñas en pocos días: las positivas cortas y con el trabajo mencionado; las
negativas con hechos y solución, sin discutir. Ninguna reseña se copia al sitio sin permiso escrito del cliente.

## 8. Lista de fotos reales (tomarlas en trabajos reales, con permiso del cliente)

Nunca ilustraciones de IA ni de stock en el perfil. Las imágenes del sitio son ilustrativas y no sirven aquí.

1. Camión atmosférico de frente y de lado (con la capacidad visible si está rotulada).
2. Camión en una calle, junto a un acceso real (sin patente de terceros ni caras).
3. El operador con equipo y ropa de trabajo (con su permiso).
4. Manguera y conexión en la tapa del pozo ciego (tapa cerrada, sin efluentes a la vista).
5. Perforadora en un terreno (foto general).
6. Detalle de entubado y filtro antes de instalar.
7. Cabezal del pozo terminado, con bomba y tablero.
8. Tablero eléctrico terminado.
9. Instalación de un biodigestor.
10. Equipo de tratamiento de agua instalado.
11. Logo o rótulo del vehículo (portada).
12. Foto de logo para el perfil (usar `assets/images/logo-pozo-512.png`).

Los videos cortos (≤ 30 s) de un desagüe en curso, sin personas identificables, suman actividad.
Tomar las fotos en el lugar para que lleven geolocalización.

## 9. Rutina mensual (~30 min)

- 2–4 fotos nuevas, 1–2 publicaciones (usar la lista de la sección 5 en orden).
- Responder reseñas y preguntas nuevas.
- Revisar que nadie haya propuesto cambios al horario, categoría o teléfono ("Sugerir cambio").
- Confirmar que el horario y el teléfono siguen siendo iguales al sitio.

## 10. Otros perfiles del negocio (sin inventar URLs)

Facebook, Instagram, Bing Places, WhatsApp Business (perfil con catálogo, horario y sitio). Con los mismos NAP.
Cuando el dueño confirme las URLs oficiales, van en `SITE.sameAs` de `site.config.mjs`.
