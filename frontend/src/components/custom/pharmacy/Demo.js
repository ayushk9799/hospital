const itemSchema = [
    {
      id : "item12",
      name : "Dolo 650",
      type : "Tablet",
      category : "Pain Relief",
      CP : 10,
      MRP : 12,
      stock : 100,
      expiryDate : "2024-12-31",
      supplierId : "sup12",
      orderId : ["order1","order2","order3"],
      billId : ["bill1","bill2","bill3"],
    }
]

const supplierSchema = [
    {
        id : "sup12",
        name : "ABC Suppliers",
        address : "123 Main St, New York, NY 10001",
        phone : "1234567890",
        email : "abc@example.com",
        orderId : ["order1","order2","order3"],
        itemId : ["item12","item13","item14"],
        payments : [{orderID : "order1",amount : 100,date : "2024-12-31"},{orderID : "order2",amount : 200,date : "2024-12-31"},{orderID : "order3",amount : 300,date : "2024-12-31"}],
    }
]

const orderSchema = [
    {
        id : "order1",
        items : [{itemId : "item12",quantity : 10, cp : 10},{itemId : "item13",quantity : 10, cp : 10}],
        amount : 100,
        supplierID: "sup12",
        createdAt : "2024-12-31",
        deliveryDate : "2024-12-31",
        status : "pending",
        payments : [{orderID : "order1",amount : 100,date : "2024-12-31"},{orderID : "order2",amount : 200,date : "2024-12-31"},{orderID : "order3",amount : 300,date : "2024-12-31"}],
    }
]

const billSchema = [
    {
        id : "bill1",
        patientID : "patient1", // patient is regiested
        name : "John Doe",
        phone : "1234567890",
        buyerName : "John Doe",
        paymentStatus : "pending",
        paymentMethod : "cash",
        createdAt : "2024-12-31", // find time and date both
        status : "pending", // pending, paid
        items : [{itemId : "item12", quantity : 10, sp : 20,}],
        amount : 100,
        createdBy : "user1",
    }
]

export const supplierArray = [
  {
    id: "SID145",
    name: "ABC Pharmaceuticals",
    lastPurchased: "2023-04-15",
    address: "123 Pharma St, Med City, MC 12345",
    contactNumber: "+1 (555) 123-4567",
    email: "contact@abcpharma.com",
    totalPurchaseValue: 10000,
    itemsOffered: ["Aspirin", "Ibuprofen", "Amoxicillin"],
    orders: [
      {
        id: "ORD001",
        date: "2023-04-15",
        deliveredDate: "2023-04-20",
        status: "Delivered",
        items: [
          {
            name: "Aspirin",
            type: "Tablet",
            expiryDate: "2025-04-15",
            unitPrice: 0.5,
            quantity: 1000,
            amountPaid : 400,
            discount: 5,
          },
          {
            name: "Ibuprofen",
            type: "Capsule",
            expiryDate: "2025-06-30",
            unitPrice: 0.75,
            quantity: 500,
            amountPaid : 300,
            discount: 3,
          }
        ],
        payments: [
          { id: "PAY001", amount: 400, date: "2023-04-15" },
          { id: "PAY002", amount: 300, date: "2023-04-16" },
        ],
      },
    ],
  },
  {
    id: "SID146",
    name: "MediCorp Supplies",
    lastPurchased: "2023-05-02",
    address: "456 Health Ave, Wellness, WT 67890",
    contactNumber: "+1 (555) 987-6543",
    email: "info@medicorpsupplies.com",
    totalPurchaseValue: 15000,
    itemsOffered: ["Paracetamol", "Omeprazole", "Metformin"],
    orders: [
      {
        id: "ORD003",
        date: "2023-05-02",
        deliveredDate: "2023-05-05",
        status: "Delivered",
        items: [
          {
            name: "Paracetamol",
            type: "Tablet",
            expiryDate: "2025-05-02",
            unitPrice: 0.3,
            quantity: 2000,
            discount: 2,
            amountPaid : 500,
          },
          {
            name: "Omeprazole",
            type: "Capsule",
            expiryDate: "2024-11-30",
            unitPrice: 1.2,
            quantity: 500,
            discount: 5,
            amountPaid : 500,
          }
        ],
        payments: [
          { id: "PAY003", amount: 500, date: "2023-05-02" },
          { id: "PAY004", amount: 500, date: "2023-05-03" },
        ],
      },
    ],
  },
]
