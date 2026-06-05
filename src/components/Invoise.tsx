import { useContext } from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
import { StoreContext } from "../StorenameContext";

// ✅ Register an Arabic-supporting font
Font.register({
  family: "Almohand",
  src: "/AL-Mohanad.ttf", // or use your own hosted .ttf
});
// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    // fontFamily: "Tajawal", // ✅ Use the registered font
    fontSize: 12,
    fontFamily: "Almohand",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: "#4a90e2",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4a90e2",
  },
  date: {
    fontSize: 12,
    color: "#777",
  },
  billToSection: {
    marginBottom: 25,
  },
  billToTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  billToText: {
    fontSize: 12,
    marginBottom: 3,
    color: "#555",
  },
  addressText: {
    fontSize: 12,
    color: "#555",
    marginTop: 3,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#222",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    paddingBottom: 4,
  },
  colItem: {
    width: "40%",
    fontSize: 12,
    color: "#333",
  },
  colQty: {
    width: "20%",
    textAlign: "right",
    fontSize: 12,
    color: "#333",
  },
  colPrice: {
    width: "20%",
    textAlign: "right",
    fontSize: 12,
    color: "#333",
  },
  colTotal: {
    width: "20%",
    textAlign: "right",
    fontSize: 12,
    color: "#333",
  },
  totalsSection: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  subtotalText: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a90e2",
  },
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    borderTopStyle: "solid",
    paddingTop: 15,
    textAlign: "center",
    fontSize: 10,
    color: "#999",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  column: {
    flexDirection: "column",
    width: "48%", // roughly half the page width
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    width: 100,
    color: "#333",
  },
  value: {
    flex: 1,
    color: "#555",
  },
});

const Invoise = ({ order }: { order: any }) => {
  const storeName = useContext(StoreContext);

  if (!order) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>No order data available.</Text>
        </Page>
      </Document>
    );
  }

  const calculateSubtotal = () =>
    order.orderItems.reduce((total: any, item: any) => total + item.qty * item.price, 0).toFixed(3);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString("en-GB")}</Text>
        </View>

        {/* Bill To */}
        <View style={styles.container}>
          {/* Left side: Name, Email, Phone */}
          <View style={styles.column}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{order.user.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{order.user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{order.user.phone}</Text>
            </View>
          </View>

          {/* Right side: Address */}
          <View style={styles.column}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Governorate:</Text>
              <Text style={styles.value}>{order.shippingAddress.governorate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>City:</Text>
              <Text style={styles.value}>{order.shippingAddress.city}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Block:</Text>
              <Text style={styles.value}>{order.shippingAddress.block}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Street:</Text>
              <Text style={styles.value}>{order.shippingAddress.street}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>House:</Text>
              <Text style={styles.value}>{order.shippingAddress.house}</Text>
            </View>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colItem, styles.tableHeaderText]}>Item</Text>
          <Text style={[styles.colItem, styles.tableHeaderText]}>Variants</Text>
          <Text style={[styles.colQty, styles.tableHeaderText]}>Quantity</Text>
          <Text style={[styles.colPrice, styles.tableHeaderText]}>Price (KD)</Text>
          <Text style={[styles.colTotal, styles.tableHeaderText]}>Total (KD)</Text>
        </View>

        {/* Table Rows */}
        {order.orderItems.map((item: any) => (
          <View key={item._id} style={styles.tableRow}>
            <Text style={styles.colItem}>{item.name}</Text>
            {item.variantColor && item.variantSize ? (
              <Text style={styles.colItem}>
                {item.variantColor} / {item.variantSize}
              </Text>
            ) : (
              <Text style={styles.colItem}>-/-</Text>
            )}
            <Text style={styles.colQty}>{item.qty}</Text>
            <Text style={styles.colPrice}>{item.price.toFixed(3)}</Text>
            <Text style={styles.colTotal}>{(item.qty * item.price).toFixed(3)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <Text style={styles.subtotalText}>Subtotal: {calculateSubtotal()} KD</Text>
          <Text style={styles.subtotalText}>Delivery: {order.shippingPrice.toFixed(3)} KD</Text>
          <Text style={styles.totalText}>Total: {order.totalPrice.toFixed(3)} KD</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business</Text>
          <Text>{storeName}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default Invoise;
