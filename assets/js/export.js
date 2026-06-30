const Exporter = (() => {
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function toJson(data, filename = 'export.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
  }

  function toCsv(rows, filename = 'export.csv') {
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, filename);
  }

  function toYaml(data, filename = 'export.yaml') {
    function objToYaml(obj, indent = 0) {
      const pad = '  '.repeat(indent);
      if (Array.isArray(obj)) return obj.map(v => `${pad}- ${objToYaml(v, indent + 1).trimStart()}`).join('\n');
      if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj).map(([k, v]) => {
          const val = objToYaml(v, indent + 1);
          return typeof v === 'object' && v !== null ? `${pad}${k}:\n${val}` : `${pad}${k}: ${val}`;
        }).join('\n');
      }
      return String(obj);
    }
    const blob = new Blob([objToYaml(data)], { type: 'text/yaml' });
    downloadBlob(blob, filename);
  }

  function canvasToPng(canvas, filename = 'export.png') {
    canvas.toBlob(blob => downloadBlob(blob, filename), 'image/png');
  }

  function canvasToSvg(svgElement, filename = 'export.svg') {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgElement);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    downloadBlob(blob, filename);
  }

  function chartToPng(chart, filename = 'chart.png') {
    const url = chart.toBase64Image();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => Toast.show(I18n.t('messages.copied'), 'success'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      Toast.show(I18n.t('messages.copied'), 'success');
    }
  }

  return { toJson, toCsv, toYaml, canvasToPng, canvasToSvg, chartToPng, copyText };
})();
