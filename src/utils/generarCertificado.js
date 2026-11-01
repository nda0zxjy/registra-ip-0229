import { jsPDF } from "jspdf";
import QRCode from "qrcode";

// Textos personalizados del certificado (cámbialos aquí)
const REGISTRADO_POR = "2025350229"; // tu boleta
const FOLIO_PERSONALIZADO = "OBRA 0229";

// Paleta REGISTRA-IP (RGB)
const CORAL = [255, 100, 85]; // #ff6455
const CORAL_OSCURO = [201, 59, 44]; // #c93b2c
const DURAZNO = [255, 245, 242]; // #fff5f2
const DURAZNO_SUAVE = [255, 232, 227]; // #ffe8e3
const TINTA = [43, 20, 17]; // #2b1411
const BLANCO = [255, 255, 255];

// Centro de la columna izquierda (de x = 25 a x = 230)
const CENTRO = 127.5;

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Reduce la letra hasta que el texto quepa en una línea
function ajustarFuente(doc, texto, anchoMax, tamanoInicial, tamanoMin = 10) {
  let tamano = tamanoInicial;
  doc.setFontSize(tamano);
  while (tamano > tamanoMin && doc.getTextWidth(texto) > anchoMax) {
    tamano -= 1;
    doc.setFontSize(tamano);
  }
}

export async function generarCertificado(obra) {
  // A4 horizontal: 297 x 210 mm
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  /* ---------- 1. Estructura: fondo y franjas ---------- */
  doc.setFillColor(...CORAL);
  doc.roundedRect(6, 6, 285, 198, 8, 8, "F"); // franja superior e inferior
  doc.setFillColor(...DURAZNO);
  doc.rect(6, 20, 285, 170, "F"); // área central

  doc.setTextColor(...TINTA);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("REGISTRA-IP", 25, 15.2);
  doc.setFontSize(9);
  doc.text("REGISTRA-IP · Plataforma de registro", 148.5, 198.2, { align: "center" });

  /* ---------- 2. Folio (arriba a la derecha) ---------- */
  doc.setFillColor(...DURAZNO_SUAVE);
  doc.setDrawColor(...CORAL_OSCURO);
  doc.setLineWidth(0.5);
  doc.roundedRect(205, 24, 78, 13, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Folio:", 209, 32.2);
  doc.setFont("courier", "bold");
  doc.text(obra.folio, 224, 32.2);

  /* ---------- 3. Título: lo primero que se lee ---------- */
  doc.setFillColor(...CORAL);
  doc.roundedRect(25, 40, 205, 24, 8, 8, "F");
  doc.setTextColor(...TINTA);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.text("CERTIFICADO", CENTRO, 57, { align: "center" });

  doc.setFontSize(13);
  doc.text("DE REGISTRO DE AUTORÍA", CENTRO, 72, { align: "center" });

  /* ---------- 4. Autor ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Se otorga el certificado a:", CENTRO, 86, { align: "center" });

  doc.setFillColor(...DURAZNO_SUAVE);
  doc.setDrawColor(...CORAL_OSCURO);
  doc.setLineWidth(0.5);
  doc.roundedRect(25, 89, 205, 20, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  ajustarFuente(doc, obra.autor, 185, 20);
  doc.text(obra.autor, CENTRO, 102, { align: "center" });
  doc.setDrawColor(...TINTA);
  doc.setLineWidth(0.3);
  doc.line(40, 105.5, 215, 105.5);

  /* ---------- 5. Obra ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Por el registro de la obra:", CENTRO, 122, { align: "center" });

  doc.setFillColor(...DURAZNO_SUAVE);
  doc.setDrawColor(...CORAL_OSCURO);
  doc.setLineWidth(0.5);
  doc.roundedRect(25, 125, 205, 24, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  let lineasObra = doc.splitTextToSize(obra.titulo, 190);
  if (lineasObra.length > 2) {
    lineasObra = lineasObra.slice(0, 2);
    lineasObra[1] = `${lineasObra[1].slice(0, -3)}...`;
  }
  const yObra = 137 - (lineasObra.length - 1) * 3.5;
  doc.text(lineasObra, CENTRO, yObra, { align: "center", lineHeightFactor: 1.2 });
  doc.setDrawColor(...TINTA);
  doc.setLineWidth(0.3);
  doc.line(40, 145.5, 215, 145.5);

  /* ---------- 6. Fecha ---------- */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Fecha de registro: ${formatearFecha(obra.fechaRegistro)}`, CENTRO, 157, {
    align: "center",
  });

  /* ---------- 7. Leyenda personalizada ---------- */
  doc.setFillColor(...DURAZNO_SUAVE);
  doc.setDrawColor(...CORAL_OSCURO);
  doc.setLineWidth(0.5);
  doc.roundedRect(55, 163, 145, 22, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Registrado por: ${REGISTRADO_POR} (Boleta)`, CENTRO, 171, { align: "center" });
  doc.text(`Folio personalizado: ${FOLIO_PERSONALIZADO}`, CENTRO, 179, { align: "center" });

  /* ---------- 8. Código QR con el folio (derecha) ---------- */
  const qr = await QRCode.toDataURL(obra.folio, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 400,
    color: { dark: "#000000", light: "#ffffff" },
  });

  doc.setFillColor(...BLANCO);
  doc.setDrawColor(...CORAL_OSCURO);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 1.5], 0);
  doc.roundedRect(238, 78, 46, 46, 3, 3, "FD");
  doc.setLineDashPattern([], 0);
  doc.addImage(qr, "PNG", 241, 81, 40, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Escanea para leer el folio", 261, 129.5, { align: "center" });

  doc.save(`certificado-${obra.folio}.pdf`);
}
