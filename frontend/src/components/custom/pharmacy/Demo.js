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