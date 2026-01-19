<template>
	<div ref="printContainer" class="aler-pdf-root">
		<header class="pdf-header">
			<h1>{{ alert?.title || 'Reporte de Alerta' }}</h1>
		</header>

		<section class="pdf-body">
			<p><strong>Tipo:</strong> {{ alert?.type_event?.name || '—' }}</p>
			<p><strong>Fecha:</strong> {{ alert?.date || '—' }} {{ alert?.time || '' }}</p>
			<p><strong>Localización:</strong>
				{{ alert?.district?.name || '—' }}
				<span v-if="alert?.district?.province"> / {{ alert.district.province?.name || '' }}</span>
				<span v-if="alert?.district?.province?.region"> / {{ alert.district.province.region?.name || '' }}</span>
			</p>

			<h3>Descripción</h3>
			<div v-if="alert?.message" v-html="alert.message"></div>

			<div v-if="alert?.evidences?.length" class="evidences">
				<h4>Evidencias</h4>
				<ul>
					<li v-for="e in alert.evidences" :key="e.id">
						<a :href="e.file_path" target="_blank" rel="noopener noreferrer">{{ e.description || 'Ver' }}</a>
					</li>
				</ul>
			</div>
		</section>

		<footer class="pdf-footer">
			<small>Generado: {{ new Date().toLocaleString() }}</small>
		</footer>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
	alert: { type: Object, default: null }
})

const printContainer = ref(null)

const printableStyles = `
	:root { --primary: #ce0121; --text: #222; }
	body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin: 20px; color: var(--text); }
	.pdf-header h1 { margin: 0 0 8px 0; color: var(--primary); }
	.pdf-body { margin-top: 8px; font-size: 14px; line-height: 1.4; }
	.pdf-body img { max-width: 100%; height: auto; }
	.pdf-footer { margin-top: 20px; font-size: 12px; color: #666; }
	@media print {
		body { margin: 0.5cm; }
		.no-print { display: none !important; }
	}
`

function openInNewWindow() {
	if (!printContainer.value) return
	const content = printContainer.value.innerHTML
		const html = '<!doctype html>' +
			'<html>' +
			'<head>' +
			'<meta charset="utf-8">' +
			'<title>Imprimir</title>' +
			'<style>' + printableStyles + '</style>' +
			'</head>' +
			'<body>' + content +
			'<script>' +
			'window.onload = function() { setTimeout(function(){ window.focus(); window.print(); }, 150); }' +
			'</' + 'script>' +
			'</body>' +
			'</html>'
		const w = window.open('', '_blank', 'noopener')
	if (!w) { console.warn('Pop-up bloqueado.'); return }
	w.document.open()
	w.document.write(html)
	w.document.close()
}

function printInIframe() {
	if (!printContainer.value) return
	const content = printContainer.value.innerHTML
	const iframe = document.createElement('iframe')
	iframe.style.position = 'fixed'
	iframe.style.right = '0'
	iframe.style.bottom = '0'
	iframe.style.width = '0'
	iframe.style.height = '0'
	iframe.style.border = '0'
	document.body.appendChild(iframe)

	const doc = iframe.contentWindow?.document
	if (!doc) return
		doc.open()
		doc.write('<!doctype html>' +
			'<html>' +
			'<head>' +
			'<meta charset="utf-8">' +
			'<style>' + printableStyles + '</style>' +
			'</head>' +
			'<body>' + content + '</body>' +
			'</html>')
	doc.close()
	iframe.contentWindow?.focus()
	setTimeout(() => {
		try {
			iframe.contentWindow?.print()
		} finally {
			setTimeout(() => document.body.removeChild(iframe), 500)
		}
	}, 200)
}

defineExpose({ openInNewWindow, printInIframe })
</script>

<style scoped>
.aler-pdf-root { color: #222; }

.pdf-header {
  border-block-end: 2px solid rgb(0 0 0 / 6%);
  margin-block-end: 10px;
  padding-block-end: 6px;
}
</style>
