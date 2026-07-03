import { C } from '../lib/theme'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '28px' }}>
    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: C.accent }}>{title}</h2>
    <div style={{ fontSize: '13px', color: C.muted, lineHeight: 1.8 }}>{children}</div>
  </div>
)

export function TermsPage({ onClose }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '40px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {onClose && <button onClick={onClose} style={{ marginBottom: '24px', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '13px' }}>← Volver</button>}
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Términos y Condiciones</h1>
        <p style={{ fontSize: '12px', color: C.dim, marginBottom: '32px' }}>Última actualización: 3 de julio de 2026</p>

        <Section title="1. Aceptación de los términos">
          Al registrarte y utilizar Operata, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, no debes usar el servicio.
        </Section>

        <Section title="2. Descripción del servicio">
          Operata es una plataforma SaaS de diario de trading que permite a los usuarios registrar, analizar y gestionar sus operaciones financieras. El servicio se ofrece en modalidad gratuita (hasta 20 operaciones) y de pago (Plan Pro, sin límite de operaciones).
        </Section>

        <Section title="3. Registro y cuenta">
          <p>Para usar Operata debes crear una cuenta con información verídica. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.</p>
          <br/>
          <p>Nos reservamos el derecho de suspender o cancelar cuentas que incumplan estos términos o que realicen actividades fraudulentas.</p>
        </Section>

        <Section title="4. Planes y pagos">
          <p><b>Plan Gratuito:</b> Hasta 20 operaciones, funciones básicas de análisis. Sin cargo.</p>
          <br/>
          <p><b>Plan Pro:</b> $7.99 USD/mes o $59.99 USD/año. Incluye operaciones ilimitadas, analytics avanzados, importación/exportación CSV y todas las funciones Premium.</p>
          <br/>
          <p>Los pagos se procesan a través de Stripe. Al suscribirte al Plan Pro autorizas cargos recurrentes en tu método de pago. Puedes cancelar en cualquier momento desde tu cuenta — la cancelación aplica al final del período de facturación en curso.</p>
        </Section>

        <Section title="5. Política de reembolsos">
          Los pagos no son reembolsables salvo que la ley aplicable lo requiera. Si experimentas problemas técnicos graves que impidan el uso del servicio, evalúa tu caso contactándonos.
        </Section>

        <Section title="6. Uso aceptable">
          <p>Te comprometes a no usar Operata para:</p>
          <ul style={{ marginLeft: '16px', marginTop: '8px' }}>
            <li>Actividades ilegales o fraudulentas</li>
            <li>Intentar acceder a datos de otros usuarios</li>
            <li>Interferir con el funcionamiento del servicio</li>
            <li>Revender o redistribuir el acceso al servicio</li>
          </ul>
        </Section>

        <Section title="7. Propiedad intelectual">
          Todo el contenido, código, diseño y funcionalidades de Operata son propiedad de sus desarrolladores. El usuario conserva la propiedad de los datos que registra en la plataforma.
        </Section>

        <Section title="8. Descargo de responsabilidad financiera">
          <b>Operata es una herramienta de registro y análisis, no un asesor financiero.</b> La información y métricas mostradas son de carácter informativo. Operata no recomienda inversiones ni garantiza resultados. Las decisiones de inversión son responsabilidad exclusiva del usuario.
        </Section>

        <Section title="9. Limitación de responsabilidad">
          Operata no será responsable por pérdidas financieras derivadas del uso o mal uso de la plataforma, interrupciones del servicio, o errores en los cálculos derivados de datos incorrectos ingresados por el usuario.
        </Section>

        <Section title="10. Modificaciones">
          Nos reservamos el derecho de modificar estos términos. Te notificaremos cambios significativos por email. El uso continuado del servicio implica aceptación de los términos actualizados.
        </Section>

        <Section title="11. Ley aplicable">
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa se resolverá ante los tribunales competentes de la Ciudad de México.
        </Section>

        <Section title="12. Contacto">
          Para preguntas sobre estos términos escríbenos a operata.soporte@gmail.com
        </Section>
      </div>
    </div>
  )
}

export function PrivacyPage({ onClose }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '40px 20px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {onClose && <button onClick={onClose} style={{ marginBottom: '24px', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '13px' }}>← Volver</button>}
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Política de Privacidad</h1>
        <p style={{ fontSize: '12px', color: C.dim, marginBottom: '32px' }}>Última actualización: 3 de julio de 2026</p>

        <Section title="1. Información que recopilamos">
          <p><b>Datos de cuenta:</b> nombre, correo electrónico, contraseña (cifrada).</p>
          <br/>
          <p><b>Datos de trading:</b> operaciones, capturas de pantalla, estrategias, cuentas y configuraciones que el usuario registra voluntariamente.</p>
          <br/>
          <p><b>Datos de uso:</b> información técnica como dirección IP, tipo de navegador y páginas visitadas para mejorar el servicio.</p>
          <br/>
          <p><b>Datos de pago:</b> procesados íntegramente por Stripe. Operata no almacena datos de tarjetas de crédito.</p>
        </Section>

        <Section title="2. Cómo usamos tu información">
          <ul style={{ marginLeft: '16px' }}>
            <li>Proveer y mejorar el servicio</li>
            <li>Procesar pagos y gestionar suscripciones</li>
            <li>Enviarte comunicaciones relacionadas con tu cuenta</li>
            <li>Resolver problemas técnicos y de soporte</li>
          </ul>
          <br/>
          <p>No vendemos, alquilamos ni compartimos tu información personal con terceros para fines de marketing.</p>
        </Section>

        <Section title="3. Almacenamiento de datos">
          Tus datos se almacenan en servidores seguros provistos por Supabase (base de datos) y Vercel (infraestructura). Las capturas de pantalla se almacenan en Supabase Storage. Todos los proveedores cumplen estándares de seguridad internacionales.
        </Section>

        <Section title="4. Seguridad">
          Implementamos medidas técnicas y organizativas para proteger tu información, incluyendo cifrado en tránsito (HTTPS) y en reposo. Sin embargo, ningún sistema es 100% seguro — te recomendamos usar contraseñas fuertes y únicas.
        </Section>

        <Section title="5. Tus derechos">
          <p>Tienes derecho a:</p>
          <ul style={{ marginLeft: '16px', marginTop: '8px' }}>
            <li>Acceder a tus datos personales</li>
            <li>Corregir información incorrecta</li>
            <li>Solicitar la eliminación de tu cuenta y datos</li>
            <li>Exportar tus datos (Plan Pro)</li>
          </ul>
          <br/>
          <p>Para ejercer estos derechos, contáctanos a través de la plataforma.</p>
        </Section>

        <Section title="6. Cookies">
          Operata utiliza cookies técnicas esenciales para el funcionamiento del servicio (sesión de usuario). No utilizamos cookies de seguimiento ni publicidad.
        </Section>

        <Section title="7. Menores de edad">
          Operata no está dirigido a personas menores de 18 años. No recopilamos intencionalmente datos de menores.
        </Section>

        <Section title="8. Cambios a esta política">
          Notificaremos cambios significativos por email o mediante aviso en la plataforma. El uso continuado implica aceptación de la política actualizada.
        </Section>

        <Section title="9. Contacto">
          Para preguntas sobre privacidad o ejercer tus derechos escríbenos a operata.soporte@gmail.com
        </Section>
      </div>
    </div>
  )
}
