import jsPDF from 'jspdf';

// Fungsi untuk mencetak pesanan sebagai PDF
export function printOrderAsPDF(order) {
    const doc = new jsPDF();
    doc.text(`Order ID: ${order.id}`, 10, 10);
    doc.text(`Name: ${order.name}`, 10, 20);
    doc.text(`Price: ${order.price}`, 10, 30);
    doc.addImage(order.image, 'JPEG', 10, 40, 180, 160);
    doc.save(`Order_${order.id}.pdf`);
}
