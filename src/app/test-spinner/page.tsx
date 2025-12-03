// Test page for LoadingSpinner component
import LoadingSpinner from '@/components/ui/LoadingSpiner';

export default function TestSpinnerPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test LoadingSpinner - Todos los Variants</h1>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>Variants Disponibles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Spinner (default)</strong></p>
            <LoadingSpinner variant="spinner" size="lg" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Dots</strong></p>
            <LoadingSpinner variant="dots" size="lg" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Pulse</strong></p>
            <LoadingSpinner variant="pulse" size="lg" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p><strong>Bars</strong></p>
            <LoadingSpinner variant="bars" size="lg" />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Tamaños (Size) - Variant: Spinner</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <p>Small (sm)</p>
            <LoadingSpinner variant="spinner" size="sm" />
          </div>
          <div>
            <p>Medium (md)</p>
            <LoadingSpinner variant="spinner" size="md" />
          </div>
          <div>
            <p>Large (lg)</p>
            <LoadingSpinner variant="spinner" size="lg" />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Tamaños (Size) - Variant: Dots</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <p>Small</p>
            <LoadingSpinner variant="dots" size="sm" />
          </div>
          <div>
            <p>Medium</p>
            <LoadingSpinner variant="dots" size="md" />
          </div>
          <div>
            <p>Large</p>
            <LoadingSpinner variant="dots" size="lg" />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Con texto</h2>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <LoadingSpinner variant="spinner" size="md" text="Cargando..." />
          <LoadingSpinner variant="dots" size="md" text="Procesando..." />
          <LoadingSpinner variant="pulse" size="md" text="Esperando..." />
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Overlay (descomenta para probar)</h2>
        <p style={{ color: '#999' }}>
          Descomenta la línea de abajo para ver el overlay fullscreen:
        </p>
        {/* <LoadingSpinner variant="spinner" overlay size="lg" text="Cargando página..." /> */}
      </section>
    </div>
  );
}
