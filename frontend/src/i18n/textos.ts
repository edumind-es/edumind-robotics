/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
 * Author: Luis Vilela Acuña
 *
 * Textos de la interfaz en las lenguas del proyecto.
 *
 * Sin librería de internacionalización: el conjunto de textos es acotado y
 * una dependencia más costaría kilobytes en el navegador de un aula. Aquí un
 * objeto por lengua y una función que busca la clave, con castellano como
 * red de seguridad si algo falta.
 */

export const IDIOMAS = {
  es: { nombre: 'Castellano', htmlLang: 'es' },
  gl: { nombre: 'Galego', htmlLang: 'gl' },
  ca: { nombre: 'Català', htmlLang: 'ca' },
  eu: { nombre: 'Euskara', htmlLang: 'eu' },
  en: { nombre: 'English', htmlLang: 'en' },
  zh: { nombre: '中文', htmlLang: 'zh-Hans' },
} as const

export type Idioma = keyof typeof IDIOMAS

type Textos = Record<string, string>

const es: Textos = {
  'ejec.error':
    'El programa se paró aquí:',
  'ejec.salida':
    'Lo que escribió tu programa:',
  'ejec.ok':
    'El programa se ejecutó bien.',
  'makey.tambien':
    'También sirve para TeclaTecla y otras copias: es la misma placa.',
  'usb.enviar':
    'Enviar al micro:bit',
  'usb.enviando':
    'Preparando el programa…',
  'usb.listo':
    'Programa enviado. Si has elegido la unidad MICROBIT, la placa ya se está reiniciando con él.',
  'usb.ayuda':
    'Conecta el micro:bit por USB y elige la unidad MICROBIT al guardar.',
  'usb.sinSoporte':
    'Este navegador no puede guardar directamente en la placa. El programa se descargará y podrás arrastrarlo a la unidad MICROBIT.',
  'idioma.avisoTraduccion':
    'Esta traducción se ha hecho con ayuda de IA y no la ha revisado ningún hablante nativo. Puede contener errores. Si ves alguno, dínoslo.',
  'card.sim': 'Simulador',
  'card.simT': 'Laboratorio virtual',
  'card.simD': 'Experimenta con micro:bit sin hardware físico. Matriz LED interactiva, botones, sensores y control de Nezha en tiempo real.',
  'card.ia': 'Asistente IA',
  'card.iaT': 'Tutor educativo local',
  'card.iaD': 'Pregunta, aprende y genera código con una IA que se ejecuta en el propio centro. Te explica cada línea, no solo te la entrega.',
  'card.ed': 'Editor',
  'card.edT': 'Código MicroPython',
  'card.edD': 'Escribe y ejecuta código Python al instante. Ve el resultado en el simulador y experimenta sin límites.',
  'politica.titulo': 'IA local y privacidad:',
  'politica.ok': 'IA local activa',
  'politica.warn': 'Revisar el punto de IA',
  'politica.sinHistorial': 'sin guardar conversaciones',
  'politica.uso': 'uso guiado para robótica educativa.',
  'nav.inicio': 'Inicio',
  'nav.laboratorio': 'Laboratorio',
  'nav.vibe': 'Vibe Coding',
  'nav.pedagogia': 'Pedagogía',
  'nav.ajustes': 'Ajustes',
  'nav.iaLocal': 'IA local',
  'nav.iaActiva': 'IA activa',
  'nav.saltar': 'Saltar al contenido',
  'nav.salir': 'Salir',

  'home.kicker': 'Laboratorio virtual · NEZHA + micro:bit + Makey Makey',
  'home.subtitulo': 'Aprende programación con micro:bit y Nezha mediante IA local',
  'home.vibe': 'Vibe Coding',
  'home.abrirLab': 'Abrir Laboratorio',
  'home.porQueLocal': 'Por qué la IA es local',

  'sim.titulo': 'Simulador',
  'sim.activo': 'Simulador activo',
  'sim.leerTexto': 'Leer la pantalla en texto',
  'sim.ocultarTexto': 'Ocultar la pantalla en texto',

  'editor.titulo': 'Código MicroPython',
  'editor.ejecutar': 'Ejecutar código',
  'editor.ejecutando': 'Ejecutando…',
  'editor.explicar': 'Explícame la línea',
  'editor.pensando': 'Pensando…',
  'editor.etiquetaCampo': 'Tu código MicroPython. Escribe una instrucción en cada línea.',
  'editor.cerrarExplicacion': 'Cerrar la explicación',
  'editor.errorExplicacion': 'No se pudo pedir la explicación. Inténtalo otra vez.',

  'chat.titulo': 'Tutor EDUmind',
  'chat.listo': 'Listo',
  'chat.pensando': 'Pensando…',
  'chat.enviar': 'Enviar',
  'chat.escribe': 'Escribe tu pregunta o solicitud…',
  'chat.esperando': 'Pensando en este ordenador. Tu pregunta no sale de aquí.',
  'chat.esperandoCodigo': 'Pensando en este ordenador. Tu código no sale de aquí.',

  'acceso.titulo': 'Cómo aprendo mejor',
  'acceso.kicker': 'Ajustes de lectura y pantalla',
  'acceso.intro':
    'Cambia lo que necesites. Se guarda en este ordenador y no se envía a ningún sitio.',
  'acceso.cerrar': 'Cerrar los ajustes',
  'acceso.restablecer': 'Dejarlo como estaba',
  'acceso.listo': 'Listo',
  'acceso.idioma': 'Idioma',
  'acceso.idiomaDesc': 'La app y el tutor te hablarán en esta lengua.',

  'idioma.avisoTutor':
    'El tutor de IA responderá en castellano: los modelos que caben en este servidor todavía no manejan bien esta lengua. La app sí está traducida.',
  'idioma.avisoLento':
    'En esta lengua el tutor usa un modelo más grande y tarda algo más en responder.',
}

const gl: Textos = {
  'ejec.error':
    'O programa parouse aquí:',
  'ejec.salida':
    'O que escribiu o teu programa:',
  'ejec.ok':
    'O programa executouse ben.',
  'makey.tambien':
    'Tamén serve para TeclaTecla e outras copias: é a mesma placa.',
  'usb.enviar':
    'Enviar ao micro:bit',
  'usb.enviando':
    'Preparando o programa…',
  'usb.listo':
    'Programa enviado. Se escolliches a unidade MICROBIT, a placa xa se está reiniciando con el.',
  'usb.ayuda':
    'Conecta o micro:bit por USB e escolle a unidade MICROBIT ao gardar.',
  'usb.sinSoporte':
    'Este navegador non pode gardar directamente na placa. O programa descargarase e poderás arrastralo á unidade MICROBIT.',
  'idioma.avisoTraduccion':
    'Esta tradución fíxose con axuda de IA e non a revisou ningún falante nativo. Pode conter erros. Se ves algún, dínolo.',
  'card.sim': 'Simulador',
  'card.simT': 'Laboratorio virtual',
  'card.simD': 'Experimenta con micro:bit sen hardware físico. Matriz LED interactiva, botóns, sensores e control de Nezha en tempo real.',
  'card.ia': 'Asistente IA',
  'card.iaT': 'Titor educativo local',
  'card.iaD': 'Pregunta, aprende e xera código cunha IA que se executa no propio centro. Explícache cada liña, non cha entrega e xa está.',
  'card.ed': 'Editor',
  'card.edT': 'Código MicroPython',
  'card.edD': 'Escribe e executa código Python ao instante. Ve o resultado no simulador e experimenta sen límites.',
  'politica.titulo': 'IA local e privacidade:',
  'politica.ok': 'IA local activa',
  'politica.warn': 'Revisar o punto de IA',
  'politica.sinHistorial': 'sen gardar conversas',
  'politica.uso': 'uso guiado para robótica educativa.',
  'nav.inicio': 'Inicio',
  'nav.laboratorio': 'Laboratorio',
  'nav.vibe': 'Vibe Coding',
  'nav.pedagogia': 'Pedagoxía',
  'nav.ajustes': 'Axustes',
  'nav.iaLocal': 'IA local',
  'nav.iaActiva': 'IA activa',
  'nav.saltar': 'Ir ao contido',
  'nav.salir': 'Saír',

  'home.kicker': 'Laboratorio virtual · NEZHA + micro:bit + Makey Makey',
  'home.subtitulo': 'Aprende programación con micro:bit e Nezha mediante IA local',
  'home.vibe': 'Vibe Coding',
  'home.abrirLab': 'Abrir Laboratorio',
  'home.porQueLocal': 'Por que a IA é local',

  'sim.titulo': 'Simulador',
  'sim.activo': 'Simulador activo',
  'sim.leerTexto': 'Ler a pantalla en texto',
  'sim.ocultarTexto': 'Agochar a pantalla en texto',

  'editor.titulo': 'Código MicroPython',
  'editor.ejecutar': 'Executar código',
  'editor.ejecutando': 'Executando…',
  'editor.explicar': 'Explícame a liña',
  'editor.pensando': 'Pensando…',
  'editor.etiquetaCampo': 'O teu código MicroPython. Escribe unha instrución en cada liña.',
  'editor.cerrarExplicacion': 'Pechar a explicación',
  'editor.errorExplicacion': 'Non se puido pedir a explicación. Téntao outra vez.',

  'chat.titulo': 'Titor EDUmind',
  'chat.listo': 'Listo',
  'chat.pensando': 'Pensando…',
  'chat.enviar': 'Enviar',
  'chat.escribe': 'Escribe a túa pregunta ou solicitude…',
  'chat.esperando': 'Pensando neste ordenador. A túa pregunta non sae de aquí.',
  'chat.esperandoCodigo': 'Pensando neste ordenador. O teu código non sae de aquí.',

  'acceso.titulo': 'Como aprendo mellor',
  'acceso.kicker': 'Axustes de lectura e pantalla',
  'acceso.intro':
    'Cambia o que precises. Gárdase neste ordenador e non se envía a ningures.',
  'acceso.cerrar': 'Pechar os axustes',
  'acceso.restablecer': 'Deixalo como estaba',
  'acceso.listo': 'Listo',
  'acceso.idioma': 'Idioma',
  'acceso.idiomaDesc': 'A app e o titor falaranche nesta lingua.',

  'idioma.avisoTutor':
    'O titor de IA responderá en castelán: os modelos que caben neste servidor aínda non manexan ben esta lingua. A app si está traducida.',
  'idioma.avisoLento':
    'Nesta lingua o titor usa un modelo máis grande e tarda algo máis en responder.',
}

const ca: Textos = {
  'ejec.error':
    'El programa s’ha aturat aquí:',
  'ejec.salida':
    'El que ha escrit el teu programa:',
  'ejec.ok':
    'El programa s’ha executat bé.',
  'makey.tambien':
    'També serveix per a TeclaTecla i altres còpies: és la mateixa placa.',
  'usb.enviar':
    'Envia al micro:bit',
  'usb.enviando':
    'Preparant el programa…',
  'usb.listo':
    'Programa enviat. Si has triat la unitat MICROBIT, la placa ja s’està reiniciant amb ell.',
  'usb.ayuda':
    'Connecta el micro:bit per USB i tria la unitat MICROBIT en desar.',
  'usb.sinSoporte':
    'Aquest navegador no pot desar directament a la placa. El programa es descarregarà i el podràs arrossegar a la unitat MICROBIT.',
  'idioma.avisoTraduccion':
    'Aquesta traducció s’ha fet amb ajuda d’IA i no l’ha revisada cap parlant natiu. Pot contenir errors. Si en veus algun, digues-nos-ho.',
  'card.sim': 'Simulador',
  'card.simT': 'Laboratori virtual',
  'card.simD': 'Experimenta amb micro:bit sense maquinari físic. Matriu LED interactiva, botons, sensors i control del Nezha en temps real.',
  'card.ia': 'Assistent IA',
  'card.iaT': 'Tutor educatiu local',
  'card.iaD': 'Pregunta, aprèn i genera codi amb una IA que s\'executa al mateix centre. T\'explica cada línia, no te la dona i prou.',
  'card.ed': 'Editor',
  'card.edT': 'Codi MicroPython',
  'card.edD': 'Escriu i executa codi Python a l’instant. Mira el resultat al simulador i experimenta sense límits.',
  'politica.titulo': 'IA local i privacitat:',
  'politica.ok': 'IA local activa',
  'politica.warn': 'Cal revisar el punt d’IA',
  'politica.sinHistorial': 'sense desar converses',
  'politica.uso': 'ús guiat per a robòtica educativa.',
  'nav.inicio': 'Inici',
  'nav.laboratorio': 'Laboratori',
  'nav.vibe': 'Vibe Coding',
  'nav.pedagogia': 'Pedagogia',
  'nav.ajustes': 'Ajustos',
  'nav.iaLocal': 'IA local',
  'nav.iaActiva': 'IA activa',
  'nav.saltar': 'Vés al contingut',
  'nav.salir': 'Surt',

  'home.kicker': 'Laboratori virtual · NEZHA + micro:bit + Makey Makey',
  'home.subtitulo': 'Aprèn programació amb micro:bit i Nezha mitjançant IA local',
  'home.vibe': 'Vibe Coding',
  'home.abrirLab': 'Obre el Laboratori',
  'home.porQueLocal': 'Per què la IA és local',

  'sim.titulo': 'Simulador',
  'sim.activo': 'Simulador actiu',
  'sim.leerTexto': 'Llegeix la pantalla en text',
  'sim.ocultarTexto': 'Amaga la pantalla en text',

  'editor.titulo': 'Codi MicroPython',
  'editor.ejecutar': 'Executa el codi',
  'editor.ejecutando': 'Executant…',
  'editor.explicar': 'Explica’m la línia',
  'editor.pensando': 'Pensant…',
  'editor.etiquetaCampo': 'El teu codi MicroPython. Escriu una instrucció a cada línia.',
  'editor.cerrarExplicacion': 'Tanca l’explicació',
  'editor.errorExplicacion': 'No s’ha pogut demanar l’explicació. Torna-ho a provar.',

  'chat.titulo': 'Tutor EDUmind',
  'chat.listo': 'A punt',
  'chat.pensando': 'Pensant…',
  'chat.enviar': 'Envia',
  'chat.escribe': 'Escriu la teva pregunta o sol·licitud…',
  'chat.esperando': 'Pensant en aquest ordinador. La teva pregunta no surt d’aquí.',
  'chat.esperandoCodigo': 'Pensant en aquest ordinador. El teu codi no surt d’aquí.',

  'acceso.titulo': 'Com aprenc millor',
  'acceso.kicker': 'Ajustos de lectura i pantalla',
  'acceso.intro':
    'Canvia el que necessitis. Es desa en aquest ordinador i no s’envia enlloc.',
  'acceso.cerrar': 'Tanca els ajustos',
  'acceso.restablecer': 'Deixa-ho com estava',
  'acceso.listo': 'Fet',
  'acceso.idioma': 'Idioma',
  'acceso.idiomaDesc': 'L’app i el tutor et parlaran en aquesta llengua.',

  'idioma.avisoTutor':
    'El tutor d’IA respondrà en castellà: els models que caben en aquest servidor encara no dominen aquesta llengua. L’app sí que està traduïda.',
  'idioma.avisoLento':
    'En aquesta llengua el tutor fa servir un model més gran i triga una mica més a respondre.',
}

const eu: Textos = {
  'ejec.error':
    'Programa hemen gelditu da:',
  'ejec.salida':
    'Zure programak idatzi duena:',
  'ejec.ok':
    'Programa ondo exekutatu da.',
  'makey.tambien':
    'TeclaTecla eta beste kopietarako ere balio du: plaka bera da.',
  'usb.enviar':
    'Bidali micro:bit-era',
  'usb.enviando':
    'Programa prestatzen…',
  'usb.listo':
    'Programa bidalita. MICROBIT unitatea aukeratu baduzu, plaka berrabiarazten ari da harekin.',
  'usb.ayuda':
    'Konektatu micro:bit USB bidez eta aukeratu MICROBIT unitatea gordetzean.',
  'usb.sinSoporte':
    'Nabigatzaile honek ezin du zuzenean plakan gorde. Programa deskargatuko da eta MICROBIT unitatera arrastatu ahal izango duzu.',
  'idioma.avisoTraduccion':
    'Itzulpen hau AAren laguntzarekin egin da eta ez du hiztun natibo batek berrikusi. Akatsak izan ditzake. Baten bat ikusten baduzu, esaguzu.',
  'card.sim': 'Simulagailua',
  'card.simT': 'Laborategi birtuala',
  'card.simD': 'Esperimentatu micro:bit-ekin hardware fisikorik gabe. LED matrize interaktiboa, botoiak, sentsoreak eta Nezha denbora errealean.',
  'card.ia': 'AA laguntzailea',
  'card.iaT': 'Tutore lokala',
  'card.iaD': 'Galdetu, ikasi eta sortu kodea ikastetxean bertan exekutatzen den AA batekin. Lerro bakoitza azaltzen dizu, ez dizu bakarrik ematen.',
  'card.ed': 'Editorea',
  'card.edT': 'MicroPython kodea',
  'card.edD': 'Idatzi eta exekutatu Python kodea berehala. Ikusi emaitza simulagailuan eta esperimentatu mugarik gabe.',
  'politica.titulo': 'AA lokala eta pribatutasuna:',
  'politica.ok': 'AA lokala martxan',
  'politica.warn': 'Berrikusi AA gunea',
  'politica.sinHistorial': 'elkarrizketak gorde gabe',
  'politica.uso': 'robotika hezitzailerako erabilera gidatua.',
  'nav.inicio': 'Hasiera',
  'nav.laboratorio': 'Laborategia',
  'nav.vibe': 'Vibe Coding',
  'nav.pedagogia': 'Pedagogia',
  'nav.ajustes': 'Ezarpenak',
  'nav.iaLocal': 'AA lokala',
  'nav.iaActiva': 'AA martxan',
  'nav.saltar': 'Joan edukira',
  'nav.salir': 'Irten',

  'home.kicker': 'Laborategi birtuala · NEZHA + micro:bit + Makey Makey',
  'home.subtitulo': 'Ikasi programatzen micro:bit eta Nezha erabiliz, AA lokalarekin',
  'home.vibe': 'Vibe Coding',
  'home.abrirLab': 'Ireki Laborategia',
  'home.porQueLocal': 'Zergatik den lokala AA',

  'sim.titulo': 'Simulagailua',
  'sim.activo': 'Simulagailua martxan',
  'sim.leerTexto': 'Irakurri pantaila testuan',
  'sim.ocultarTexto': 'Ezkutatu pantaila testuan',

  'editor.titulo': 'MicroPython kodea',
  'editor.ejecutar': 'Exekutatu kodea',
  'editor.ejecutando': 'Exekutatzen…',
  'editor.explicar': 'Azaldu lerroa',
  'editor.pensando': 'Pentsatzen…',
  'editor.etiquetaCampo': 'Zure MicroPython kodea. Idatzi agindu bat lerro bakoitzean.',
  'editor.cerrarExplicacion': 'Itxi azalpena',
  'editor.errorExplicacion': 'Ezin izan da azalpena eskatu. Saiatu berriro.',

  'chat.titulo': 'EDUmind tutorea',
  'chat.listo': 'Prest',
  'chat.pensando': 'Pentsatzen…',
  'chat.enviar': 'Bidali',
  'chat.escribe': 'Idatzi zure galdera edo eskaera…',
  'chat.esperando': 'Ordenagailu honetan pentsatzen. Zure galdera ez da hemendik ateratzen.',
  'chat.esperandoCodigo': 'Ordenagailu honetan pentsatzen. Zure kodea ez da hemendik ateratzen.',

  'acceso.titulo': 'Nola ikasten dut hobeto',
  'acceso.kicker': 'Irakurketa eta pantaila ezarpenak',
  'acceso.intro':
    'Aldatu behar duzuna. Ordenagailu honetan gordetzen da eta ez da inora bidaltzen.',
  'acceso.cerrar': 'Itxi ezarpenak',
  'acceso.restablecer': 'Utzi lehen bezala',
  'acceso.listo': 'Prest',
  'acceso.idioma': 'Hizkuntza',
  'acceso.idiomaDesc': 'Aplikazioak eta tutoreak hizkuntza honetan hitz egingo dizute.',

  'idioma.avisoTutor':
    'AA tutoreak gaztelaniaz erantzungo du: zerbitzari honetan sartzen diren ereduek ez dute oraindik euskara behar bezala menderatzen. Aplikazioa bai, itzulita dago.',
  'idioma.avisoLento':
    'Hizkuntza honetan tutoreak eredu handiago bat erabiltzen du eta pixka bat gehiago behar du erantzuteko.',
}

const en: Textos = {
  'ejec.error':
    'Your program stopped here:',
  'ejec.salida':
    'What your program printed:',
  'ejec.ok':
    'The program ran fine.',
  'makey.tambien':
    'Works the same for TeclaTecla and other clones: it is the same board.',
  'usb.enviar':
    'Send to micro:bit',
  'usb.enviando':
    'Preparing the program…',
  'usb.listo':
    'Program sent. If you chose the MICROBIT drive, the board is already restarting with it.',
  'usb.ayuda':
    'Plug the micro:bit in over USB and choose the MICROBIT drive when saving.',
  'usb.sinSoporte':
    'This browser cannot save straight to the board. The program will download and you can drag it onto the MICROBIT drive.',
  'idioma.avisoTraduccion':
    'This translation was made with AI help and has not been reviewed by a native speaker. It may contain mistakes. If you spot one, tell us.',
  'card.sim': 'Simulator',
  'card.simT': 'Virtual lab',
  'card.simD': 'Experiment with micro:bit without physical hardware. Interactive LED matrix, buttons, sensors and live Nezha control.',
  'card.ia': 'AI assistant',
  'card.iaT': 'Local teaching tutor',
  'card.iaD': 'Ask, learn and generate code with an AI that runs in the school itself. It explains every line instead of just handing it over.',
  'card.ed': 'Editor',
  'card.edT': 'MicroPython code',
  'card.edD': 'Write and run Python code instantly. See the result in the simulator and experiment freely.',
  'politica.titulo': 'Local AI and privacy:',
  'politica.ok': 'Local AI running',
  'politica.warn': 'Check the AI endpoint',
  'politica.sinHistorial': 'conversations not stored',
  'politica.uso': 'guided use for educational robotics.',
  'nav.inicio': 'Home',
  'nav.laboratorio': 'Lab',
  'nav.vibe': 'Vibe Coding',
  'nav.pedagogia': 'Teaching',
  'nav.ajustes': 'Settings',
  'nav.iaLocal': 'Local AI',
  'nav.iaActiva': 'AI working',
  'nav.saltar': 'Skip to content',
  'nav.salir': 'Sign out',

  'home.kicker': 'Virtual lab · NEZHA + micro:bit + Makey Makey',
  'home.subtitulo': 'Learn to code with micro:bit and Nezha, using AI that runs locally',
  'home.vibe': 'Vibe Coding',
  'home.abrirLab': 'Open the Lab',
  'home.porQueLocal': 'Why the AI runs here',

  'sim.titulo': 'Simulator',
  'sim.activo': 'Simulator running',
  'sim.leerTexto': 'Read the screen as text',
  'sim.ocultarTexto': 'Hide the screen text',

  'editor.titulo': 'MicroPython code',
  'editor.ejecutar': 'Run code',
  'editor.ejecutando': 'Running…',
  'editor.explicar': 'Explain line',
  'editor.pensando': 'Thinking…',
  'editor.etiquetaCampo': 'Your MicroPython code. Write one instruction per line.',
  'editor.cerrarExplicacion': 'Close the explanation',
  'editor.errorExplicacion': 'The explanation could not be requested. Try again.',

  'chat.titulo': 'EDUmind tutor',
  'chat.listo': 'Ready',
  'chat.pensando': 'Thinking…',
  'chat.enviar': 'Send',
  'chat.escribe': 'Type your question or request…',
  'chat.esperando': 'Thinking on this computer. Your question stays here.',
  'chat.esperandoCodigo': 'Thinking on this computer. Your code stays here.',

  'acceso.titulo': 'How I learn best',
  'acceso.kicker': 'Reading and display settings',
  'acceso.intro':
    'Change whatever you need. It is saved on this computer and never sent anywhere.',
  'acceso.cerrar': 'Close settings',
  'acceso.restablecer': 'Put it back',
  'acceso.listo': 'Done',
  'acceso.idioma': 'Language',
  'acceso.idiomaDesc': 'The app and the tutor will speak to you in this language.',

  'idioma.avisoTutor':
    'The AI tutor will answer in Spanish: the models that fit on this server do not handle this language well yet. The app itself is translated.',
  'idioma.avisoLento':
    'In this language the tutor uses a larger model and takes a little longer to answer.',
}

const zh: Textos = {
  'ejec.error':
    '程序在这里停下了：',
  'ejec.salida':
    '程序输出的内容：',
  'ejec.ok':
    '程序运行正常。',
  'makey.tambien':
    'TeclaTecla 等仿制品同样适用：是同一块板子。',
  'usb.enviar':
    '发送到 micro:bit',
  'usb.enviando':
    '正在准备程序…',
  'usb.listo':
    '程序已发送。如果你选择了 MICROBIT 磁盘，开发板正在用它重启。',
  'usb.ayuda':
    '用 USB 连接 micro:bit，保存时选择 MICROBIT 磁盘。',
  'usb.sinSoporte':
    '此浏览器无法直接保存到开发板。程序会下载，你可以把它拖到 MICROBIT 磁盘上。',
  'idioma.avisoTraduccion':
    '本翻译由 AI 协助完成，未经母语者审校，可能存在错误。如果你发现问题，请告诉我们。',
  'card.sim': '模拟器',
  'card.simT': '虚拟实验室',
  'card.simD': '无需实体硬件即可试验 micro:bit。可交互的 LED 点阵、按键、传感器，以及 Nezha 的实时控制。',
  'card.ia': 'AI 助教',
  'card.iaT': '本地教学导师',
  'card.iaD': '向在学校本地运行的 AI 提问、学习并生成代码。它会讲解每一行，而不是直接给你答案。',
  'card.ed': '编辑器',
  'card.edT': 'MicroPython 代码',
  'card.edD': '即时编写并运行 Python 代码。在模拟器中查看结果，自由试验。',
  'politica.titulo': '本地 AI 与隐私：',
  'politica.ok': '本地 AI 运行中',
  'politica.warn': '请检查 AI 节点',
  'politica.sinHistorial': '不保存对话',
  'politica.uso': '面向教育机器人的引导式使用。',
  'nav.inicio': '首页',
  'nav.laboratorio': '实验室',
  'nav.vibe': '灵感编程',
  'nav.pedagogia': '教学理念',
  'nav.ajustes': '设置',
  'nav.iaLocal': '本地 AI',
  'nav.iaActiva': 'AI 运行中',
  'nav.saltar': '跳到主要内容',
  'nav.salir': '退出',

  'home.kicker': '虚拟实验室 · NEZHA + micro:bit + Makey Makey',
  'home.subtitulo': '用 micro:bit 和 Nezha 学编程，AI 就跑在本地',
  'home.vibe': '灵感编程',
  'home.abrirLab': '打开实验室',
  'home.porQueLocal': '为什么 AI 在本地运行',

  'sim.titulo': '模拟器',
  'sim.activo': '模拟器运行中',
  'sim.leerTexto': '用文字读出屏幕',
  'sim.ocultarTexto': '隐藏文字说明',

  'editor.titulo': 'MicroPython 代码',
  'editor.ejecutar': '运行代码',
  'editor.ejecutando': '运行中…',
  'editor.explicar': '讲解这一行',
  'editor.pensando': '思考中…',
  'editor.etiquetaCampo': '你的 MicroPython 代码。每行写一条指令。',
  'editor.cerrarExplicacion': '关闭讲解',
  'editor.errorExplicacion': '无法获取讲解，请再试一次。',

  'chat.titulo': 'EDUmind 导师',
  'chat.listo': '就绪',
  'chat.pensando': '思考中…',
  'chat.enviar': '发送',
  'chat.escribe': '输入你的问题或需求…',
  'chat.esperando': '正在这台电脑上思考。你的问题不会离开这里。',
  'chat.esperandoCodigo': '正在这台电脑上思考。你的代码不会离开这里。',

  'acceso.titulo': '我怎样学得更好',
  'acceso.kicker': '阅读与显示设置',
  'acceso.intro': '按需要调整。设置保存在这台电脑上，不会发送到任何地方。',
  'acceso.cerrar': '关闭设置',
  'acceso.restablecer': '恢复原样',
  'acceso.listo': '完成',
  'acceso.idioma': '语言',
  'acceso.idiomaDesc': '应用和导师都会用这种语言和你交流。',

  'idioma.avisoTutor':
    'AI 导师将用西班牙语回答：这台服务器能运行的模型还不能很好地使用这种语言。界面本身已翻译。',
  'idioma.avisoLento': '这种语言下导师会使用更大的模型，回答会稍慢一些。',
}

const TABLAS: Record<Idioma, Textos> = { es, gl, ca, eu, en, zh }

/*
 * Busca la clave en la lengua elegida y, si falta, cae al castellano en lugar
 * de mostrar la clave cruda: un texto en otra lengua se entiende; "nav.salir"
 * en pantalla, no.
 */
export function traducir(idioma: Idioma, clave: string): string {
  return TABLAS[idioma]?.[clave] ?? es[clave] ?? clave
}
